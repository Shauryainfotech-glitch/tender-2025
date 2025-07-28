import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { LlmProcessingService } from './llm-processing.service';
import { CreateProcessingJobDto } from './dto/create-processing-job.dto';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Express } from 'express';

@ApiTags('LLM Processing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('llm-processing')
export class LlmProcessingController {
  constructor(private readonly llmProcessingService: LlmProcessingService) {}

  // Processing Jobs Endpoints
  @Post('jobs')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Create a new processing job' })
  @ApiResponse({ status: 201, description: 'Processing job created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createProcessingJob(
    @Body(ValidationPipe) createJobDto: CreateProcessingJobDto,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.createProcessingJob(createJobDto, user);
  }

  @Get('jobs')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all processing jobs' })
  @ApiResponse({ status: 200, description: 'List of processing jobs' })
  async getProcessingJobs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @CurrentUser() user: any = {},
  ) {
    return this.llmProcessingService.getProcessingJobs({
      page,
      limit,
      status,
      type,
      priority,
      userId: user.id,
      userRole: user.role,
    });
  }

  @Get('jobs/:jobId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get processing job by ID' })
  @ApiResponse({ status: 200, description: 'Processing job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getProcessingJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.getProcessingJob(jobId, user);
  }

  @Put('jobs/:jobId/cancel')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a processing job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelProcessingJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.cancelProcessingJob(jobId, user);
  }

  @Put('jobs/:jobId/retry')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed processing job' })
  @ApiResponse({ status: 200, description: 'Job retry initiated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async retryProcessingJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.retryProcessingJob(jobId, user);
  }

  @Get('jobs/:jobId/result')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get processing job result' })
  @ApiResponse({ status: 200, description: 'Job result' })
  @ApiResponse({ status: 404, description: 'Job not found or not completed' })
  async getJobResult(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.getJobResult(jobId, user);
  }

  @Delete('jobs/:jobId')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a processing job' })
  @ApiResponse({ status: 204, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async deleteProcessingJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.deleteProcessingJob(jobId, user);
  }

  // Knowledge Base Endpoints
  @Post('knowledge-bases')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Create a new knowledge base' })
  @ApiResponse({ status: 201, description: 'Knowledge base created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createKnowledgeBase(
    @Body(ValidationPipe) createKBDto: CreateKnowledgeBaseDto,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.createKnowledgeBase(createKBDto, user);
  }

  @Get('knowledge-bases')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all knowledge bases' })
  @ApiResponse({ status: 200, description: 'List of knowledge bases' })
  async getKnowledgeBases(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('scope') scope?: string,
    @Query('search') search?: string,
    @CurrentUser() user: any = {},
  ) {
    return this.llmProcessingService.getKnowledgeBases({
      page,
      limit,
      type,
      scope,
      search,
      userId: user.id,
      userRole: user.role,
      organizationId: user.organizationId,
    });
  }

  @Get('knowledge-bases/:kbId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get knowledge base by ID' })
  @ApiResponse({ status: 200, description: 'Knowledge base details' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async getKnowledgeBase(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.getKnowledgeBase(kbId, user);
  }

  @Put('knowledge-bases/:kbId')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Update knowledge base' })
  @ApiResponse({ status: 200, description: 'Knowledge base updated successfully' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async updateKnowledgeBase(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @Body(ValidationPipe) updateKBDto: Partial<CreateKnowledgeBaseDto>,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.updateKnowledgeBase(kbId, updateKBDto, user);
  }

  @Post('knowledge-bases/:kbId/documents')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Add documents to knowledge base' })
  @ApiResponse({ status: 200, description: 'Documents added successfully' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async addDocumentsToKB(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @Body() documents: any[],
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.addDocumentsToKB(kbId, documents, user);
  }

  @Delete('knowledge-bases/:kbId/documents/:docId')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove document from knowledge base' })
  @ApiResponse({ status: 204, description: 'Document removed successfully' })
  @ApiResponse({ status: 404, description: 'Knowledge base or document not found' })
  async removeDocumentFromKB(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.removeDocumentFromKB(kbId, docId, user);
  }

  @Post('knowledge-bases/:kbId/query')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Query knowledge base' })
  @ApiResponse({ status: 200, description: 'Query results' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async queryKnowledgeBase(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @Body() query: { question: string; maxResults?: number },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.queryKnowledgeBase(kbId, query.question, query.maxResults, user);
  }

  @Put('knowledge-bases/:kbId/refresh')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh knowledge base content' })
  @ApiResponse({ status: 200, description: 'Knowledge base refresh initiated' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async refreshKnowledgeBase(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.refreshKnowledgeBase(kbId, user);
  }

  @Delete('knowledge-bases/:kbId')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete knowledge base' })
  @ApiResponse({ status: 204, description: 'Knowledge base deleted successfully' })
  @ApiResponse({ status: 404, description: 'Knowledge base not found' })
  async deleteKnowledgeBase(
    @Param('kbId', ParseUUIDPipe) kbId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.deleteKnowledgeBase(kbId, user);
  }

  // Template Endpoints
  @Post('templates')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTemplate(
    @Body(ValidationPipe) createTemplateDto: CreateTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.createTemplate(createTemplateDto, user);
  }

  @Get('templates')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async getTemplates(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @CurrentUser() user: any = {},
  ) {
    return this.llmProcessingService.getTemplates({
      page,
      limit,
      type,
      category,
      search,
      userId: user.id,
      userRole: user.role,
    });
  }

  @Get('templates/:templateId')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.getTemplate(templateId, user);
  }

  @Put('templates/:templateId')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body(ValidationPipe) updateTemplateDto: Partial<CreateTemplateDto>,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.updateTemplate(templateId, updateTemplateDto, user);
  }

  @Post('templates/:templateId/test')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Test template with sample data' })
  @ApiResponse({ status: 200, description: 'Template test results' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async testTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() testData: Record<string, any>,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.testTemplate(templateId, testData, user);
  }

  @Post('templates/:templateId/clone')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Clone an existing template' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async cloneTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() cloneData: { name: string; description?: string },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.cloneTemplate(templateId, cloneData, user);
  }

  @Delete('templates/:templateId')
  @Roles(Role.ADMIN, Role.BUYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.deleteTemplate(templateId, user);
  }

  // Analysis Endpoints
  @Post('analyze/document')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Analyze a document' })
  @ApiResponse({ status: 200, description: 'Document analysis results' })
  async analyzeDocument(
    @Body() analysisRequest: {
      documentId: string;
      analysisType: string;
      options?: Record<string, any>;
    },
    @CurrentUser() user: any,
  ) {
    // Note: This should be a file upload endpoint, but for now we'll create a mock file
    const mockFile = {
      originalname: `document-${analysisRequest.documentId}`,
      buffer: Buffer.from('mock document content'),
      mimetype: 'text/plain',
    } as Express.Multer.File;
    
    return this.llmProcessingService.analyzeDocument(
      mockFile,
      analysisRequest.analysisType,
      analysisRequest.options,
      user,
    );
  }

  @Post('analyze/tender')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Analyze a tender' })
  @ApiResponse({ status: 200, description: 'Tender analysis results' })
  async analyzeTender(
    @Body() tenderAnalysis: {
      tenderId: string;
      analysisScope: string[];
      templateId?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.analyzeTender(
      tenderAnalysis.tenderId,
      tenderAnalysis.analysisScope.join(','),
      user,
    );
  }

  @Post('analyze/bid-compliance')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Check bid compliance' })
  @ApiResponse({ status: 200, description: 'Compliance check results' })
  async checkBidCompliance(
    @Body() complianceCheck: {
      bidId: string;
      tenderId: string;
      checkLevel: 'basic' | 'detailed' | 'comprehensive';
    },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.checkBidCompliance(
      complianceCheck.bidId,
      complianceCheck.tenderId,
      user,
    );
  }

  @Post('compare/documents')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Compare multiple documents' })
  @ApiResponse({ status: 200, description: 'Document comparison results' })
  async compareDocuments(
    @Body() comparison: {
      documentIds: string[];
      comparisonType: string;
      focusAreas?: string[];
    },
    @CurrentUser() user: any = {},
  ) {
    return this.llmProcessingService.compareDocuments(
      comparison.documentIds,
      comparison.comparisonType,
      user,
    );
  }

  @Post('summarize')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Generate summary of documents' })
  @ApiResponse({ status: 200, description: 'Summary generated' })
  async generateSummary(
    @Body() summaryRequest: {
      documentIds: string[];
      summaryType: 'brief' | 'detailed' | 'executive';
      maxLength?: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.generateSummary(
      summaryRequest.documentIds.join(' '),
      summaryRequest.summaryType,
      summaryRequest.maxLength,
      user,
    );
  }

  @Post('extract/entities')
  @Roles(Role.ADMIN, Role.BUYER, Role.VENDOR)
  @ApiOperation({ summary: 'Extract entities from documents' })
  @ApiResponse({ status: 200, description: 'Extracted entities' })
  async extractEntities(
    @Body() extractionRequest: {
      documentId: string;
      entityTypes: string[];
      templateId?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.extractEntities(
      extractionRequest.documentId,
      extractionRequest.entityTypes,
      user,
    );
  }

  // Provider Management
  @Get('providers')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get available LLM providers' })
  @ApiResponse({ status: 200, description: 'List of LLM providers' })
  async getProviders() {
    return this.llmProcessingService.getAvailableProviders();
  }

  @Get('providers/:provider/models')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get available models for a provider' })
  @ApiResponse({ status: 200, description: 'List of available models' })
  async getProviderModels(@Param('provider') provider: string) {
    return this.llmProcessingService.getProviderModels(provider);
  }

  // Stats and Analytics
  @Get('stats')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get LLM processing statistics' })
  @ApiResponse({ status: 200, description: 'Processing statistics' })
  async getProcessingStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user: any = {},
  ) {
    return this.llmProcessingService.getProcessingStats({
      startDate,
      endDate,
      userId: user.id,
      userRole: user.role,
      organizationId: user.organizationId,
    });
  }

  @Get('usage')
  @Roles(Role.ADMIN, Role.BUYER)
  @ApiOperation({ summary: 'Get LLM usage metrics' })
  @ApiResponse({ status: 200, description: 'Usage metrics' })
  async getUsageMetrics(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @CurrentUser() user: any,
  ) {
    return this.llmProcessingService.getUsageMetrics(period, user);
  }
}
