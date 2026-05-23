// import { Controller, Get, Query, UseGuards } from '@nestjs/common';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from '@modules/auth/guards/roles.guard';
// import { Roles } from '@modules/auth/decorators/roles.decorator';
// import { AuditService } from './audit.service';

// @ApiTags('Audit')
// @ApiBearerAuth('JWT')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
// @Controller('admin/audit-logs')
// export class AuditController {
//   constructor(private readonly service: AuditService) {}

//   @Get()
//   @ApiOperation({ summary: 'List audit log với filter — admin only' })
//   list(
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//     @Query('action') action?: string,
//     @Query('entityType') entityType?: string,
//     @Query('entityId') entityId?: string,
//     @Query('actorUserId') actorUserId?: string,
//   ) {
//     return this.service.list({
//       page: page ? Number(page) : undefined,
//       limit: limit ? Number(limit) : undefined,
//       action,
//       entityType,
//       entityId,
//       actorUserId,
//     });
//   }
// }
