import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import type {
  AddressResponse,
  ProvinceResponse,
  WardResponse,
} from './dto/address.response';

@ApiTags('Address')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('provinces')
  async listProvinces(): Promise<ApiResponse<ProvinceResponse[]>> {
    const data = await this.addressService.listProvinces();
    return {
      status: 'success',
      message: 'Get provinces successfully',
      data,
    };
  }

  @Get('provinces/:provinceId/wards')
  async listWards(
    @Param('provinceId', ParseIntPipe) provinceId: number,
  ): Promise<ApiResponse<WardResponse[]>> {
    const data = await this.addressService.listWardsByProvince(provinceId);
    return {
      status: 'success',
      message: 'Get wards successfully',
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async list(@CurrentUser() user: JwtUser): Promise<ApiResponse<AddressResponse[]>> {
    const data = await this.addressService.listByUser(user.sub);
    return {
      status: 'success',
      message: 'Get addresses successfully',
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async getById(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<AddressResponse>> {
    const data = await this.addressService.getById(user.sub, id);
    return {
      status: 'success',
      message: 'Get address successfully',
      data,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateAddressDto,
  ): Promise<ApiResponse<AddressResponse>> {
    const data = await this.addressService.create(user.sub, dto);
    return {
      status: 'success',
      message: 'Create address successfully',
      data,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<ApiResponse<AddressResponse>> {
    const data = await this.addressService.update(user.sub, id, dto);
    return {
      status: 'success',
      message: 'Update address successfully',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<{ success: true }>> {
    const data = await this.addressService.remove(user.sub, id);
    return {
      status: 'success',
      message: 'Delete address successfully',
      data,
    };
  }
}
