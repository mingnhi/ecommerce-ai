import { Permission } from '@entities/permissions.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,

    private readonly em: EntityManager,
  ) { }

  async findAll() {
    return this.permissionRepository.findAll({
      orderBy: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({ id });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async findByName(name: string) {
    return this.permissionRepository.findOne({ name });
  }

  async create(dto: CreatePermissionDto) {
    const existedPermission = await this.findByName(dto.name);

    if (existedPermission) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create({
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description,
    });

    await this.em.persistAndFlush(permission);

    return {
      message: 'Create permission success',
      data: permission,
    };
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.findOne(id);

    if (dto.name && dto.name !== permission.name) {
      const existedPermission = await this.findByName(dto.name);

      if (existedPermission) {
        throw new ConflictException('Permission already exists');
      }
    }

    Object.assign(permission, {
      name: dto.name ?? permission.name,
      resource: dto.resource ?? permission.resource,
      action: dto.action ?? permission.action,
      description: dto.description ?? permission.description,
    });

    await this.em.flush();

    return {
      message: 'Update permission success',
      data: permission,
    };
  }

  async remove(id: string) {
    const permission = await this.findOne(id);

    await this.em.removeAndFlush(permission);

    return {
      message: 'Delete permission success',
    };
  }
}