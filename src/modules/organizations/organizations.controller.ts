// modules/organizations/organizations.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SearchOrganizationDto } from './dto/search-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 409, description: 'Conflict - Organization already exists' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get all organizations with filters' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  findAll(@Query() searchDto: SearchOrganizationDto) {
    return this.organizationsService.findAll(searchDto);
  }

  @Get('top-suppliers')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get top rated suppliers' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top suppliers retrieved successfully' })
  getTopSuppliers(@Query('limit') limit?: number) {
    return this.organizationsService.getTopSuppliers(limit || 10);
  }

  @Get('top-buyers')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get top buyers by tender count' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top buyers retrieved successfully' })
  getTopBuyers(@Query('limit') limit?: number) {
    return this.organizationsService.getTopBuyers(limit || 10);
  }

  @Get(':id')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('registration/:registrationNumber')
  @Roles('admin')
  @ApiOperation({ summary: 'Get organization by registration number' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findByRegistrationNumber(@Param('registrationNumber') registrationNumber: string) {
    return this.organizationsService.findByRegistrationNumber(registrationNumber);
  }

  @Get(':id/statistics')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Param('id') id: string, @Request() req) {
    // Users can only see statistics for their own organization unless admin
    if (req.user.role !== 'admin' && req.user.organization?.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.organizationsService.getStatistics(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already in use' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Post(':id/verify')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify organization' })
  @ApiResponse({ status: 200, description: 'Organization verified successfully' })
  @ApiResponse({ status: 400, description: 'Organization already verified' })
  verify(@Param('id') id: string, @Request() req) {
    return this.organizationsService.verify(id, req.user.id);
  }

  @Post(':id/activate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate organization' })
  @ApiResponse({ status: 200, description: 'Organization activated successfully' })
  activate(@Param('id') id: string) {
    return this.organizationsService.activate(id);
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate organization' })
  @ApiResponse({ status: 200, description: 'Organization deactivated successfully' })
  deactivate(@Param('id') id: string) {
    return this.organizationsService.deactivate(id);
  }

  @Post(':id/rate')
  @Roles('admin', 'buyer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate organization' })
  @ApiResponse({ status: 200, description: 'Organization rated successfully' })
  rate(@Param('id') id: string, @Body('rating') rating: number) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    return this.organizationsService.updateRating(id, rating);
  }

  @Post(':id/users/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add user to organization' })
  @ApiResponse({ status: 200, description: 'User added successfully' })
  @ApiResponse({ status: 400, description: 'User already belongs to an organization' })
  addUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.organizationsService.addUser(id, userId);
  }

  @Delete(':id/users/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove user from organization' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 400, description: 'User does not belong to this organization' })
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.organizationsService.removeUser(id, userId);
  }
}

import { ForbiddenException, BadRequestException } from '@nestjs/common';
