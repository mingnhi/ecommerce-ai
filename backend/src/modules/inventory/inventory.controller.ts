import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  @ApiOperation({ summary: '[S3-02] Lịch sử nhập/xuất kho' })
  listMovements(@Query() query: MovementQueryDto) {
    return this.inventoryService.listMovements(query);
  }

  @Post('movements')
  @ApiOperation({
    summary:
      '[S3-02] Tạo movement (IMPORT/RESERVE/RELEASE/SELL/ADJUST/RETURN)',
  })
  createMovement(
    @Body() dto: CreateMovementDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.inventoryService.createMovement(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: '[S3-01] Danh sách tồn kho (filter low_stock)' })
  list(@Query() query: InventoryQueryDto) {
    return this.inventoryService.list(query);
  }

  @Get(':variantId')
  @ApiOperation({ summary: '[S3-01] Tồn kho theo variant' })
  getByVariantId(@Param('variantId') variantId: string) {
    return this.inventoryService.getByVariantId(variantId);
  }

  @Patch(':variantId')
  @ApiOperation({ summary: '[S3-01] Cập nhật tồn kho (set absolute = ADJUST)' })
  update(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.inventoryService.setAbsolute(variantId, dto, user.sub);
  }
}
