import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@modules/auth/strategies/jwt.strategy';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '[S4-01] Xem giỏ hàng' })
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: '[S4-01] Thêm vào giỏ (merge nếu trùng variant)' })
  addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: '[S4-01] Cập nhật số lượng item' })
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '[S4-01] Xoá 1 item khỏi giỏ' })
  removeItem(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.removeItem(user.id, id);
  }

  @Post('merge')
  @ApiOperation({ summary: '[S4-02] Merge guest cart vào server cart' })
  merge(@Body() dto: MergeCartDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartService.merge(user.id, dto);
  }
}
