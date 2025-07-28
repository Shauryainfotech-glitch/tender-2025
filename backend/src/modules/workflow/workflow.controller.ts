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
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  create(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req) {
    return this.workflowService.create(createWorkflowDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get all workflows' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  findAll(@Query() query: any) {
    return this.workflowService.findAll(query);
  }

  @Get('templates')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get workflow templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  getTemplates() {
    return this.workflowService.getTemplates();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow found' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Get(':id/stages')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @ApiOperation({ summary: 'Get workflow stages' })
  @ApiResponse({ status: 200, description: 'Stages retrieved successfully' })
  getStages(@Param('id') id: string) {
    return this.workflowService.getStages(id);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get workflow history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getHistory(@Param('id') id: string) {
    return this.workflowService.getHistory(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Request() req
  ) {
    return this.workflowService.update(id, updateWorkflowDto, req.user.id);
  }

  @Post(':id/advance')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Advance workflow to next stage' })
  @ApiResponse({ status: 200, description: 'Workflow advanced successfully' })
  advance(@Param('id') id: string, @Body() advanceData: any, @Request() req) {
    return this.workflowService.advance(id, advanceData, req.user);
  }

  @Post(':id/revert')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revert workflow to previous stage' })
  @ApiResponse({ status: 200, description: 'Workflow reverted successfully' })
  revert(@Param('id') id: string, @Body() revertData: any, @Request() req) {
    return this.workflowService.revert(id, revertData, req.user.id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve workflow stage' })
  @ApiResponse({ status: 200, description: 'Stage approved successfully' })
  approve(@Param('id') id: string, @Body() approvalData: any, @Request() req) {
    return this.workflowService.approve(id, approvalData, req.user.id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject workflow stage' })
  @ApiResponse({ status: 200, description: 'Stage rejected successfully' })
  reject(@Param('id') id: string, @Body() rejectionData: any, @Request() req) {
    return this.workflowService.reject(id, rejectionData, req.user.id);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign workflow to user' })
  @ApiResponse({ status: 200, description: 'Workflow assigned successfully' })
  assign(@Param('id') id: string, @Body() assignData: any, @Request() req) {
    return this.workflowService.assign(id, assignData, req.user.id);
  }

  @Post(':id/escalate')
  @Roles(Role.ADMIN, Role.BUYER, Role.SUPPLIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Escalate workflow' })
  @ApiResponse({ status: 200, description: 'Workflow escalated successfully' })
  escalate(@Param('id') id: string, @Body() escalationData: any, @Request() req) {
    return this.workflowService.escalate(id, escalationData, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  remove(@Param('id') id: string) {
    return this.workflowService.remove(id);
  }
}