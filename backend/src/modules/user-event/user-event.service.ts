import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { CreateUserEventDto } from './dto/user-event.dto';
import { UserEventType } from './dto/user-event.enum';
import { RecommendRequestDto } from './dto/recommendRequest.dto';

import { UserEvent } from '@entities/user-event.entity';
import { ProductEntity } from '@entities/product.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';

@Injectable()
export class UserEventService {
  constructor(
    private readonly em: EntityManager,
    private readonly httpService: HttpService,

    @InjectRepository(ProductEntity)
    private readonly productRepo: EntityRepository<ProductEntity>,

    @InjectRepository(ProductPriceEntity)
    private readonly productPriceRepo: EntityRepository<ProductPriceEntity>,
  ) { }

  private getScore(eventType: UserEventType) {
    switch (eventType) {
      case UserEventType.VIEW:
        return 1;
      case UserEventType.CLICK:
        return 2;
      case UserEventType.ADD_TO_CART:
        return 3;
      case UserEventType.REVIEW:
        return 4;
      case UserEventType.PURCHASE:
        return 5;
      default:
        return 1;
    }
  }

  private getProductIdFromPrice(price: any) {
    return (
      price.product?.id ??
      price.productId?.id ??
      price.productId ??
      price.product_id
    );
  }

  private getValidPriceForProduct(productId: string, prices: any[]) {
    const now = new Date();

    const productPrices = prices.filter((item: any) => {
      const priceProductId = this.getProductIdFromPrice(item);

      const isSameProduct = String(priceProductId) === String(productId);
      const isActive = item.isActive ?? item.is_active ?? true;

      const startAt = item.startAt ?? item.start_at;
      const endAt = item.endAt ?? item.end_at;

      const isStarted = !startAt || new Date(startAt) <= now;
      const isNotEnded = !endAt || new Date(endAt) >= now;

      return isSameProduct && isActive && isStarted && isNotEnded;
    });

    if (!productPrices.length) return 0;

    productPrices.sort((a: any, b: any) => {
      const bDate = new Date(b.updatedAt ?? b.updated_at ?? b.createdAt ?? b.created_at).getTime();
      const aDate = new Date(a.updatedAt ?? a.updated_at ?? a.createdAt ?? a.created_at).getTime();

      return bDate - aDate;
    });

    const latestPrice = productPrices[0];

    return Number(
      latestPrice.price ??
      latestPrice.originalPrice ??
      latestPrice.original_price ??
      0,
    );
  }

  private async getProductsForRecommend() {
    const products = await this.productRepo.findAll({
      populate: ['category'],
    });

    const prices = await this.productPriceRepo.findAll();

    const mappedProducts = products.map((product: any) => {
      const categoryId =
        product.category?.id ??
        product.categoryId?.id ??
        product.categoryId ??
        product.category_id;

      const price = this.getValidPriceForProduct(product.id, prices);

      console.log({
        productId: product.id,
        name: product.name,
        categoryId,
        price,
      });

      return {
        id: product.id,
        category_id: categoryId,
        price,
        name: product.name ?? product.title,
        image: product.thumbnail ?? product.image,
        slug: product.slug,
      };
    });

    const validProducts = mappedProducts.filter(
      (item) => item.id && item.category_id && Number(item.price) > 0,
    );

    return validProducts;
  }

  async create(userId: string, dto: CreateUserEventDto) {
    const event = this.em.create(UserEvent, {
      userId,
      productId: dto.productId,
      categoryId: dto.categoryId,
      price: dto.price,
      eventType: dto.eventType,
      score: this.getScore(dto.eventType),
    });

    await this.em.persistAndFlush(event);
    return event;
  }

  async recommend(userId: string, dto: RecommendRequestDto) {
    const products = await this.getProductsForRecommend();

    const payload = {
      user_id: userId,
      top_k: dto.top_k ?? 10,
      products: products.map((item) => ({
        id: item.id,
        category_id: item.category_id,
        price: item.price,
      })),
    };
    const response = await firstValueFrom(
      this.httpService.post(
        'http://127.0.0.1:8000/api/v1/recommend/',
        payload,
        {
          headers: {
            'X-API-KEY': 'key-recommend',
          },
        },
      ),
    );

    const fastApiData = response.data.data;
    const recommendItems = fastApiData.recommendations ?? [];

    const scoreMap = new Map(
      recommendItems.map((item: any) => [item.product_id, item.score]),
    );

    const recommendIds = recommendItems.map((item: any) => item.product_id);

    const fullProducts = recommendIds
      .map((id: string) => {
        const product = products.find((item) => String(item.id) === String(id));

        if (!product) return null;

        return {
          ...product,
          recommendScore: scoreMap.get(id),
        };
      })
      .filter(Boolean);

    return {
      user_id: fastApiData.user_id,
      cold_start: fastApiData.cold_start,
      total_products: fastApiData.total_products,
      recommendations: fullProducts,
    };
  }
}