import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@ApiTags('Order')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const data = await this.orderService.create(user.sub, dto);

    return {
      status: 'success',
      message: 'Create order successfully',
      data,
    };
  }

  @Post('bulk-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const data = await this.orderService.bulkUpdateStatus(
      user.sub,
      dto.orderIds,
      dto.status,
      dto.note,
    );

    return {
      status: 'success',
      message: 'Bulk update order status successfully',
      data,
    };
  }

  @Get()
  async list(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const isAdmin = await this.isAdmin(user.sub);
    const result = await this.orderService.list(user.sub, isAdmin, query);

    return {
      status: 'success',
      message: 'Get orders successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const isAdmin = await this.isAdmin(user.sub);
    const data = await this.orderService.getById(user.sub, isAdmin, id);

    return {
      status: 'success',
      message: 'Get order successfully',
      data,
    };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const data = await this.orderService.updateStatus(user.sub, id, dto);

    return {
      status: 'success',
      message: 'Update order status successfully',
      data,
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ApiResponse<any>> {
    const data = await this.orderService.cancelByUser(user.sub, id, dto?.note);

    return {
      status: 'success',
      message: 'Cancel order successfully',
      data,
    };
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const userRoles = await this.userRolesService.findByUser(userId);
    return userRoles.some(
      (ur) => ur.role?.name?.toUpperCase() === 'ADMIN',
    );
  }
}
