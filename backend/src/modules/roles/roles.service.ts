import { Permission } from '@entities/permissions.entity';
import { RolePermission } from '@entities/rolePermission.entity';
import { Role } from '@entities/roles.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: EntityRepository<RolePermission>,
    private readonly em: EntityManager
  ) {}

  async findAll() {
    return this.roleRepository.findAll({
      populate: ['rolePermissions.permission'],
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne(
      { id },
      {
        populate: ['rolePermissions.permission'],
      }
    );

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string) {
    return this.roleRepository.findOne({
      name,
    });
  }

  async create(dto: CreateRoleDto) {
    const existedRole = await this.findByName(dto.name);

    if (existedRole) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
    });

    await this.em.persistAndFlush(role);

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (dto.name && dto.name !== role.name) {
      const existedRole = await this.findByName(dto.name);

      if (existedRole) {
        throw new ConflictException('Role already exists');
      }

      role.name = dto.name;
    }

    if (dto.description !== undefined) {
      role.description = dto.description;
    }

    await this.em.flush();

    return role;
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    await this.em.removeAndFlush(role);

    return {
      message: 'Delete role success',
    };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.findOne(roleId);

    //xoá cái cũ

    const oldPermissions = await this.rolePermissionRepository.find({
      role: roleId,
    });

    await this.em.removeAndFlush(oldPermissions);

    //tạo mới

    for (const permissionId of permissionIds) {
      const permission = await this.permissionRepository.findOne({
        id: permissionId,
      });

      if (!permission) {
        continue;
      }

      const rolePermission = this.rolePermissionRepository.create({
        role,
        permission,
      });

      this.em.persist(rolePermission);
    }

    await this.em.flush();

    return {
      message: 'Assign permissions success',
    };
  }
}
