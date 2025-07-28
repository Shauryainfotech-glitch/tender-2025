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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 409, description: 'Vendor already exists' })
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get all vendors with filters' })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  findAll(@Query() query: any) {
    return this.vendorsService.findAll(query);
  }

  @Get('search')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Search vendors' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') searchTerm: string, @Query() filters: any) {
    return this.vendorsService.search(searchTerm, filters);
  }

  @Get('categories')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get vendor categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return this.vendorsService.getCategories();
  }

  @Get('statistics')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get vendor statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.vendorsService.getStatistics();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor found' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Get(':id/performance')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get vendor performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  getPerformance(@Param('id') id: string, @Query() query: any) {
    return this.vendorsService.getPerformance(id, query);
  }

  @Get(':id/bids')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get vendor bid history' })
  @ApiResponse({ status: 200, description: 'Bid history retrieved' })
  getBidHistory(@Param('id') id: string, @Request() req) {
    // Suppliers can only see their own bid history
    if (req.user.role === 'supplier' && req.user.organization?.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.vendorsService.getBidHistory(id);
  }

  @Get(':id/contracts')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get vendor contracts' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved' })
  getContracts(@Param('id') id: string, @Request() req) {
    // Suppliers can only see their own contracts
    if (req.user.role === 'supplier' && req.user.organization?.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.vendorsService.getContracts(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Post(':id/verify')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify vendor' })
  @ApiResponse({ status: 200, description: 'Vendor verified successfully' })
  verify(@Param('id') id: string, @Request() req) {
    return this.vendorsService.verify(id, req.user.id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve vendor' })
  @ApiResponse({ status: 200, description: 'Vendor approved successfully' })
  approve(@Param('id') id: string, @Request() req) {
    return this.vendorsService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject vendor' })
  @ApiResponse({ status: 200, description: 'Vendor rejected successfully' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    return this.vendorsService.reject(id, reason, req.user.id);
  }

  @Post(':id/suspend')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend vendor' })
  @ApiResponse({ status: 200, description: 'Vendor suspended successfully' })
  suspend(@Param('id') id: string, @Body() suspendData: any, @Request() req) {
    return this.vendorsService.suspend(id, suspendData, req.user.id);
  }

  @Post(':id/activate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate vendor' })
  @ApiResponse({ status: 200, description: 'Vendor activated successfully' })
  activate(@Param('id') id: string, @Request() req) {
    return this.vendorsService.activate(id, req.user.id);
  }

  @Post(':id/rate')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate vendor' })
  @ApiResponse({ status: 200, description: 'Vendor rated successfully' })
  rate(@Param('id') id: string, @Body() ratingData: any, @Request() req) {
    return this.vendorsService.rate(id, ratingData, req.user.id);
  }

  @Post(':id/blacklist')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Blacklist vendor' })
  @ApiResponse({ status: 200, description: 'Vendor blacklisted successfully' })
  blacklist(@Param('id') id: string, @Body() blacklistData: any, @Request() req) {
    return this.vendorsService.blacklist(id, blacklistData, req.user.id);
  }

  @Delete(':id/blacklist')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove vendor from blacklist' })
  @ApiResponse({ status: 200, description: 'Vendor removed from blacklist' })
  removeFromBlacklist(@Param('id') id: string, @Request() req) {
    return this.vendorsService.removeFromBlacklist(id, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}

import { ForbiddenException } from '@nestjs/common';