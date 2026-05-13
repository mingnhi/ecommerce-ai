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
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart-item.entity';
import { Inventory } from '@entities/inventory.entity';
import { ProductVariant } from '@entities/product-variant.entity';
import { CartStatus } from './enums/cart-status.enum';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { mergeCarts, CartLine } from './domain/merge-carts';
import { PriceService } from '@modules/price/price.service';

const MAX_QTY = 999;

@Injectable()
export class CartService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Cart)
    private readonly cartRepo: EntityRepository<Cart>,
    @InjectRepository(CartItem)
    private readonly itemRepo: EntityRepository<CartItem>,
    private readonly priceService: PriceService,
  ) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateActiveCart(this.em, userId);
    await this.em.populate(cart, ['items']);
    return this.toDto(cart);
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

      const priceAtTime = await this.resolvePrice(em, dto.variantId);

      if (existing) {
        existing.quantity = targetQty;
        existing.priceAtTime = priceAtTime;
        em.persist(existing);
      } else {
        const item = em.create(CartItem, {
          cart,
          variantId: dto.variantId,
          quantity: targetQty,
          priceAtTime,
        });
        em.persist(item);
      }
      await em.flush();

      await em.populate(cart, ['items']);
      return this.toDto(cart);
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(CartItem, { id: itemId }, { populate: ['cart'] });
      if (!item) throw new NotFoundException('Không tìm thấy cart item');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item không thuộc về user này');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart đã checkout, không thể chỉnh sửa');
      }

      await this.assertStockAvailable(em, item.variantId, dto.quantity);

      item.quantity = dto.quantity;
      item.priceAtTime = await this.resolvePrice(em, item.variantId);
      em.persist(item);
      await em.flush();

      await em.populate(item.cart, ['items']);
      return this.toDto(item.cart);
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(CartItem, { id: itemId }, { populate: ['cart'] });
      if (!item) throw new NotFoundException('Không tìm thấy cart item');
      if (item.cart.userId !== userId) {
        throw new ForbiddenException('Cart item không thuộc về user này');
      }
      if (item.cart.status !== CartStatus.ACTIVE) {
        throw new ConflictException('Cart đã checkout, không thể chỉnh sửa');
      }

      const cart = item.cart;
      em.remove(item);
      await em.flush();
      await em.populate(cart, ['items']);
      return this.toDto(cart);
    });
  }

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

      const merged = mergeCarts(serverLines, guestLines, { maxQuantity: MAX_QTY });

      // Validate stock cho từng line đã merge — line nào fail thì cap về stock available
      const validated: CartLine[] = [];
      for (const line of merged) {
        const available = await this.getAvailableStock(em, line.variantId);
        const safeQty = Math.min(line.quantity, available);
        if (safeQty > 0) {
          validated.push({ ...line, quantity: safeQty });
        }
      }

      // Reconcile: existing items theo variantId
      const byVariant = new Map(
        cart.items.getItems().map((i) => [i.variantId, i]),
      );

      for (const line of validated) {
        const existing = byVariant.get(line.variantId);
        const price =
          line.priceAtTime ?? (await this.resolvePrice(em, line.variantId));
        if (existing) {
          existing.quantity = line.quantity;
          existing.priceAtTime = price;
          em.persist(existing);
          byVariant.delete(line.variantId);
        } else {
          em.persist(
            em.create(CartItem, {
              cart,
              variantId: line.variantId,
              quantity: line.quantity,
              priceAtTime: price,
            }),
          );
        }
      }

      // Items còn lại trong byVariant = bị remove sau khi cap (qty=0 do hết stock)
      for (const stale of byVariant.values()) {
        em.remove(stale);
      }

      await em.flush();
      await em.populate(cart, ['items']);
      return this.toDto(cart);
    });
  }

  // ---------- internal API cho OrderService ----------

  /** Dùng trong S5-01 createOrder — lấy cart active của user, lock. */
  async getActiveCartForCheckout(em: EntityManager, userId: string) {
    const cart = await em.findOne(
      Cart,
      { userId, status: CartStatus.ACTIVE },
      { populate: ['items'] },
    );
    if (!cart || cart.items.length === 0) {
      throw new ConflictException('Cart rỗng — không thể checkout');
    }
    return cart;
  }

  /** Đánh dấu cart đã checkout, lưu cùng transaction caller. */
  markCheckedOut(cart: Cart) {
    cart.status = CartStatus.CHECKED_OUT;
    cart.checkedOutAt = new Date();
  }

  // ---------- helpers ----------

  private async getOrCreateActiveCart(
    em: EntityManager,
    userId: string,
  ): Promise<Cart> {
    let cart = await em.findOne(
      Cart,
      { userId, status: CartStatus.ACTIVE },
      { orderBy: { createdAt: QueryOrder.DESC } },
    );
    if (!cart) {
      cart = em.create(Cart, {
        userId,
        status: CartStatus.ACTIVE,
      });
      em.persist(cart);
      await em.flush();
    }
    return cart;
  }

  private async getAvailableStock(
    em: EntityManager,
    variantId: string,
  ): Promise<number> {
    const inv = await em.findOne(Inventory, { variantId });
    return inv?.available ?? 0;
  }

  private async assertStockAvailable(
    em: EntityManager,
    variantId: string,
    requested: number,
  ) {
    const available = await this.getAvailableStock(em, variantId);
    if (available < requested) {
      throw new ConflictException(
        `Tồn kho không đủ cho variant ${variantId}: cần ${requested}, còn ${available}`,
      );
    }
  }

  private async resolvePrice(
    em: EntityManager,
    variantId: string,
  ): Promise<string> {
    const variant = await em.findOne(
      ProductVariant,
      { id: variantId, isDeleted: false },
      { populate: ['product'] },
    );
    if (!variant) {
      throw new BadRequestException(`Variant ${variantId} không tồn tại`);
    }
    if (variant.product.isDeleted) {
      throw new BadRequestException('Product đã bị xoá');
    }
    const price = await this.priceService.getCurrentPriceFor(variant.product.id);
    if (!price) {
      throw new BadRequestException(
        `Product ${variant.product.id} chưa có giá active`,
      );
    }
    return price;
  }

  private toDto(cart: Cart) {
    const items = cart.items.getItems().map((i) => ({
      id: i.id,
      variantId: i.variantId,
      quantity: i.quantity,
      priceAtTime: i.priceAtTime,
      subtotal: (Number(i.priceAtTime) * i.quantity).toFixed(2),
    }));
    const total = items
      .reduce((sum, i) => sum + Number(i.subtotal), 0)
      .toFixed(2);

    return {
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      items,
      total,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
    };
  }
}
