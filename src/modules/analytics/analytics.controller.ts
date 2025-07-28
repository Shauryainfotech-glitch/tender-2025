import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard analytics retrieved successfully' })
  async getDashboardAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getDashboardAnalytics(period);
  }

  @Get('tenders')
  @ApiOperation({ summary: 'Get tender analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tender analytics retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getTenderAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.analyticsService.getTenderAnalytics({ startDate, endDate, status });
  }

  @Get('bids')
  @ApiOperation({ summary: 'Get bid analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bid analytics retrieved successfully' })
  async getBidAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.analyticsService.getBidAnalytics({ startDate, endDate, status });
  }

  @Get('organizations')
  @ApiOperation({ summary: 'Get organization analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization analytics retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN)
  async getOrganizationAnalytics() {
    return this.analyticsService.getOrganizationAnalytics();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trends data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trends data retrieved successfully' })
  async getTrends(
    @Query('metric') metric: string,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getTrends(metric, period);
  }

  @Get('reports/tender/:id')
  @ApiOperation({ summary: 'Get detailed tender report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tender report retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getTenderReport(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getTenderReport(id);
  }

  @Get('reports/organization/:id')
  @ApiOperation({ summary: 'Get detailed organization report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization report retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN)
  async getOrganizationReport(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getOrganizationReport(id);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Performance metrics retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN)
  async getPerformanceMetrics() {
    return this.analyticsService.getPerformanceMetrics();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Revenue analytics retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.SUPER_ADMIN)
  async getRevenueAnalytics(
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.analyticsService.getRevenueAnalytics(year, month);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity analytics retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN)
  async getActivityAnalytics(
    @Query('userId') userId?: number,
    @Query('period') period: string = '7d',
  ) {
    return this.analyticsService.getActivityAnalytics(userId, period);
  }
}
