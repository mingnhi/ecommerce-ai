import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationsService {
  private readonly aiUrl: string;

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.aiUrl = this.config.get<string>('ai.serviceUrl') ?? 'http://recommendation:8000';
  }

  // Gợi ý cho người dùng đã đăng nhập
  async getForUser(userId: string, limit = 10) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.aiUrl}/recommend/user/${userId}`, {
          params: { limit },
          timeout: 3000,
        }),
      );
      const productIds: string[] = res.data.product_ids ?? [];
      if (!productIds.length) return this.getPopular(limit);

      return this.prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { category: { select: { id: true, name: true } } },
      });
    } catch {
      // Nếu AI service lỗi → fallback về sản phẩm phổ biến
      return this.getPopular(limit);
    }
  }

  // Sản phẩm tương tự
  async getSimilar(productId: string, limit = 6) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.aiUrl}/recommend/similar/${productId}`, {
          params: { limit },
          timeout: 3000,
        }),
      );
      const productIds: string[] = res.data.product_ids ?? [];
      if (!productIds.length) return this.getSameCategory(productId, limit);

      return this.prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true, NOT: { id: productId } },
      });
    } catch {
      return this.getSameCategory(productId, limit);
    }
  }

  // Sản phẩm phổ biến (fallback)
  private async getPopular(limit: number) {
    const popular = await this.prisma.userBehavior.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const ids = popular.map((p) => p.productId);
    return this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  private async getSameCategory(productId: string, limit: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return [];
    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, NOT: { id: productId } },
      take: limit,
    });
  }
}
