import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Address } from '@entities/address.entity';
import { Users } from '@entities/user.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Address)
    private readonly addressRepo: EntityRepository<Address>,
  ) {}

  async listByUser(userId: string) {
    const items = await this.addressRepo.find(
      { user: { id: userId }, isDeleted: false },
      { orderBy: { isDefault: 'DESC', createdAt: 'DESC' } },
    );
    return items.map(toDto);
  }

  async getById(userId: string, id: string) {
    const address = await this.findOwnedAddress(userId, id);
    return toDto(address);
  }

  async create(userId: string, dto: CreateAddressDto) {
    return this.em.transactional(async (em) => {
      const user = await em.findOne(Users, { id: userId, isDeleted: false });
      if (!user) throw new NotFoundException('User không tồn tại');

      // Đếm xem user đã có address nào chưa — nếu chưa, address đầu tiên auto default
      const count = await em.count(Address, {
        user: { id: userId },
        isDeleted: false,
      });
      const shouldBeDefault = dto.isDefault === true || count === 0;

      if (shouldBeDefault) {
        await this.clearOtherDefaults(em, userId);
      }

      const address = em.create(Address, {
        user,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        ward: dto.ward,
        district: dto.district,
        province: dto.province,
        isDefault: shouldBeDefault,
        isDeleted: false,
      });
      em.persist(address);
      await em.flush();

      return toDto(address);
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    return this.em.transactional(async (em) => {
      const address = await em.findOne(Address, { id, isDeleted: false }, { populate: ['user'] });
      if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
      if (address.user.id !== userId) {
        throw new ForbiddenException('Không có quyền sửa địa chỉ này');
      }

      if (dto.isDefault === true && !address.isDefault) {
        await this.clearOtherDefaults(em, userId);
      }

      if (dto.fullName !== undefined) address.fullName = dto.fullName;
      if (dto.phone !== undefined) address.phone = dto.phone;
      if (dto.addressLine !== undefined) address.addressLine = dto.addressLine;
      if (dto.ward !== undefined) address.ward = dto.ward;
      if (dto.district !== undefined) address.district = dto.district;
      if (dto.province !== undefined) address.province = dto.province;
      if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;

      await em.flush();
      return toDto(address);
    });
  }

  async delete(userId: string, id: string) {
    return this.em.transactional(async (em) => {
      const address = await em.findOne(Address, { id, isDeleted: false }, { populate: ['user'] });
      if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
      if (address.user.id !== userId) {
        throw new ForbiddenException('Không có quyền xoá địa chỉ này');
      }

      const wasDefault = address.isDefault;
      address.isDeleted = true;
      address.isDefault = false;
      await em.flush();

      // Nếu vừa xoá default, set address mới nhất còn lại làm default
      if (wasDefault) {
        const remaining = await em.findOne(
          Address,
          { user: { id: userId }, isDeleted: false },
          { orderBy: { createdAt: 'DESC' } },
        );
        if (remaining) {
          remaining.isDefault = true;
          await em.flush();
        }
      }

      return { success: true };
    });
  }

  async setDefault(userId: string, id: string) {
    return this.em.transactional(async (em) => {
      const address = await em.findOne(Address, { id, isDeleted: false }, { populate: ['user'] });
      if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
      if (address.user.id !== userId) {
        throw new ForbiddenException('Không có quyền sửa địa chỉ này');
      }

      await this.clearOtherDefaults(em, userId);
      address.isDefault = true;
      await em.flush();

      return toDto(address);
    });
  }

  /** Helper cho module khác (vd Order): lấy default address của user */
  async findDefaultForUser(userId: string): Promise<Address | null> {
    return this.addressRepo.findOne({
      user: { id: userId },
      isDefault: true,
      isDeleted: false,
    });
  }

  // ---------- helpers ----------

  private async findOwnedAddress(userId: string, id: string): Promise<Address> {
    const address = await this.addressRepo.findOne(
      { id, isDeleted: false },
      { populate: ['user'] },
    );
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    if (address.user.id !== userId) {
      throw new ForbiddenException('Không có quyền truy cập địa chỉ này');
    }
    return address;
  }

  private async clearOtherDefaults(em: EntityManager, userId: string) {
    const others = await em.find(Address, {
      user: { id: userId },
      isDefault: true,
      isDeleted: false,
    });
    others.forEach((a) => {
      a.isDefault = false;
    });
    if (others.length > 0) await em.flush();
  }
}

function toDto(a: Address) {
  return {
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    addressLine: a.addressLine,
    ward: a.ward,
    district: a.district,
    province: a.province,
    isDefault: a.isDefault,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}
