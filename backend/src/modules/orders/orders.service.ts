import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Lấy thông tin tất cả sản phẩm
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Một hoặc nhiều sản phẩm không tồn tại');
    }

    // Kiểm tra tồn kho
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm "${product?.name}" không đủ hàng`);
      }
    }

    // Tính tổng tiền và tạo đơn trong 1 transaction
    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems = dto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const price = Number(product.price);
        totalAmount += price * item.quantity;
        return { productId: item.productId, quantity: item.quantity, price };
      });

      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          address: dto.address as any,
          note: dto.note,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      // Trừ tồn kho
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Ghi hành vi PURCHASE cho AI
      await tx.userBehavior.createMany({
        data: dto.items.map((item) => ({
          userId,
          productId: item.productId,
          action: 'PURCHASE',
        })),
      });

      return newOrder;
    });

    return order;
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);
    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
