// modules/bids/bids.controller.ts
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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { EvaluateBidDto } from './dto/evaluate-bid.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/bids/entities/role.enum';

@ApiTags('bids')
@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles(Role.Admin, Role.Supplier)
  @ApiOperation({ summary: 'Submit a new bid' })
  @ApiResponse({ status: 201, description: 'Bid successfully submitted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createBidDto: CreateBidDto, @Request() req) {
    return this.bidsService.create(createBidDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get all bids with filters' })
  @ApiQuery({ name: 'tenderId', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'minAmount', required: false })
  @ApiQuery({ name: 'maxAmount', required: false })
  findAll(@Query() query, @Request() req) {
    // Suppliers can only see their own organization's bids
    if (req.user.role === 'supplier' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.bidsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get a specific bid by ID' })
  @ApiResponse({ status: 200, description: 'Bid found' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const bid = await this.bidsService.findOne(id);
    
    // Suppliers can only see their own organization's bids
    if (req.user.role === 'supplier' && 
        req.user.organization && 
        bid.organization.id !== req.user.organization.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return bid;
  }

  @Get('tender/:tenderId')
  @Roles('admin', 'buyer')
  @ApiOperation({ summary: 'Get all bids for a specific tender' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  findByTender(@Param('tenderId') tenderId: string) {
    return this.bidsService.findByTender(tenderId);
  }

  @Get('organization/:organizationId')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get all bids from a specific organization' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  findByOrganization(@Param('organizationId') organizationId: string, @Request() req) {
    // Suppliers can only see their own organization's bids
    if (req.user.role === 'supplier' && 
        req.user.organization && 
        organizationId !== req.user.organization.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return this.bidsService.findByOrganization(organizationId);
  }

  @Patch(':id')
  @Roles('admin', 'supplier')
  @ApiOperation({ summary: 'Update a bid' })
  @ApiResponse({ status: 200, description: 'Bid updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto, @Request() req) {
    return this.bidsService.update(id, updateBidDto, req.user.id);
  }

  @Post(':id/withdraw')
  @Roles('admin', 'supplier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw a submitted bid' })
  @ApiResponse({ status: 200, description: 'Bid withdrawn successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  withdraw(@Param('id') id: string, @Request() req) {
    return this.bidsService.withdraw(id, req.user.id);
  }

  @Post(':id/evaluate')
  @Roles('admin', 'buyer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Evaluate a bid' })
  @ApiResponse({ status: 200, description: 'Bid evaluated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  evaluate(@Param('id') id: string, @Body() evaluateBidDto: EvaluateBidDto, @Request() req) {
    return this.bidsService.evaluate(id, evaluateBidDto, req.user.id);
  }

  @Post('tender/:tenderId/select-winner/:bidId')
  @Roles('admin', 'buyer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select a bid as winner for a tender' })
  @ApiResponse({ status: 200, description: 'Winner selected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  selectWinner(
    @Param('tenderId') tenderId: string,
    @Param('bidId') bidId: string,
    @Request() req
  ) {
    return this.bidsService.selectWinner(tenderId, bidId, req.user.id);
  }

  @Get('tender/:tenderId/statistics')
  @Roles('admin', 'buyer')
  @ApiOperation({ summary: 'Get bid statistics for a tender' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Param('tenderId') tenderId: string) {
    return this.bidsService.getStatistics(tenderId);
  }
}

import { ForbiddenException } from '@nestjs/common';
