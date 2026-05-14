import { Permission } from '@entities/permissions.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/permission.dto';

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
    return this.permissionRepository.findOne({
      id,
    });
  }

  async findByName(name: string) {
    return this.permissionRepository.findOne({
      name,
    });
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
}
