import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';

import { CartEntity } from '@entities/cart.entity';
import { CartItemEntity } from '@entities/cart-item.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';

import { CartStatus } from './enums/cart-status.enum';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import type { CartItemSnapshot, CartResponse } from './dto/cart.response';
import { InventoryService } from '@modules/inventory/inventory.service';

const MAX_QTY = 999;

@Injectable()
export class CartService {
  constructor(
    private readonly em: EntityManager,
    private readonly inventoryService: InventoryService,
  ) {}

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.findOrCreateActiveCart(this.em, userId);
    await this.em.populate(cart, ['items']);
    return this.buildCartResponse(this.em, cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    return this.em.transactional(async (em) => {
      const cart = await this.findOrCreateActiveCart(em, userId);
      await em.populate(cart, ['items']);

      const existing = cart.items
        .getItems()
        .find((i) => i.variantId === dto.variantId);

      const targetQty = Math.min(
        (existing?.quantity ?? 0) + dto.quantity,
        MAX_QTY,
      );

      // await this.assertStockAvailable(em, dto.variantId, targetQty);
      const priceAtTime = await this.resolveCurrentPrice(em, dto.variantId);

      if (existing) {
        existing.quantity = targetQty;
        existing.priceAtTime = priceAtTime;
        em.persist(existing);
      } else {
        const item = em.create(CartItemEntity, {
          cart,
          variantId: dto.variantId,
          quantity: targetQty,
          priceAtTime,
        });
        cart.items.add(item);
        em.persist(item);
      }

      await em.flush();
      await em.populate(cart, ['items']);
      return this.buildCartResponse(em, cart);
    });
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(
        CartItemEntity,
        { id: itemId },
        { populate: ['cart'] },
      );
      if (!item) throw new NotFoundException('Cart item not found');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item does not belong to this user');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart already checked out');
      }

      // await this.assertStockAvailable(em, item.variantId, dto.quantity);
      item.quantity = dto.quantity;
      item.priceAtTime = await this.resolveCurrentPrice(em, item.variantId);
      em.persist(item);
      await em.flush();
      await em.populate(item.cart, ['items']);
      return this.buildCartResponse(em, item.cart);
    });
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponse> {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(
        CartItemEntity,
        { id: itemId },
        { populate: ['cart'] },
      );
      if (!item) throw new NotFoundException('Cart item not found');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item does not belong to this user');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart already checked out');
      }

      const cart = item.cart;
      em.remove(item);
      await em.flush();
      await em.populate(cart, ['items']);
      return this.buildCartResponse(em, cart);
    });
  }

  async mergeGuestItems(
    userId: string,
    dto: MergeCartDto,
  ): Promise<CartResponse> {
    return this.em.transactional(async (em) => {
      const cart = await this.findOrCreateActiveCart(em, userId);
      await em.populate(cart, ['items']);

      for (const guestLine of dto.items) {
        if (guestLine.quantity <= 0) continue;

        try {
          const existing = cart.items
            .getItems()
            .find((item) => item.variantId === guestLine.variantId);

          // const available = await this.resolveAvailableStock(
          //   em,
          //   guestLine.variantId,
          // );
          const targetQty = Math.min(
            (existing?.quantity ?? 0) + guestLine.quantity,
            MAX_QTY,
          );
          if (targetQty <= 0) continue;

          const priceAtTime = await this.resolveCurrentPrice(
            em,
            guestLine.variantId,
          );

          if (existing) {
            existing.quantity = targetQty;
            existing.priceAtTime = priceAtTime;
            em.persist(existing);
          } else {
            const item = em.create(CartItemEntity, {
              cart,
              variantId: guestLine.variantId,
              quantity: targetQty,
              priceAtTime,
            });
            cart.items.add(item);
            em.persist(item);
          }
        } catch {
          continue;
        }
      }

      await em.flush();
      await em.populate(cart, ['items'], { refresh: true });
      return this.buildCartResponse(em, cart);
    });
  }

  async getActiveCartForCheckout(em: EntityManager, userId: string) {
    const cart = await em.findOne(
      CartEntity,
      { userId, status: CartStatus.ACTIVE },
      { populate: ['items'] },
    );
    if (!cart || cart.items.length === 0) {
      throw new ConflictException('Cart is empty');
    }
    return cart;
  }

  markCheckedOut(cart: CartEntity) {
    cart.status = CartStatus.CHECKED_OUT;
  }

  async resolveCurrentPriceFor(em: EntityManager, variantId: string) {
    return this.resolveCurrentPrice(em, variantId);
  }

  private async findOrCreateActiveCart(
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

  private async resolveAvailableStock(
    em: EntityManager,
    variantId: string,
  ): Promise<number> {
    const variant = await em.findOne(ProductVariantEntity, {
      id: variantId,
      isActive: true,
    });
    if (!variant) {
      throw new BadRequestException(`Variant ${variantId} not found`);
    }

    const inventoryAvailable = await this.inventoryService.getAvailable(
      em,
      variantId,
    );

    return Math.max(inventoryAvailable, variant.stock);
  }

  private async assertStockAvailable(
    _em: EntityManager,
    _variantId: string,
    _requested: number,
  ) {
    // Tạm tắt kiểm tra tồn kho — bật lại khi có nhập kho
    return;

    // const available = await this.resolveAvailableStock(em, variantId);
    // if (available < requested) {
    //   throw new ConflictException(
    //     `Insufficient stock for variant ${variantId}: need ${requested}, available ${available}`,
    //   );
    // }
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
      throw new BadRequestException(`Variant ${variantId} not found`);
    }
    if (!variant.product?.isActive) {
      throw new BadRequestException('Product is inactive');
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
        `Product ${variant.product.id} has no active price`,
      );
    }
    return Number(price.price);
  }

  private async resolveItemSnapshotMap(
    em: EntityManager,
    variantIds: string[],
  ): Promise<Map<string, CartItemSnapshot>> {
    const uniqueIds = [...new Set(variantIds)];
    if (uniqueIds.length === 0) return new Map();

    const variants = await em.find(
      ProductVariantEntity,
      { id: { $in: uniqueIds } },
      { populate: ['product'] },
    );

    return new Map(
      variants.map((variant) => {
        const product = variant.product;
        const thumbnail = variant.image ?? product?.thumbnail ?? null;
        return [
          variant.id,
          {
            productName: product?.name ?? '',
            variantLabel: variant.title || undefined,
            thumbnail,
          },
        ] as const;
      }),
    );
  }

  private async buildCartResponse(
    em: EntityManager,
    cart: CartEntity,
  ): Promise<CartResponse> {
    const items = cart.items.getItems();
    const variantIds = items.map((item) => item.variantId);

    const [unitPrices, snapshots] = await Promise.all([
      Promise.all(
        items.map((item) =>
          this.resolveCurrentPrice(em, item.variantId).catch(
            () => Number(item.priceAtTime),
          ),
        ),
      ),
      this.resolveItemSnapshotMap(em, variantIds),
    ]);

    const cartItems = items.map((item, index) => {
      const priceAtTime = unitPrices[index];
      const snapshot = snapshots.get(item.variantId);
      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtTime,
        subtotal: Number((priceAtTime * item.quantity).toFixed(2)),
        productName: snapshot?.productName ?? '',
        variantLabel: snapshot?.variantLabel,
        thumbnail: snapshot?.thumbnail ?? null,
      };
    });

    const total = Number(
      cartItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );

    return {
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      items: cartItems,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  }
}
