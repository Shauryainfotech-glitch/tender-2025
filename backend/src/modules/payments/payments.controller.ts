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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard, Role } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Post('process')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment processing failed' })
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto, @Request() req) {
    return this.paymentsService.processPayment(processPaymentDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all payments with filters' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  findAll(@Query() query: any, @Request() req) {
    // Non-admin users can only see their organization's payments
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.paymentsService.findAll(query);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.paymentsService.getStatistics(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.paymentsService.findOne(id, req.user);
  }

  @Get('transaction/:transactionId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get payment by transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findByTransactionId(@Param('transactionId') transactionId: string, @Request() req) {
    return this.paymentsService.findByTransactionId(transactionId, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment record' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Post(':id/verify')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  verify(@Param('id') id: string, @Request() req) {
    return this.paymentsService.verifyPayment(id, req.user.id);
  }

  @Post(':id/refund')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Refund initiated successfully' })
  refund(@Param('id') id: string, @Body() refundDto: RefundPaymentDto, @Request() req) {
    return this.paymentsService.refundPayment(id, refundDto, req.user.id);
  }

  @Get(':id/receipt')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Generate payment receipt' })
  @ApiResponse({ status: 200, description: 'Receipt generated successfully' })
  generateReceipt(@Param('id') id: string, @Request() req) {
    return this.paymentsService.generateReceipt(id, req.user);
  }

  @Get('organization/:organizationId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get payments by organization' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  findByOrganization(@Param('organizationId') organizationId: string, @Query() query: any, @Request() req) {
    // Non-admin users can only see their own organization's payments
    if (req.user.role !== 'admin' && req.user.organization?.id !== organizationId) {
      throw new ForbiddenException('Access denied');
    }
    return this.paymentsService.findByOrganization(organizationId, query);
  }

  @Get('tender/:tenderId')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get payments for a tender' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  findByTender(@Param('tenderId') tenderId: string) {
    return this.paymentsService.findByTender(tenderId);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Request() req
  ) {
    // Verify webhook signature based on provider
    return this.paymentsService.handleWebhookFromController(provider, payload, req.headers);
  }
}

import { ForbiddenException } from '@nestjs/common';