import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';

import { CartEntity } from '@entities/cart.entity';
import { CartItemEntity } from '@entities/cart-item.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';

import { CartStatus } from './enums/cart-status.enum';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CartLine, mergeCarts } from './domain/merge-carts';
import { InventoryService } from '@modules/inventory/inventory.service';

const MAX_QTY = 999;

@Injectable()
export class CartService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(CartEntity)
    private readonly cartRepo: EntityRepository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly itemRepo: EntityRepository<CartItemEntity>,
    private readonly inventoryService: InventoryService,
  ) {}

  // ---------- S4-01 ----------

  async getCart(userId: string) {
    const cart = await this.getOrCreateActiveCart(this.em, userId);
    await this.em.populate(cart, ['items']);
    return this.toDtoWithLivePrice(this.em, cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    return this.em.transactional(async (em) => {
      const cart = await this.getOrCreateActiveCart(em, userId);
      await em.populate(cart, ['items']);

      const existing = cart.items
        .getItems()
        .find((i) => i.variantId === dto.variantId);

      const targetQty = Math.min(
        (existing?.quantity ?? 0) + dto.quantity,
        MAX_QTY,
      );

      await this.assertStockAvailable(em, dto.variantId, targetQty);
      const priceAtTime = await this.resolveCurrentPrice(em, dto.variantId);

      if (existing) {
        existing.quantity = targetQty;
        existing.priceAtTime = priceAtTime;
        em.persist(existing);
      } else {
        em.persist(
          em.create(CartItemEntity, {
            cart,
            variantId: dto.variantId,
            quantity: targetQty,
            priceAtTime,
          }),
        );
      }
      await em.flush();
      await em.populate(cart, ['items']);
      return this.toDtoWithLivePrice(em, cart);
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(
        CartItemEntity,
        { id: itemId },
        { populate: ['cart'] },
      );
      if (!item) throw new NotFoundException('Không tìm thấy cart item');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item không thuộc user này');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart đã checkout, không thể chỉnh sửa');
      }

      await this.assertStockAvailable(em, item.variantId, dto.quantity);
      item.quantity = dto.quantity;
      item.priceAtTime = await this.resolveCurrentPrice(em, item.variantId);
      em.persist(item);
      await em.flush();
      await em.populate(item.cart, ['items']);
      return this.toDtoWithLivePrice(em, item.cart);
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(
        CartItemEntity,
        { id: itemId },
        { populate: ['cart'] },
      );
      if (!item) throw new NotFoundException('Không tìm thấy cart item');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item không thuộc user này');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart đã checkout, không thể chỉnh sửa');
      }

      const cart = item.cart;
      em.remove(item);
      await em.flush();
      await em.populate(cart, ['items']);
      return this.toDtoWithLivePrice(em, cart);
    });
  }

  // ---------- S4-02 ----------

  async merge(userId: string, dto: MergeCartDto) {
    return this.em.transactional(async (em) => {
      const cart = await this.getOrCreateActiveCart(em, userId);
      await em.populate(cart, ['items']);

      const serverLines: CartLine[] = cart.items.getItems().map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        priceAtTime: i.priceAtTime,
      }));
      const guestLines: CartLine[] = dto.items.map((g) => ({
        variantId: g.variantId,
        quantity: g.quantity,
      }));

      const merged = mergeCarts(serverLines, guestLines, {
        maxQuantity: MAX_QTY,
      });

      // Validate stock per merged line — cap to available, drop if 0.
      const validated: CartLine[] = [];
      for (const line of merged) {
        const available = await this.inventoryService.getAvailable(
          em,
          line.variantId,
        );
        const safe = Math.min(line.quantity, available);
        if (safe > 0) {
          validated.push({ ...line, quantity: safe });
        }
      }

      const byVariant = new Map(
        cart.items.getItems().map((i) => [i.variantId, i] as const),
      );

      for (const line of validated) {
        const existing = byVariant.get(line.variantId);
        const price =
          line.priceAtTime ??
          (await this.resolveCurrentPrice(em, line.variantId));
        if (existing) {
          existing.quantity = line.quantity;
          existing.priceAtTime = price;
          em.persist(existing);
          byVariant.delete(line.variantId);
        } else {
          em.persist(
            em.create(CartItemEntity, {
              cart,
              variantId: line.variantId,
              quantity: line.quantity,
              priceAtTime: price,
            }),
          );
        }
      }

      // Remaining server items not in merged result → removed (e.g. capped to 0).
      for (const stale of byVariant.values()) {
        em.remove(stale);
      }

      await em.flush();
      await em.populate(cart, ['items']);
      return this.toDtoWithLivePrice(em, cart);
    });
  }

  // ---------- internal API for OrderService ----------

  /**
   * Get active cart for checkout. Throws if empty.
   * Caller must be inside its own transaction.
   */
  async getActiveCartForCheckout(em: EntityManager, userId: string) {
    const cart = await em.findOne(
      CartEntity,
      { userId, status: CartStatus.ACTIVE },
      { populate: ['items'] },
    );
    if (!cart || cart.items.length === 0) {
      throw new ConflictException('Cart rỗng — không thể checkout');
    }
    return cart;
  }

  /** Mark cart as CHECKED_OUT. Caller persists. */
  markCheckedOut(cart: CartEntity) {
    cart.status = CartStatus.CHECKED_OUT;
    cart.checkedOutAt = new Date();
  }

  /** Public so Order service can refresh price at checkout time. */
  async resolveCurrentPriceFor(em: EntityManager, variantId: string) {
    return this.resolveCurrentPrice(em, variantId);
  }

  // ---------- helpers ----------

  private async getOrCreateActiveCart(
    em: EntityManager,
    userId: string,
  ): Promise<CartEntity> {
    let cart = await em.findOne(
      CartEntity,
      { userId, status: CartStatus.ACTIVE },
      { orderBy: { createdAt: QueryOrder.DESC } },
    );
    if (!cart) {
      cart = em.create(CartEntity, {
        userId,
        status: CartStatus.ACTIVE,
      });
      em.persist(cart);
      await em.flush();
    }
    return cart;
  }

  private async assertStockAvailable(
    em: EntityManager,
    variantId: string,
    requested: number,
  ) {
    const available = await this.inventoryService.getAvailable(em, variantId);
    if (available < requested) {
      throw new ConflictException(
        `Tồn kho không đủ cho variant ${variantId}: cần ${requested}, còn ${available}`,
      );
    }
  }

  private async resolveCurrentPrice(
    em: EntityManager,
    variantId: string,
  ): Promise<number> {
    const variant = await em.findOne(
      ProductVariantEntity,
      { id: variantId, isActive: true },
      { populate: ['product'] },
    );
    if (!variant) {
      throw new BadRequestException(`Variant ${variantId} không tồn tại`);
    }
    if (!variant.product?.isActive) {
      throw new BadRequestException('Product đã bị huỷ');
    }

    if (variant.price != null && variant.price > 0) {
      return Number(variant.price);
    }

    const price = await em.findOne(
      ProductPriceEntity,
      { product: variant.product.id, isActive: true },
      { orderBy: { createdAt: QueryOrder.DESC } },
    );
    if (!price) {
      throw new BadRequestException(
        `Product ${variant.product.id} chưa có giá active`,
      );
    }
    return Number(price.price);
  }

  private async toDtoWithLivePrice(em: EntityManager, cart: CartEntity) {
    const items = cart.items.getItems();
    const livePrices = await Promise.all(
      items.map((i) =>
        this.resolveCurrentPrice(em, i.variantId).catch(() => null),
      ),
    );

    const itemsDto = items.map((item, idx) => {
      const live = livePrices[idx] ?? Number(item.priceAtTime);
      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtTime: live,
        subtotal: Number((live * item.quantity).toFixed(2)),
      };
    });

    const total = Number(
      itemsDto.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
    );

    return {
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      items: itemsDto,
      total,
      itemCount: itemsDto.reduce((n, i) => n + i.quantity, 0),
    };
  }
}
