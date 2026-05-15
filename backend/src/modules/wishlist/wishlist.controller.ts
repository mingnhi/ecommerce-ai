import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@modules/auth/strategies/jwt.strategy';
import { WishlistService } from './wishlist.service';

class AddWishlistDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}

@ApiTags('Wishlist')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm yêu thích của user hiện tại' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.list(user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Chỉ trả danh sách productId — dùng FE highlight heart icon' })
  listIds(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listProductIds(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào yêu thích' })
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWishlistDto) {
    return this.service.add(user.id, dto.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Bỏ khỏi yêu thích' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.service.remove(user.id, productId);
  }
}
