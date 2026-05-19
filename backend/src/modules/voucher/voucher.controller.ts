// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   ParseUUIDPipe,
//   Patch,
//   Post,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { Throttle } from '@nestjs/throttler';
// import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from '@modules/auth/guards/roles.guard';
// import { Roles } from '@modules/auth/decorators/roles.decorator';
// import { Public } from '@modules/auth/decorators/public.decorator';
// import { VoucherService } from './voucher.service';
// import {
//   ApplyVoucherDto,
//   CreateVoucherDto,
//   UpdateVoucherDto,
// } from './dto/create-voucher.dto';

// @ApiTags('Voucher')
// @Controller()
// export class VoucherController {
//   constructor(private readonly service: VoucherService) {}

//   // ---------- Admin CRUD ----------

//   @Get('admin/vouchers')
//   @ApiBearerAuth('JWT')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @ApiOperation({ summary: 'Admin: list voucher có phân trang' })
//   list(
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//     @Query('isActive') isActive?: string,
//     @Query('search') search?: string,
//   ) {
//     return this.service.listForAdmin({
//       page: page ? Number(page) : undefined,
//       limit: limit ? Number(limit) : undefined,
//       isActive: isActive === undefined ? undefined : isActive === 'true',
//       search,
//     });
//   }

//   @Get('admin/vouchers/:id')
//   @ApiBearerAuth('JWT')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   getById(@Param('id', ParseUUIDPipe) id: string) {
//     return this.service.getById(id);
//   }

//   @Post('admin/vouchers')
//   @ApiBearerAuth('JWT')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   create(@Body() dto: CreateVoucherDto) {
//     return this.service.create(dto);
//   }

//   @Patch('admin/vouchers/:id')
//   @ApiBearerAuth('JWT')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVoucherDto) {
//     return this.service.update(id, dto);
//   }

//   @Delete('admin/vouchers/:id')
//   @ApiBearerAuth('JWT')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   delete(@Param('id', ParseUUIDPipe) id: string) {
//     return this.service.delete(id);
//   }

//   // ---------- Public preview (apply at checkout) ----------

//   @Post('vouchers/apply')
//   @Public()
//   @Throttle({ short: { limit: 5, ttl: 10_000 } })
//   @ApiOperation({
//     summary: 'Validate + tính discount cho subtotal hiện tại. KHÔNG consume usageCount.',
//   })
//   preview(@Body() dto: ApplyVoucherDto) {
//     return this.service.previewDiscount(dto.code, dto.subtotal);
//   }
// }
