import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
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
import cloudinary from '@config/cloudinary.config';
import type { UploadApiResponse } from 'cloudinary';
import { JwtService } from './jwt.service';
import { RegisterDto } from '../dtos/register.dto';
import bcrypt from 'bcryptjs';
import { LoginDto } from '../dtos/login.dto';
import { MailService } from '../../mail/mail.service';
import { ResetPasswordDto } from '../../otp/dto/reset-password.dto';
import { OtpService } from '@modules/otp/otp.service';
import { UserStatus } from '@modules/users/use.enum';
import { User } from '@entities/user.entity';
import { UserProfile, Gender } from '@entities/userProfile.entity';
import { v4 as uuidv4 } from 'uuid';
import { GoogleProfile } from '../types/google-profile.type';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly userRolesService: UserRolesService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(UserProfile)
    private readonly profileRepository: EntityRepository<UserProfile>,
    private readonly em: EntityManager,
  ) { }

  private async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesService.findByUser(userId);

    return userRoles.map(userRole => userRole.role.name);
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesService.findByUser(userId);
    const keys = new Set<string>();

    for (const userRole of userRoles) {
      const role = await this.rolesService.findOne(userRole.role.id);

      role.rolePermissions.getItems().forEach(rolePermission => {
        const permission = rolePermission.permission;
        keys.add(`${permission.resource.toLowerCase()}:${permission.action}`);
      });
    }

    return [...keys];
  }

  private async signTokens(userId: string, email: string) {
    const roles = await this.getUserRoles(userId);

    const payload = {
      sub: userId,
      email,
      roles,
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);

    const refreshToken = await this.jwtService.generateRefreshToken({
      ...payload,
      type: 'refresh',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  private async createAuthPayload(user: User) {
    const roles = await this.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken({
      ...payload,
      type: 'refresh',
    });

    await this.usersService.patch(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  private async ensureUserRole(userId: string) {
    const roleUser = await this.rolesService.findByName('USER');
    if (!roleUser) throw new NotFoundException('Role USER not found');

    const userRoles = await this.userRolesService.findByUser(userId);
    if (!userRoles.some((ur) => ur.role.name === 'USER')) {
      await this.userRolesService.create({ userId, roleId: roleUser.id });
    }
  }

  private async fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const profile = (await res.json()) as GoogleProfile;
    if (!profile.email) {
      throw new UnauthorizedException('Google account has no email');
    }

    return profile;
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

    const roleUser = await this.rolesService.findByName('USER');

    if (!roleUser) {
      throw new NotFoundException('Role USER not found');
    }
    await this.userRolesService.create({
      userId: user.id,
      roleId: roleUser.id,
    });

    await this.otpService.sendRegisterOtp(user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        role: 'USER',
      },
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

    return this.createAuthPayload(user);
  }

  async googleLogin(accessToken: string) {
    const profile = await this.fetchGoogleProfile(accessToken);
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        passwordHash: await bcrypt.hash(uuidv4(), 10),
        fullName: profile.name,
        status: UserStatus.ACTIVE,
      });
      await this.ensureUserRole(user.id);
    } else {
      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Account is banned');
      }
      if (user.status === UserStatus.INACTIVE) {
        user = await this.usersService.patch(user.id, { status: UserStatus.ACTIVE });
      }
      await this.ensureUserRole(user.id);
      if (profile.name && !user.fullName) {
        user = await this.usersService.patch(user.id, { fullName: profile.name });
      }
    }

    return this.createAuthPayload(user);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.validateUser(userId);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.patch(user.id, {
      passwordHash,
      ...(dto.logoutAllSessions ? { refreshToken: null } : {}),
    });

    return { changed: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.resetPasswordOtp(dto.email, dto.otp);
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.patch(user.id, {
      passwordHash: hashedPassword,
      refreshToken: null,
    });

    return {
      status: 'success',
      message: 'Password reset successfully',
      meta: { timestamp: new Date().toISOString(), },
    };
  }
  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
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

    await this.usersService.patch(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }
  async logout(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.patch(userId, {
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
    const permissions = await this.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  async updateFullName(userId: string, fullName: string): Promise<void> {
    await this.usersService.patch(userId, { fullName });
  }

  async findProfileByUser(user: User): Promise<UserProfile | null> {
    return this.profileRepository.findOne({ user });
  }

  async upsertProfile(user: User, dto: UpdateProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({ user });

    if (!profile) {
      profile = this.profileRepository.create({ user });
    }

    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.address !== undefined) profile.address = dto.address;
    if (dto.gender !== undefined) profile.gender = dto.gender as Gender;
    if (dto.dateOfBirth !== undefined) {
      profile.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    }

    await this.em.persistAndFlush(profile);
    return profile;
  }

  async updateAvatar(user: User, file: Express.Multer.File): Promise<UserProfile> {
    if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
      throw new BadRequestException('Cloudinary chưa được cấu hình trên server');
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('File avatar không hợp lệ');
    }

    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'avatars', resource_type: 'image' }, (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'));
          else resolve(result);
        })
        .end(file.buffer);
    });

    let profile = await this.profileRepository.findOne({ user });
    if (!profile) {
      profile = this.profileRepository.create({ user });
    }

    profile.avatarUrl = uploaded.secure_url;
    await this.em.persistAndFlush(profile);
    return profile;
  }
}
