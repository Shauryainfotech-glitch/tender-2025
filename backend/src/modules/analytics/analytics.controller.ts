import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.BUYER)
  getDashboardStats(@CurrentUser() user: any) {
    return this.analyticsService.getDashboardStats(user.organizationId);
  }

  @Get('tender-stats')
  @Roles(Role.ADMIN, Role.BUYER)
  getTenderStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.analyticsService.getTenderStatistics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      organizationId,
    });
  }

  @Get('bid-stats')
  @Roles(Role.ADMIN, Role.BUYER)
  getBidStatistics(
    @Query('tenderId') tenderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getBidStatistics({
      tenderId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('vendor-performance')
  @Roles(Role.ADMIN, Role.BUYER)
  getVendorPerformance(
    @Query('vendorId') vendorId?: string,
    @Query('period', new DefaultValuePipe(90), ParseIntPipe) period?: number,
  ) {
    return this.analyticsService.getVendorPerformance({
      vendorId,
      period,
    });
  }

  @Get('payment-analytics')
  @Roles(Role.ADMIN, Role.BUYER)
  getPaymentAnalytics(
    @Query('period', new DefaultValuePipe(30), ParseIntPipe) period?: number,
    @Query('status') status?: string,
  ) {
    return this.analyticsService.getPaymentAnalytics({
      period,
      status,
    });
  }

  @Get('category-wise-tenders')
  @Roles(Role.ADMIN, Role.BUYER)
  getCategoryWiseTenders(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getCategoryWiseTenders(year);
  }

  @Get('monthly-trends')
  @Roles(Role.ADMIN, Role.BUYER)
  getMonthlyTrends(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
    @Query('metric') metric: 'tenders' | 'bids' | 'value' = 'tenders',
  ) {
    return this.analyticsService.getMonthlyTrends(year, metric);
  }

  @Get('savings-report')
  @Roles(Role.ADMIN, Role.BUYER)
  getSavingsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSavingsReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('vendor-analytics')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getVendorAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getVendorAnalytics(user.id);
  }

  @Get('tender-participation')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getTenderParticipation(
    @CurrentUser() user: any,
    @Query('period', new DefaultValuePipe(90), ParseIntPipe) period?: number,
  ) {
    return this.analyticsService.getTenderParticipation(user.id, period);
  }

  @Get('success-rate')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getSuccessRate(@CurrentUser() user: any) {
    return this.analyticsService.getVendorSuccessRate(user.id);
  }

  @Get('export')
  @Roles(Role.ADMIN, Role.BUYER)
  exportAnalytics(
    @Query('type') type: 'tender' | 'bid' | 'vendor' | 'payment',
    @Query('format') format: 'csv' | 'excel' | 'pdf' = 'excel',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.exportAnalytics({
      type,
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}