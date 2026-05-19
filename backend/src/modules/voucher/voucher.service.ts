import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Voucher, VoucherDiscountType } from '@entities/voucher.entity';
import { CreateVoucherDto, UpdateVoucherDto } from './dto/create-voucher.dto';

export interface AppliedVoucher {
  voucherId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: string;
  /** VND amount actually deducted (đã apply min/max cap). */
  discountAmount: string;
}

@Injectable()
export class VoucherService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Voucher)
    private readonly repo: EntityRepository<Voucher>,
  ) {}

  // ---------- Admin CRUD ----------

  async listForAdmin(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const where: FilterQuery<Voucher> = {};
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.search) where.code = { $like: `%${params.search.toUpperCase()}%` };

    const [items, total] = await this.repo.findAndCount(where, {
      orderBy: { createdAt: QueryOrder.DESC },
      limit,
      offset: (page - 1) * limit,
    });
    return {
      items: items.map((v) => this.toDto(v)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const v = await this.repo.findOne({ id });
    if (!v) throw new NotFoundException(`Không tìm thấy voucher ${id}`);
    return this.toDto(v);
  }

  async create(dto: CreateVoucherDto) {
    const code = dto.code.toUpperCase();
    const exists = await this.repo.findOne({ code });
    if (exists) throw new ConflictException(`Voucher ${code} đã tồn tại`);

    this.validateDiscountValue(dto.discountType, dto.discountValue);

    const v = this.repo.create({
      code,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount ?? '0.00',
      maxDiscount: dto.maxDiscount,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      usageLimit: dto.usageLimit,
      usageCount: 0,
      isActive: dto.isActive ?? true,
    });
    await this.em.persistAndFlush(v);
    return this.toDto(v);
  }

  async update(id: string, dto: UpdateVoucherDto) {
    const v = await this.repo.findOne({ id });
    if (!v) throw new NotFoundException(`Không tìm thấy voucher ${id}`);

    if (dto.discountType !== undefined) v.discountType = dto.discountType;
    if (dto.discountValue !== undefined) v.discountValue = dto.discountValue;
    this.validateDiscountValue(v.discountType, v.discountValue);

    if (dto.description !== undefined) v.description = dto.description;
    if (dto.minOrderAmount !== undefined) v.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscount !== undefined) v.maxDiscount = dto.maxDiscount;
    if (dto.validFrom !== undefined)
      v.validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    if (dto.validUntil !== undefined)
      v.validUntil = dto.validUntil ? new Date(dto.validUntil) : undefined;
    if (dto.usageLimit !== undefined) v.usageLimit = dto.usageLimit;
    if (dto.isActive !== undefined) v.isActive = dto.isActive;

    await this.em.flush();
    return this.toDto(v);
  }

  async delete(id: string) {
    const v = await this.repo.findOne({ id });
    if (!v) throw new NotFoundException(`Không tìm thấy voucher ${id}`);
    await this.em.removeAndFlush(v);
    return { id };
  }

  // ---------- Public apply (validate + compute discount) ----------

  /**
   * Validate voucher cho subtotal hiện tại. Throw BadRequest nếu không hợp lệ.
   * KHÔNG decrement usageCount — chỉ tính trước cho UI ước lượng.
   */
  async previewDiscount(code: string, subtotal: string): Promise<AppliedVoucher> {
    const v = await this.findActiveByCode(code);
    this.assertUsable(v, subtotal);
    return {
      voucherId: v.id,
      code: v.code,
      discountType: v.discountType,
      discountValue: v.discountValue,
      discountAmount: this.computeDiscount(v, subtotal),
    };
  }

  /**
   * Internal API — gọi trong transaction order create. Validate + increment usageCount.
   * Caller phải đã lock voucher (hoặc nằm trong tx isolation đủ cao).
   */
  async applyAndConsumeWithinTx(
    em: EntityManager,
    code: string,
    subtotal: string,
  ): Promise<AppliedVoucher> {
    const v = await em.findOne(
      Voucher,
      { code: code.toUpperCase() },
      { lockMode: 'pessimistic_write' as never },
    );
    if (!v) throw new BadRequestException(`Voucher ${code} không tồn tại`);
    this.assertUsable(v, subtotal);

    const discountAmount = this.computeDiscount(v, subtotal);
    v.usageCount += 1;
    em.persist(v);

    return {
      voucherId: v.id,
      code: v.code,
      discountType: v.discountType,
      discountValue: v.discountValue,
      discountAmount,
    };
  }

  // ---------- helpers ----------

  private async findActiveByCode(code: string) {
    const v = await this.repo.findOne({ code: code.toUpperCase() });
    if (!v) throw new BadRequestException(`Voucher ${code} không tồn tại`);
    return v;
  }

  private assertUsable(v: Voucher, subtotalStr: string) {
    if (!v.isActive) throw new BadRequestException('Voucher đã ngừng hoạt động');
    const now = new Date();
    if (v.validFrom && v.validFrom > now)
      throw new BadRequestException('Voucher chưa đến ngày sử dụng');
    if (v.validUntil && v.validUntil < now)
      throw new BadRequestException('Voucher đã hết hạn');
    if (v.usageLimit !== undefined && v.usageLimit !== null && v.usageCount >= v.usageLimit)
      throw new BadRequestException('Voucher đã hết lượt sử dụng');

    const subtotal = Number(subtotalStr);
    const min = Number(v.minOrderAmount ?? '0');
    if (subtotal < min) {
      throw new BadRequestException(
        `Đơn tối thiểu ${min.toLocaleString('vi-VN')}đ để dùng mã này`,
      );
    }
  }

  private computeDiscount(v: Voucher, subtotalStr: string): string {
    const subtotal = Number(subtotalStr);
    const value = Number(v.discountValue);
    let amount = 0;

    if (v.discountType === VoucherDiscountType.PERCENT) {
      amount = (subtotal * value) / 100;
      if (v.maxDiscount) amount = Math.min(amount, Number(v.maxDiscount));
    } else {
      amount = value;
    }

    amount = Math.min(amount, subtotal);
    return amount.toFixed(2);
  }

  private validateDiscountValue(type: VoucherDiscountType, value: string) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0)
      throw new BadRequestException('discountValue phải > 0');
    if (type === VoucherDiscountType.PERCENT && n > 100)
      throw new BadRequestException('Discount PERCENT không quá 100%');
  }

  private toDto(v: Voucher) {
    return {
      id: v.id,
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderAmount: v.minOrderAmount,
      maxDiscount: v.maxDiscount,
      validFrom: v.validFrom,
      validUntil: v.validUntil,
      usageLimit: v.usageLimit,
      usageCount: v.usageCount,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }
}
