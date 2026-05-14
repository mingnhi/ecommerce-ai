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

  async create(data:Partial<User>) {
    const existedUser =
      await this.findByEmail(data.email);

    if (existedUser) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.passwordHash,
      10,
    );

    const user = this.userRepository.create({
      email: data.email,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      status: data.status || UserStatus.ACTIVE,
    });

    await this.em.persistAndFlush(user);

    return user;
  }

  async update(
    id: string,
    data: Partial<User>,
  ) {
    const user = await this.findOne(id);

    Object.assign(user, data);

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
