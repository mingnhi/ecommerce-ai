import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProfileDto, UpdateUserProfileDto } from './dto/user-profile.dto';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserProfile } from '@entities/userProfile.entity';
import { User } from '@entities/user.entity';


@Injectable()
export class UserProfileService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(UserProfile)
    private readonly profileRepo: EntityRepository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
  ) { }
  async findOne(id: string) {
    const profile = await this.profileRepo.findOne(
      { id },
      { populate: ['user'] },
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  async findByUserId(userId: string) {
    const profile = await this.profileRepo.findOne(
      {
        user: userId,
      },
      {
        populate: ['user'],
      },
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  async create(userId: string, dto: CreateUserProfileDto) {
    const user = await this.userRepo.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existedProfile = await this.profileRepo.findOne({
      user: userId,
    });

    if (existedProfile) {
      throw new BadRequestException('User profile already exists');
    }

    const profile = this.profileRepo.create({
      user,
      phone: dto.phone,
      address: dto.address,
      avatarUrl: dto.avatarUrl,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
    });

    await this.em.persistAndFlush(profile);

    return profile;
  }

  async updateMe(userId: string, dto: UpdateUserProfileDto) {
    let profile = await this.profileRepo.findOne({
      user: userId,
    });

    if (!profile) {
      return this.create(userId, dto);
    }

    this.profileRepo.assign(profile, {
      phone: dto.phone,
      address: dto.address,
      avatarUrl: dto.avatarUrl,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
    });

    await this.em.flush();

    return profile;
  }

  async remove(id: string) {
    const profile = await this.profileRepo.findOne({ id });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    await this.em.removeAndFlush(profile);

    return {
      message: 'Delete user profile successfully',
    };
  }
}
