import { Controller, Get, Query, Param, ParseUUIDPipe, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get('for-me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gợi ý sản phẩm cho người dùng hiện tại' })
  getForMe(
    @CurrentUser('id') userId: string,
    @Query('limit') limit = 10,
  ) {
    return this.recommendationsService.getForUser(userId, Number(limit));
  }

  @Get('similar/:productId')
  @ApiOperation({ summary: 'Sản phẩm tương tự' })
  getSimilar(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('limit') limit = 6,
  ) {
    return this.recommendationsService.getSimilar(productId, Number(limit));
  }
}
