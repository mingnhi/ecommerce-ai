import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '[S4-01] Xem giỏ hàng (giá real-time)' })
  getCart(@CurrentUser() user: JwtUser) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @ApiOperation({
    summary: '[S4-01] Thêm vào giỏ (merge nếu trùng variant, cap qty ≤ 999)',
  })
  addItem(@Body() dto: AddCartItemDto, @CurrentUser() user: JwtUser) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: '[S4-01] Cập nhật số lượng item' })
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.cartService.updateItem(user.sub, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '[S4-01] Xoá 1 item khỏi giỏ' })
  removeItem(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.cartService.removeItem(user.sub, id);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[S4-02] Merge guest cart (localStorage) vào server cart',
  })
  merge(@Body() dto: MergeCartDto, @CurrentUser() user: JwtUser) {
    return this.cartService.merge(user.sub, dto);
  }
}
