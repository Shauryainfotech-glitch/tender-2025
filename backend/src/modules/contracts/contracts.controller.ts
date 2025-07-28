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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BUYER)
  @UseInterceptors(FilesInterceptor('documents', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  async create(
    @Body() createContractDto: CreateContractDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    return this.contractsService.create(createContractDto, files, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get all contracts with filters' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
  findAll(@Query() query: any, @Request() req) {
    // Non-admin users can only see their organization's contracts
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.contractsService.findAll(query);
  }

  @Get('templates')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get contract templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  getTemplates() {
    return this.contractsService.getTemplates();
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get contract statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Query() query: any, @Request() req) {
    if (req.user.role !== 'admin' && req.user.organization) {
      query.organizationId = req.user.organization.id;
    }
    return this.contractsService.getStatistics(query);
  }

  @Get('expiring')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get expiring contracts' })
  @ApiResponse({ status: 200, description: 'Expiring contracts retrieved' })
  getExpiring(@Query('days') days: number = 30, @Request() req) {
    return this.contractsService.getExpiring(days, req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract found' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.contractsService.findOne(id, req.user);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get contract history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getHistory(@Param('id') id: string) {
    return this.contractsService.getHistory(id);
  }

  @Get(':id/documents')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get contract documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  getDocuments(@Param('id') id: string, @Request() req) {
    return this.contractsService.getDocuments(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Update contract' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Request() req
  ) {
    return this.contractsService.update(id, updateContractDto, req.user.id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve contract' })
  @ApiResponse({ status: 200, description: 'Contract approved successfully' })
  approve(@Param('id') id: string, @Request() req) {
    return this.contractsService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject contract' })
  @ApiResponse({ status: 200, description: 'Contract rejected successfully' })
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req
  ) {
    return this.contractsService.reject(id, reason, req.user.id);
  }

  @Post(':id/sign')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign contract' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully' })
  sign(@Param('id') id: string, @Body() signData: any, @Request() req) {
    return this.contractsService.sign(id, signData, req.user);
  }

  @Post(':id/execute')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute contract' })
  @ApiResponse({ status: 200, description: 'Contract executed successfully' })
  execute(@Param('id') id: string, @Request() req) {
    return this.contractsService.execute(id, req.user.id);
  }

  @Post(':id/terminate')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate contract' })
  @ApiResponse({ status: 200, description: 'Contract terminated successfully' })
  terminate(
    @Param('id') id: string,
    @Body() terminationData: any,
    @Request() req
  ) {
    return this.contractsService.terminate(id, terminationData, req.user.id);
  }

  @Post(':id/renew')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew contract' })
  @ApiResponse({ status: 200, description: 'Contract renewed successfully' })
  renew(@Param('id') id: string, @Body() renewData: any, @Request() req) {
    return this.contractsService.renew(id, renewData, req.user.id);
  }

  @Post(':id/amend')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Amend contract' })
  @ApiResponse({ status: 200, description: 'Contract amended successfully' })
  amend(@Param('id') id: string, @Body() amendmentData: any, @Request() req) {
    return this.contractsService.amend(id, amendmentData, req.user.id);
  }

  @Post(':id/documents')
  @Roles(Role.ADMIN, Role.BUYER)
  @UseInterceptors(FilesInterceptor('documents', 5))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add documents to contract' })
  @ApiResponse({ status: 200, description: 'Documents added successfully' })
  addDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    return this.contractsService.addDocuments(id, files, req.user.id);
  }

  @Delete(':id/documents/:documentId')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Remove document from contract' })
  @ApiResponse({ status: 200, description: 'Document removed successfully' })
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Request() req
  ) {
    return this.contractsService.removeDocument(id, documentId, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete contract' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}