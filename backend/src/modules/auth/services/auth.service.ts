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
import { MailService } from './mail.service';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

@Injectable()
export class AuthService {
    private otpStore = new Map<string, {
        otpHash: string;
        expiresAt: Date;
        fullName: string;
        password: string;
    }
    >();
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly userRolesService: UserRolesService,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService,
  ) {}

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
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otp, 10);
      this.otpStore.set(dto.email, {
          otpHash,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          fullName: dto.fullName,
          password: dto.password,
      });
      await this.mailService.sendOtpEmail(dto.email, otp);
      return {
          message: 'OTP sent to your email',
          email: dto.email,
      };
  }
    
    async verifyOtp(dto: VerifyOtpDto) {
        const storedOtp = this.otpStore.get(dto.email);

        if (!storedOtp) {
            throw new BadRequestException('OTP not found or expired');
        }

        if (storedOtp.expiresAt < new Date()) {
            this.otpStore.delete(dto.email);

            throw new BadRequestException('OTP expired');
        }

        const isOtpValid = await bcrypt.compare(
            dto.otp,
            storedOtp.otpHash,
        );

        if (!isOtpValid) {
            throw new UnauthorizedException('Invalid OTP');
        }

        const existedUser = await this.usersService.findByEmail(dto.email);

        if (existedUser) {
            this.otpStore.delete(dto.email);

            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(storedOtp.password, 10);

        const user = await this.usersService.create({
            email: dto.email,
            passwordHash: hashedPassword,
            fullName: storedOtp.fullName,
            status: UserStatus.ACTIVE,
        });

        const userRole = await this.rolesService.findByName('USER');

        if (!userRole) {
            throw new NotFoundException('USER role not found');
        }

        await this.userRolesService.create({
            userId: user.id,
            roleId: userRole.id,
        });

        this.otpStore.delete(dto.email);

        const { accessToken, refreshToken } = await this.signTokens(
            user.id,
            user.email,
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.usersService.update(user.id, {
            refreshToken: hashedRefreshToken,
        });

        return {
            message: 'Register success',
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
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (
      user.status === UserStatus.INACTIVE ||
      user.status === UserStatus.BANNED
    ) {
      throw new UnauthorizedException('Account inactive');
    }

    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.email
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
      lastLoginAt: new Date(),
    });

    const roles = await this.getUserRoles(user.id);

    return {
      message: 'Login success',

      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles,
      },

      accessToken,
      refreshToken,
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
