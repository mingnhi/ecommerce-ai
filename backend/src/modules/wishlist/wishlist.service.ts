import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Wishlist } from '@entities/wishlist.entity';
import { Product } from '@entities/product.entity';
import { ProductImage } from '@entities/product-image.entity';
import { Price } from '@entities/price.entity';

export interface WishlistItemDto {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  thumbnail?: string;
  currentPrice: string | null;
  createdAt: Date;
}

@Injectable()
export class WishlistService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Wishlist)
    private readonly repo: EntityRepository<Wishlist>,
  ) {}

  async list(userId: string): Promise<WishlistItemDto[]> {
    const items = await this.repo.find(
      { userId },
      { orderBy: { createdAt: QueryOrder.DESC } },
    );
    if (items.length === 0) return [];

    const productIds = items.map((w) => w.productId);
    const products = await this.em.find(
      Product,
      { id: { $in: productIds }, isDeleted: false },
      { populate: [] },
    );

    const now = new Date();
    const prices = await this.em.find(
      Price,
      {
        product: { id: { $in: productIds } },
        isActive: true,
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ],
      },
      { orderBy: { createdAt: QueryOrder.DESC }, populate: ['product'] },
    );
    const priceMap = new Map<string, string>();
    for (const p of prices) {
      const pid = p.product.id;
      if (!priceMap.has(pid)) priceMap.set(pid, p.price);
    }

    const images = await this.em.find(
      ProductImage,
      { product: { id: { $in: productIds } }, isThumbnail: true },
      { populate: ['product'] },
    );
    const thumbMap = new Map<string, string>();
    for (const img of images) {
      if (!thumbMap.has(img.product.id)) thumbMap.set(img.product.id, img.url);
    }

    const prodMap = new Map(products.map((p) => [p.id, p]));

    return items
      .map((w) => {
        const p = prodMap.get(w.productId);
        if (!p) return null;
        return {
          id: w.id,
          productId: w.productId,
          productName: p.name,
          slug: p.slug,
          thumbnail: thumbMap.get(p.id),
          currentPrice: priceMap.get(p.id) ?? null,
          createdAt: w.createdAt,
        } as WishlistItemDto;
      })
      .filter((x): x is WishlistItemDto => x !== null);
  }

  /** Trả danh sách productId — dùng FE check trạng thái heart hàng loạt. */
  async listProductIds(userId: string): Promise<string[]> {
    const items = await this.repo.find({ userId });
    return items.map((w) => w.productId);
  }

  async add(userId: string, productId: string): Promise<{ productId: string }> {
    const product = await this.em.findOne(Product, { id: productId, isDeleted: false });
    if (!product) throw new NotFoundException(`Product ${productId} không tồn tại`);

    const exists = await this.repo.findOne({ userId, productId });
    if (exists) throw new ConflictException('Sản phẩm đã có trong yêu thích');

    const w = this.repo.create({ userId, productId });
    await this.em.persistAndFlush(w);
    return { productId };
  }

  async remove(userId: string, productId: string): Promise<{ productId: string }> {
    const w = await this.repo.findOne({ userId, productId });
    if (!w) throw new NotFoundException('Không tìm thấy trong yêu thích');
    await this.em.removeAndFlush(w);
    return { productId };
  }
}
