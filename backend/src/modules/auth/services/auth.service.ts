import { RolesService } from '@modules/roles/roles.service';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { UsersService } from '@modules/users/users.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RegisterDto } from '../dtos/register.dto';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@entities/user.entity';
import { LoginDto } from '../dtos/login.dto';
import { MailService } from '../../mail/mail.service';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { OtpService } from '@modules/otp/otp.service';
import { OtpType } from '@entities/otp.entity';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, {
    otpHash: string;
    expiresAt: Date;
    fullName: string;
    password: string;
  }
  >();

  private resetPasswordOtpStore = new Map<string, {
    otpHash: string;
    expiresAt: Date;
  }>();
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly userRolesService: UserRolesService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  private async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesService.findByUser(userId);

    return userRoles.map(userRole => userRole.role.name);
  }

  private async signTokens(userId: string, email: string) {
    const roles = await this.getUserRoles(userId);

    const payload = {
      sub: userId,
      email,
      roles,
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);

    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  async register(dto: RegisterDto) {
    const exist = await this.usersService.findByEmail(dto.email);

    if (exist) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      status: UserStatus.INACTIVE,
    });

    const otpData = await this.otpService.createOtp({
      email: user.email,
      type: OtpType.REGISTER,
    });

    await this.mailService.sendOtpEmail(user.email, otpData.otp);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
      },
      message: 'OTP has been sent to your email',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.verifyOtp({
      email: dto.email,
      otp: dto.otp,
      type: OtpType.REGISTER,
    });

    user.status = UserStatus.ACTIVE;

    await this.usersService.update(user.id, {
      status: UserStatus.ACTIVE,
    });

    return {
      id: user.id,
      email: user.email,
      status: UserStatus.ACTIVE,
      verified: true,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordMatch = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);

    const refreshToken = await this.jwtService.generateRefreshToken({
      ...payload,
      type: 'refresh',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return {
        message: 'If this email exists, OTP has been sent',
      };
    }

    const otpData = await this.otpService.createOtp({
      email: user.email,
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

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.verifyOtp({
      email: dto.email,
      otp: dto.otp,
      type: OtpType.FORGOT_PASSWORD,
    });

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.update(user.id, {
      passwordHash: hashedPassword,
      refreshToken: null,
    });

    return {
      message: 'Reset password success',
    };
  }
  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const match = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.signTokens(user.id, user.email);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }
  async logout(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(userId, {
      refreshToken: null,
    });

    return {
      message: 'Logout success',
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.getUserRoles(user.id);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
