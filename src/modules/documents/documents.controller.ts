// modules/documents/documents.controller.ts
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
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as fs from 'fs';

class UploadDocumentDto {
  title: string;
  description?: string;
  category: string;
  entityType: string;
  entityId: string;
  isPublic?: boolean;
}

class UpdateDocumentDto {
  title?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles('admin', 'buyer', 'supplier')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        isPublic: { type: 'boolean' },
      },
      required: ['file', 'title', 'category', 'entityType', 'entityId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.uploadDocument(file, {
      ...uploadDto,
      userId: req.user.id,
    });
  }

  @Get()
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get all documents with filters' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'uploadedBy', required: false })
  @ApiQuery({ name: 'isPublic', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  findAll(@Query() query, @Request() req) {
    // Non-admin users can only see public documents or their own
    if (req.user.role !== 'admin') {
      query.uploadedBy = req.user.id;
    }

    return this.documentsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/download')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({ status: 200, description: 'Document file' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const filePath = await this.documentsService.getDocumentPath(id, req.user.id);
    const document = await this.documentsService.findOne(id);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalName}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Patch(':id')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.updateDocument(id, updateDocumentDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.deleteDocument(id, req.user.id);
  }

  @Get('statistics/:entityType/:entityId')
  @Roles('admin', 'buyer', 'supplier')
  @ApiOperation({ summary: 'Get document statistics for an entity' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.documentsService.getStatistics(entityType, entityId);
  }

  @Post('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up orphaned files' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  async cleanupOrphanedFiles() {
    const result = await this.documentsService.cleanupOrphanedFiles();
    return {
      success: true,
      ...result,
    };
  }
}

import { BadRequestException } from '@nestjs/common';
