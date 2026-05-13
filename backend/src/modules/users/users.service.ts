import { User, UserStatus } from '@entities/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,
  ) { }

  async findAll() {
    return this.userRepository.findAll({
      fields: [
        'id',
        'email',
        'fullName',
        'status',
        'createdAt',
      ],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      email,
    });
  }

  async create(dto: CreateUserDto) {
    const existedUser =
      await this.findByEmail(dto.email);

    if (existedUser) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      status: dto.status || UserStatus.ACTIVE,
    });

    await this.em.persistAndFlush(user);

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.findOne(id);

    if (
      dto.email &&
      dto.email !== user.email
    ) {
      const existedUser =
        await this.findByEmail(dto.email);

      if (existedUser) {
        throw new ConflictException(
          'Email already exists',
        );
      }

      user.email = dto.email;
    }

    if (dto.password) {
      user.passwordHash =
        await bcrypt.hash(dto.password, 10);
    }


    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    await this.em.flush();

    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.em.removeAndFlush(user);

    return {
      message: 'Delete user success',
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.findOne(id);

    user.status = dto.status;

    await this.em.flush();

    return {
      message: 'Update status success',
      user,
    };
  }
}
