import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EMDService } from './emd.service';
import { CreateEMDDto } from './dto/create-emd.dto';
import { VerifyEMDDto } from './dto/verify-emd.dto';
import { RefundEMDDto } from './dto/refund-emd.dto';
import { ForfeitEMDDto } from './dto/forfeit-emd.dto';
import { User } from '../users/entities/user.entity';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

@ApiTags('emd')
@Controller('emd')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EMDController {
  constructor(private readonly emdService: EMDService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate EMD amount' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD amount calculated successfully' })
  async calculateEMD(
    @Body() calculateDto: { tenderId: number; bidAmount?: number },
  ) {
    return this.emdService.calculateEMD(calculateDto.tenderId, calculateDto.bidAmount);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit EMD' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'EMD submitted successfully' })
  async submitEMD(
    @Body() createEMDDto: CreateEMDDto,
    @CurrentUser() user: User,
  ) {
    return this.emdService.submitEMD(createEMDDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all EMDs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMDs retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getAllEMDs(
    @Query('tenderId') tenderId?: number,
    @Query('organizationId') organizationId?: number,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.emdService.getAllEMDs({
      tenderId,
      organizationId,
      status,
      page,
      limit,
    });
  }

  @Get('my-emds')
  @ApiOperation({ summary: 'Get my EMDs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMDs retrieved successfully' })
  async getMyEMDs(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.emdService.getOrganizationEMDs(user.organizationId, {
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EMD details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD details retrieved successfully' })
  async getEMDDetails(@Param('id', ParseIntPipe) id: number) {
    return this.emdService.getEMDDetails(id);
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify EMD' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD verified successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async verifyEMD(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyDto: VerifyEMDDto,
    @CurrentUser() user: User,
  ) {
    return this.emdService.verifyEMD(id, verifyDto, user.id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund EMD' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD refund initiated successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async refundEMD(
    @Param('id', ParseIntPipe) id: number,
    @Body() refundDto: RefundEMDDto,
    @CurrentUser() user: User,
  ) {
    return this.emdService.refundEMD(id, refundDto, user.id);
  }

  @Post(':id/forfeit')
  @ApiOperation({ summary: 'Forfeit EMD' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD forfeited successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async forfeitEMD(
    @Param('id', ParseIntPipe) id: number,
    @Body() forfeitDto: ForfeitEMDDto,
    @CurrentUser() user: User,
  ) {
    return this.emdService.forfeitEMD(id, forfeitDto, user.id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get EMD transactions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EMD transactions retrieved successfully' })
  async getEMDTransactions(@Param('id', ParseIntPipe) id: number) {
    return this.emdService.getEMDTransactions(id);
  }

  @Get('tender/:tenderId/summary')
  @ApiOperation({ summary: 'Get tender EMD summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tender EMD summary retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getTenderEMDSummary(@Param('tenderId', ParseIntPipe) tenderId: number) {
    return this.emdService.getTenderEMDSummary(tenderId);
  }

  @Post('bulk-refund')
  @ApiOperation({ summary: 'Bulk refund EMDs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bulk refund initiated successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN)
  async bulkRefundEMDs(
    @Body() bulkRefundDto: { tenderId: number; excludeBidIds?: number[]; reason: string },
    @CurrentUser() user: User,
  ) {
    return this.emdService.bulkRefundEMDs(
      bulkRefundDto.tenderId,
      bulkRefundDto.excludeBidIds,
      bulkRefundDto.reason,
      user.id,
    );
  }

  @Get('reports/pending-refunds')
  @ApiOperation({ summary: 'Get pending refunds report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pending refunds report retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getPendingRefundsReport() {
    return this.emdService.getPendingRefundsReport();
  }

  @Get('reports/expiring-emds')
  @ApiOperation({ summary: 'Get expiring EMDs report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Expiring EMDs report retrieved successfully' })
  @Roles(APP_CONSTANTS.ROLES.ADMIN, APP_CONSTANTS.ROLES.TENDER_MANAGER)
  async getExpiringEMDsReport(@Query('days') days: number = 30) {
    return this.emdService.getExpiringEMDsReport(days);
  }
}
