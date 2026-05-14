import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@modules/auth/strategies/jwt.strategy';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('Address')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Liệt kê địa chỉ của user hiện tại' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.addressService.listByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy 1 địa chỉ theo id' })
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.addressService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo địa chỉ mới (nếu là address đầu tiên → auto default)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    return this.addressService.create(user.id, dto);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cập nhật địa chỉ' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Xoá địa chỉ (soft delete)' })
  delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.addressService.delete(user.id, id);
  }

  @Post(':id/default')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set địa chỉ này làm mặc định' })
  setDefault(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.addressService.setDefault(user.id, id);
  }
}
