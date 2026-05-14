import { Role } from '@entities/roles.entity';
import { User } from '@entities/user.entity';
import { UserRole } from '@entities/userRoles.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserRoleDto } from './dto/user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: EntityRepository<UserRole>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,

    private readonly em: EntityManager
  ) {}
  async findAll() {
    return this.userRoleRepository.findAll({
      populate: ['user', 'role'],
    });
  }

  async findOne(id: string) {
    const userRole = await this.userRoleRepository.findOne(
      { id },
      {
        populate: ['user', 'role'],
      }
    );

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    return userRole;
  }

  async findByUser(userId: string) {
    return this.userRoleRepository.find(
      {
        user: userId,
      },
      {
        populate: ['role'],
      }
    );
  }

  async create(dto: CreateUserRoleDto) {
    const user = await this.userRepository.findOne({
      id: dto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      id: dto.roleId,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existed = await this.userRoleRepository.findOne({
      user: dto.userId,
      role: dto.roleId,
    });

    if (existed) {
      throw new ConflictException('Role already assigned');
    }

    const userRole = this.userRoleRepository.create({
      user,
      role,
    });

    await this.em.persistAndFlush(userRole);

    return userRole;
  }

  async remove(id: string) {
    const userRole = await this.findOne(id);

    await this.em.removeAndFlush(userRole);

    return {
      message: 'Delete user role success',
    };
  }
  async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.userRepository.findOne({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRoles = await this.userRoleRepository.find({
      user: userId,
    });

    await this.em.removeAndFlush(oldRoles);

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findOne({
        id: roleId,
      });

      if (!role) continue;

      const userRole = this.userRoleRepository.create({
        user,
        role,
      });

      this.em.persist(userRole);
    }

    await this.em.flush();

    return {
      message: 'Assign roles success',
    };
  }
}
