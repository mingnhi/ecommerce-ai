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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';
import { CartResponse } from './dto/cart.response';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<CartResponse>> {
    const data = await this.cartService.getCart(user.sub);

    return {
      status: 'success',
      message: 'Get cart successfully',
      data,
    };
  }

  @Post('items')
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<CartResponse>> {
    const data = await this.cartService.addItem(user.sub, dto);

    return {
      status: 'success',
      message: 'Add item to cart successfully',
      data,
    };
  }

  @Patch('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<CartResponse>> {
    const data = await this.cartService.updateItem(user.sub, id, dto);

    return {
      status: 'success',
      message: 'Update cart item successfully',
      data,
    };
  }

  @Delete('items/:id')
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<CartResponse>> {
    const data = await this.cartService.removeItem(user.sub, id);

    return {
      status: 'success',
      message: 'Remove cart item successfully',
      data,
    };
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async merge(
    @Body() dto: MergeCartDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<CartResponse>> {
    const data = await this.cartService.mergeGuestItems(user.sub, dto);

    return {
      status: 'success',
      message: 'Merge cart successfully',
      data,
    };
  }
}
