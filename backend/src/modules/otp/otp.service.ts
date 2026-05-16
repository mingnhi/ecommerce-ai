// src/modules/otp/otp.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import * as bcrypt from 'bcrypt';

import { Otp, OtpType } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { CreateOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: EntityRepository<Otp>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,
  ) { }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(dto: CreateOtpDto) {
    const user = await this.userRepository.findOne({ email: dto.email});
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpRepository.nativeUpdate(
      {
        user,
        type: dto.type,
        isUsed: false,
      },
      { isUsed: true},
    );

    const otpCode = this.generateOtpCode();
    const otpHash = await bcrypt.hash(otpCode, 10);

    const otp = this.otpRepository.create({
      user,
      otpHash,
      type: dto.type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
    });

    await this.em.persistAndFlush(otp);

    return {
      email: user.email,
      type: dto.type,
      otp: otpCode, 
      expiresAt: otp.expiresAt,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userRepository.findOne({
      email: dto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpRepository.findOne(
      {
        user,
        type: dto.type,
        isUsed: false,
      },
      {
        orderBy: { createdAt: 'DESC'},
      },
    );

    if (!otp) {
      throw new BadRequestException('OTP not found or already used');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const isMatch = await bcrypt.compare(dto.otp, otp.otpHash);

    if (!isMatch) {
      throw new BadRequestException('Invalid OTP');
    }

    otp.isUsed = true;

    await this.em.flush();

    return {
      email: user.email,
      type: dto.type,
      verified: true,
    };
  }

  async removeExpiredOtps() {
    const result = await this.otpRepository.nativeDelete({
      expiresAt: {
        $lt: new Date(),
      },
    });

    return {
      deleted: result,
    };
  }
}