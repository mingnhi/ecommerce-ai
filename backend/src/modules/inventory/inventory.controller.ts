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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@ApiTags('Inventory')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  async listMovements(
    @Query() query: MovementQueryDto,
  ): Promise<ApiResponse<MovementResponse[]>> {
    const result = await this.inventoryService.listMovements(query);

    return {
      status: 'success',
      message: 'Get inventory movements successfully',
      data: result.items as MovementResponse[],
      meta: result.meta,
    };
  }

  @Post('movements')
  async createMovement(
    @Body() dto: CreateMovementDto,
  ): Promise<ApiResponse<ApplyMovementResponse>> {
    const data = await this.inventoryService.createMovement(dto);

    return {
      status: 'success',
      message: 'Create movement successfully',
      data,
    };
  }

  @Get()
  async list(
    @Query() query: InventoryQueryDto,
  ): Promise<ApiResponse<InventoryResponse[]>> {
    const result = await this.inventoryService.list(query);

    return {
      status: 'success',
      message: 'Get inventories successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':variantId')
  async getByVariantId(
    @Param('variantId') variantId: string,
  ): Promise<ApiResponse<InventoryResponse>> {
    const data = await this.inventoryService.getByVariantId(variantId);

    return {
      status: 'success',
      message: 'Get inventory successfully',
      data,
    };
  }

  @Patch(':variantId')
  async update(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryDto,
  ): Promise<ApiResponse<ApplyMovementResponse>> {
    const data = await this.inventoryService.setAbsolute(variantId, dto);

    return {
      status: 'success',
      message: 'Update inventory successfully',
      data,
    };
  }
}
