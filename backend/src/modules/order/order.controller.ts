import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { AuthenticatedUser } from '@modules/auth/strategies/jwt.strategy';

@ApiTags('Order')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '[S5-01] Tạo đơn hàng (atomic transaction)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orderService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: '[S5-02/03] Danh sách đơn hàng (auto-scope theo role)',
  })
  list(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.list(user.id, this.isAdmin(user), query);
  }

  @Get(':id')
  @ApiOperation({ summary: '[S5-02] Chi tiết đơn hàng' })
  getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.getById(user.id, this.isAdmin(user), id);
  }

  @Roles('admin')
  @Put(':id/status')
  @ApiOperation({ summary: '[S5-03] Cập nhật trạng thái đơn (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.updateStatus(user.id, true, id, dto);
  }

  @Roles('admin')
  @Post('bulk-status')
  @ApiOperation({
    summary: 'Bulk update status nhiều đơn (Admin only) — skip đơn invalid, trả {succeeded, failed}',
  })
  bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.bulkUpdateStatus(user.id, dto.orderIds, dto.status, dto.note);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Customer tự huỷ đơn — chỉ khi status=PENDING' })
  cancel(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.cancelByUser(user.id, id, body?.note);
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return user.roles.includes('admin');
  }
}
