import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { AuthenticatedUser } from '@modules/auth/strategies/jwt.strategy';

@ApiTags('Inventory')
@ApiBearerAuth('JWT')
@Roles('admin')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  @ApiOperation({ summary: '[S3-02] Lịch sử nhập/xuất kho' })
  listMovements(@Query() query: MovementQueryDto) {
    return this.inventoryService.listMovements(query);
  }

  @Post('movements')
  @ApiOperation({
    summary: '[S3-02] Tạo movement log (IMPORT/RESERVE/RELEASE/SELL/ADJUST)',
  })
  createMovement(
    @Body() dto: CreateMovementDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.createMovement(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '[S3-01] Danh sách tồn kho (filter low_stock)' })
  list(@Query() query: InventoryQueryDto) {
    return this.inventoryService.list(query);
  }

  @Get(':variant_id')
  @ApiOperation({ summary: '[S3-01] Tồn kho theo variant' })
  getByVariantId(@Param('variant_id') variantId: string) {
    return this.inventoryService.getByVariantId(variantId);
  }

  @Put(':variant_id')
  @ApiOperation({ summary: '[S3-01] Cập nhật tồn kho (set absolute)' })
  update(
    @Param('variant_id') variantId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.setAbsolute(variantId, dto, user.id);
  }
}
