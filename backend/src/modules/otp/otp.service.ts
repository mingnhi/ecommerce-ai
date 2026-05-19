// src/modules/otp/otp.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Otp } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { CreateOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { OtpType } from './otp.enum';
import { UserStatus } from '@modules/users/use.enum';
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: EntityRepository<Otp>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,
    private readonly mailService: MailService,
  ) { }

  private generateOtpCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async createOtp(dto: CreateOtpDto) {
    const user = await this.userRepository.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpRepository.nativeUpdate(
      {
        user,
        type: dto.type,
        isUsed: false,
      },
      { isUsed: true },
    );

    const otpCode = this.generateOtpCode();

    const otp = this.otpRepository.create({
      user,
      otp: otpCode,
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
        orderBy: { createdAt: 'DESC' },
      },
    );

    if (!otp) {
      throw new BadRequestException('OTP not found or already used');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (Number(dto.otp) !== otp.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    otp.isUsed = true;

    await this.em.flush();

    return {
      user,
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

  async sendRegisterOtp(email: string) {
    const otpData = await this.createOtp({
      email,
      type: OtpType.REGISTER,
    });

    await this.mailService.sendOtpEmail(email, otpData.otp);

    return otpData;
  }

  async verifyRegisterOtp(dto: VerifyOtpDto) {
    const result = await this.verifyOtp({
      email: dto.email,
      otp: dto.otp,
      type: OtpType.REGISTER,
    });

    const user = result.user;
    user.status = UserStatus.ACTIVE;

    await this.em.flush();

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: UserStatus.ACTIVE,
      verified: true,
    };
  }

  async forgotPasswordOtp(email: string) {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      return {
        message: 'If this email exists, OTP has been sent',
      };
    }

    const otpData = await this.createOtp({
      email,
      type: OtpType.FORGOT_PASSWORD,
    });

    await this.mailService.sendResetPasswordOtp(
      user.email,
      otpData.otp,
    );

    return {
      message: 'If this email exists, OTP has been sent',
    };
  }

  async resetPasswordOtp(email: string, otp: number) {
    return this.verifyOtp({
      email,
      otp,
      type: OtpType.FORGOT_PASSWORD,
    });
  }

  async resendOtp(dto: CreateOtpDto) {
    const user = await this.userRepository.findOne({
      email: dto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpRepository.nativeUpdate(
      {
        user,
        type: dto.type,
        isUsed: false,
      },
      {
        isUsed: true,
      },
    );

    const otpData = await this.createOtp({
      email: dto.email,
      type: dto.type,
    });

    if (dto.type === OtpType.REGISTER) {
      await this.mailService.sendOtpEmail(
        user.email,
        otpData.otp,
      );
    }

    if (dto.type === OtpType.FORGOT_PASSWORD) {
      await this.mailService.sendResetPasswordOtp(
        user.email,
        otpData.otp,
      );
    }

    return {
      message: 'Resend OTP successfully',
      email: user.email,
      type: dto.type,
      expiresAt: otpData.expiresAt,
    };
  }
}