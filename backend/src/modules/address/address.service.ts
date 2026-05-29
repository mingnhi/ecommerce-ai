import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Address } from '@entities/address.entity';
import { Province } from '@entities/province.entity';
import { Ward } from '@entities/ward.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import type {
  AddressResponse,
  ProvinceResponse,
  WardResponse,
} from './dto/address.response';

@Injectable()
export class AddressService {
  constructor(private readonly em: EntityManager) {}

  async listProvinces(): Promise<ProvinceResponse[]> {
    const provinces = await this.em.find(Province, {}, { orderBy: { name: 'ASC' } });
    return provinces.map((province) => this.toProvinceResponse(province));
  }

  async listWardsByProvince(provinceId: number): Promise<WardResponse[]> {
    const wards = await this.em.find(
      Ward,
      { provinceId },
      { orderBy: { name: 'ASC' } },
    );
    return wards.map((ward) => this.toWardResponse(ward));
  }

  async listByUser(userId: string): Promise<AddressResponse[]> {
    const items = await this.em.find(
      Address,
      { userId, isDeleted: false },
      { orderBy: { createdAt: 'DESC' } },
    );
    return Promise.all(items.map((item) => this.buildAddressResponse(this.em, item)));
  }

  async getById(userId: string, id: string): Promise<AddressResponse> {
    const address = await this.findOwnedAddress(userId, id);
    return this.buildAddressResponse(this.em, address);
  }

  async create(userId: string, dto: CreateAddressDto): Promise<AddressResponse> {
    return this.em.transactional(async (em) => {
      await this.assertLocationValid(em, dto.provinceId, dto.wardId);

      const address = em.create(Address, {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        provinceId: dto.provinceId,
        wardId: dto.wardId,
        type: dto.type,
        isDeleted: false,
      });
      em.persist(address);
      await em.flush();

      return this.buildAddressResponse(em, address);
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponse> {
    return this.em.transactional(async (em) => {
      const address = await this.findOwnedAddress(userId, id, em);

      if (dto.provinceId !== undefined || dto.wardId !== undefined) {
        const provinceId = dto.provinceId ?? address.provinceId;
        const wardId = dto.wardId ?? address.wardId;
        await this.assertLocationValid(em, provinceId, wardId);
        address.provinceId = provinceId;
        address.wardId = wardId;
      }

      if (dto.fullName !== undefined) address.fullName = dto.fullName;
      if (dto.phone !== undefined) address.phone = dto.phone;
      if (dto.addressLine !== undefined) address.addressLine = dto.addressLine;
      if (dto.type !== undefined) address.type = dto.type;

      await em.flush();
      return this.buildAddressResponse(em, address);
    });
  }

  async remove(userId: string, id: string): Promise<{ success: true }> {
    return this.em.transactional(async (em) => {
      const address = await this.findOwnedAddress(userId, id, em);
      address.isDeleted = true;
      await em.flush();
      return { success: true };
    });
  }

  private async findOwnedAddress(
    userId: string,
    id: string,
    em: EntityManager = this.em,
  ): Promise<Address> {
    const address = await em.findOne(Address, { id, isDeleted: false });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) {
      throw new ForbiddenException('Address does not belong to this user');
    }
    return address;
  }

  private async assertLocationValid(
    em: EntityManager,
    provinceId: number,
    wardId: number,
  ) {
    const [province, ward] = await Promise.all([
      em.findOne(Province, { id: provinceId }),
      em.findOne(Ward, { id: wardId }),
    ]);

    if (!province) {
      throw new BadRequestException('Province not found');
    }
    if (!ward) {
      throw new BadRequestException('Ward not found');
    }
    if (ward.provinceId !== provinceId) {
      throw new BadRequestException('Ward does not belong to province');
    }
  }

  private async buildAddressResponse(
    em: EntityManager,
    address: Address,
  ): Promise<AddressResponse> {
    const [province, ward] = await Promise.all([
      em.findOne(Province, { id: address.provinceId }),
      em.findOne(Ward, { id: address.wardId }),
    ]);

    if (!province || !ward) {
      throw new NotFoundException('Province or ward not found');
    }

    return {
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      provinceId: address.provinceId,
      wardId: address.wardId,
      type: address.type,
      province: this.toProvinceResponse(province),
      ward: this.toWardResponse(ward),
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  private toProvinceResponse(province: Province): ProvinceResponse {
    return {
      id: province.id,
      name: province.name ?? null,
      nameSlug: province.nameSlug ?? null,
      fullName: province.fullName ?? null,
      type: province.type ?? null,
    };
  }

  private toWardResponse(ward: Ward): WardResponse {
    return {
      id: ward.id,
      provinceId: ward.provinceId,
      name: ward.name ?? null,
      slug: ward.slug ?? null,
      type: ward.type ?? null,
      nameWithType: ward.nameWithType ?? null,
      path: ward.path ?? null,
      pathWithType: ward.pathWithType ?? null,
    };
  }
}
