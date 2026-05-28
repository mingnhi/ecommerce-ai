import { Injectable } from '@nestjs/common';
import { CreateUserEventDto } from './dto/user-event.dto';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { UserEventType } from './dto/user-event.enum';
import { UserEvent } from '@entities/user-event.entity';
import { RecommendRequestDto } from './dto/recommendRequest.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { ProductEntity } from '@entities/product.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';


@Injectable()
export class UserEventService {
  constructor(
    private readonly em: EntityManager,
    private readonly httpService: HttpService,

    @InjectRepository(ProductEntity)
    private readonly productRepo: EntityRepository<ProductEntity>,

    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepo: EntityRepository<ProductVariantEntity>,
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

  private async getProductsForRecommend() {
    const products = await this.productRepo.findAll();
    const productIds = products.map((product: any) => product.id);
    const variants = await this.productVariantRepo.findAll();

    console.log('DB PRODUCTS:', products.length);
    console.log('DB VARIANTS:', variants.length);
    console.log('SAMPLE PRODUCT:', products[0]);
    console.log('SAMPLE VARIANT:', variants[0]);

    const mappedProducts = products.map((product: any) => {
      const productVariants = variants.filter((variant: any) => {
        const variantProductId =
          variant.productId?.id ??
          variant.productId ??
          variant.product?.id ??
          variant.product_id;

        return String(variantProductId) === String(product.id);
      });

      const prices = productVariants
        .map((variant: any) => Number(variant.price))
        .filter((price: number) => price > 0);

      const price =
        prices.length > 0
          ? Math.min(...prices)
          : Number(product.price);

      return {
        id: product.id,
        category_id:
          product.categoryId?.id ??
          product.categoryId ??
          product.category?.id ??
          product.category_id,
        price,
        name: product.name ?? product.title,
        image: product.thumbnail ?? product.image,
      };
    });

    console.log('MAPPED PRODUCTS BEFORE FILTER:', mappedProducts.length);
    console.log('SAMPLE MAPPED PRODUCT:', mappedProducts[0]);

    const validProducts = mappedProducts.filter(
      (item) => item.id && item.category_id && Number(item.price) > 0,
    );

    console.log('VALID PRODUCTS FOR FASTAPI:', validProducts.length);

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

  async recommend(
    userId: string,
    dto: RecommendRequestDto,
  ) {
    const products = await this.getProductsForRecommend();
    const payload = {
      user_id: userId,
      top_k: dto.top_k ?? 10,
      products,
    };

    console.log('FASTAPI PAYLOAD USER:', userId);
    console.log('FASTAPI PAYLOAD TOTAL PRODUCTS:', products.length);
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

    return response.data;
  }
}
