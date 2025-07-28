import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { CreateBankGuaranteeDto } from './dto/create-bank-guarantee.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateSecurityDepositDto } from './dto/create-security-deposit.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard, Role } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // Bank Guarantee endpoints
  @Post('bank-guarantee')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a bank guarantee' })
  @ApiResponse({ status: 201, description: 'Bank guarantee created successfully' })
  async createBankGuarantee(
    @Body() createBankGuaranteeDto: CreateBankGuaranteeDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.securityService.createBankGuarantee(
      createBankGuaranteeDto,
      file,
      req.user.id
    );
  }

  @Get('bank-guarantee')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all bank guarantees' })
  @ApiResponse({ status: 200, description: 'Bank guarantees retrieved successfully' })
  findAllBankGuarantees(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.securityService.findAllBankGuarantees(query);
  }

  @Get('bank-guarantee/:id')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get bank guarantee by ID' })
  @ApiResponse({ status: 200, description: 'Bank guarantee found' })
  @ApiResponse({ status: 404, description: 'Bank guarantee not found' })
  findOneBankGuarantee(@Param('id') id: string, @Request() req) {
    return this.securityService.findOneBankGuarantee(id, req.user);
  }

  @Post('bank-guarantee/:id/verify')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a bank guarantee' })
  @ApiResponse({ status: 200, description: 'Bank guarantee verified successfully' })
  verifyBankGuarantee(@Param('id') id: string, @Request() req) {
    return this.securityService.verifyBankGuarantee(id, req.user.id);
  }

  @Post('bank-guarantee/:id/release')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a bank guarantee' })
  @ApiResponse({ status: 200, description: 'Bank guarantee released successfully' })
  releaseBankGuarantee(@Param('id') id: string, @Request() req) {
    return this.securityService.releaseBankGuarantee(id, req.user.id);
  }

  // Insurance Policy endpoints
  @Post('insurance-policy')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create an insurance policy' })
  @ApiResponse({ status: 201, description: 'Insurance policy created successfully' })
  async createInsurancePolicy(
    @Body() createInsurancePolicyDto: CreateInsurancePolicyDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.securityService.createInsurancePolicy(
      createInsurancePolicyDto,
      file,
      req.user.id
    );
  }

  @Get('insurance-policy')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all insurance policies' })
  @ApiResponse({ status: 200, description: 'Insurance policies retrieved successfully' })
  findAllInsurancePolicies(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.securityService.findAllInsurancePolicies(query);
  }

  @Get('insurance-policy/:id')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get insurance policy by ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy found' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  findOneInsurancePolicy(@Param('id') id: string, @Request() req) {
    return this.securityService.findOneInsurancePolicy(id, req.user);
  }

  @Post('insurance-policy/:id/verify')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an insurance policy' })
  @ApiResponse({ status: 200, description: 'Insurance policy verified successfully' })
  verifyInsurancePolicy(@Param('id') id: string, @Request() req) {
    return this.securityService.verifyInsurancePolicy(id, req.user.id);
  }

  // Security Deposit endpoints
  @Post('security-deposit')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Create a security deposit' })
  @ApiResponse({ status: 201, description: 'Security deposit created successfully' })
  async createSecurityDeposit(
    @Body() createSecurityDepositDto: CreateSecurityDepositDto,
    @Request() req
  ) {
    return this.securityService.createSecurityDeposit(
      createSecurityDepositDto,
      req.user.id
    );
  }

  @Get('security-deposit')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all security deposits' })
  @ApiResponse({ status: 200, description: 'Security deposits retrieved successfully' })
  findAllSecurityDeposits(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.securityService.findAllSecurityDeposits(query);
  }

  @Get('security-deposit/:id')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get security deposit by ID' })
  @ApiResponse({ status: 200, description: 'Security deposit found' })
  @ApiResponse({ status: 404, description: 'Security deposit not found' })
  findOneSecurityDeposit(@Param('id') id: string, @Request() req) {
    return this.securityService.findOneSecurityDeposit(id, req.user);
  }

  @Post('security-deposit/:id/refund')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a security deposit' })
  @ApiResponse({ status: 200, description: 'Security deposit refunded successfully' })
  refundSecurityDeposit(@Param('id') id: string, @Request() req) {
    return this.securityService.refundSecurityDeposit(id, req.user.id);
  }

  // General security endpoints
  @Get('organization/:organizationId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all securities for an organization' })
  @ApiResponse({ status: 200, description: 'Securities retrieved successfully' })
  findByOrganization(@Param('organizationId') organizationId: string, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization?.id !== organizationId) {
      throw new ForbiddenException('Access denied');
    }
    return this.securityService.findByOrganization(organizationId);
  }

  @Get('tender/:tenderId')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get all securities for a tender' })
  @ApiResponse({ status: 200, description: 'Securities retrieved successfully' })
  findByTender(@Param('tenderId') tenderId: string) {
    return this.securityService.findByTender(tenderId);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get security statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.securityService.getStatistics(query);
  }

  @Get('expiring')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get expiring securities' })
  @ApiResponse({ status: 200, description: 'Expiring securities retrieved successfully' })
  getExpiring(@Query('days') days: number = 30, @Request() req) {
    return this.securityService.getExpiring(days, req.user);
  }
}

import { ForbiddenException } from '@nestjs/common';