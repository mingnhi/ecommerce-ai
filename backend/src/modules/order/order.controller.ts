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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';
import { UserRolesService } from '@modules/user-roles/user-roles.service';

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
  @ApiOperation({ summary: '[S5-01] Tạo đơn hàng (atomic transaction)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtUser) {
    return this.orderService.create(user.sub, dto);
  }

  @Post('bulk-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary:
      '[S5-03] Bulk update status (Admin only) — skip đơn invalid, trả {succeeded, failed}',
  })
  bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.orderService.bulkUpdateStatus(
      user.sub,
      dto.orderIds,
      dto.status,
      dto.note,
    );
  }

  @Get()
  @ApiOperation({ summary: '[S5-02/03] Danh sách đơn (auto-scope theo role)' })
  async list(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = await this.isAdmin(user.sub);
    return this.orderService.list(user.sub, isAdmin, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '[S5-02] Chi tiết đơn hàng' })
  async getById(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const isAdmin = await this.isAdmin(user.sub);
    return this.orderService.getById(user.sub, isAdmin, id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '[S5-03] Cập nhật trạng thái đơn (Admin only, state machine)',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.orderService.updateStatus(user.sub, id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Customer tự huỷ đơn — chỉ khi status = PENDING',
  })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.orderService.cancelByUser(user.sub, id, dto?.note);
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const userRoles = await this.userRolesService.findByUser(userId);
    return userRoles.some(
      (ur) => ur.role?.name?.toUpperCase() === 'ADMIN',
    );
  }
}
