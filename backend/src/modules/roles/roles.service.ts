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
import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

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
  ) { }

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

  async getPermissionsByRoleIds(roleIds: string[]): Promise<string[]> {
    if (!roleIds.length) return [];

    const rolePermissions = await this.rolePermissionRepository.find(
      { role: roleIds },
      { populate: ['permission'] },
    );

    const keys = rolePermissions.map((item) => {
      const { resource, action } = item.permission;
      return `${resource.toLowerCase()}:${action}`;
    });

    return [...new Set(keys)];
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

  async assignPermissions(roleId: string, dto: AssignPermissionsDto) {
    const role = await this.roleRepository.findOne({
      id: roleId,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const addedPermissions: Permission[] = [];

    for (const permissionId of dto.permissionIds) {
      const permission =
        await this.permissionRepository.findOne({
          id: permissionId,
        });

      if (!permission) {
        throw new NotFoundException(
          `Permission with id ${permissionId} not found`,
        );
      }

      const existed =
        await this.rolePermissionRepository.findOne({
          role,
          permission,
        });

      if (existed) {
        continue;
      }

      const rolePermission =
        this.rolePermissionRepository.create({
          role,
          permission,
        });

      await this.em.persist(rolePermission);

      addedPermissions.push(permission);
    }

    await this.em.flush();

    return {
      message: 'Assign permissions to role success',
      role: {
        id: role.id,
        name: role.name,
      },
      permissions: addedPermissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
      })),
    };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const role = await this.roleRepository.findOne({ id: roleId });
    if (!role) {
      throw new NotFoundException(' Role not found');
    }

    const permission = await this.permissionRepository.findOne({ id: permissionId });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const rolePermission = await this.rolePermissionRepository.findOne({
      role,
      permission,
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission is not assigned to this role');
    }
    await this.em.removeAndFlush(rolePermission);

    return {
      message: 'Remove permission from role success',
      role: {
        id: role.id,
        name: role.name,
      },
      permission: {
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
      },
    };
  }
}
