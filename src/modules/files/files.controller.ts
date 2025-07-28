import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  HttpStatus,
  ParseIntPipe,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const metadata = body.metadata ? JSON.parse(body.metadata) : {};
    return this.filesService.uploadFile(file, user.id, metadata);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Files uploaded successfully' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
    @Body() body: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const metadata = body.metadata ? JSON.parse(body.metadata) : {};
    return this.filesService.uploadMultipleFiles(files, user.id, metadata);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File information retrieved successfully' })
  async getFileInfo(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getFileInfo(id);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File downloaded successfully' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fileData = await this.filesService.downloadFile(id);
    
    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${fileData.originalName}"`,
      'Content-Length': fileData.size,
    });

    res.send(fileData.buffer);
  }

  @Get('preview/:id')
  @ApiOperation({ summary: 'Preview a file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File preview retrieved successfully' })
  async previewFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fileData = await this.filesService.downloadFile(id);
    
    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `inline; filename="${fileData.originalName}"`,
      'Content-Length': fileData.size,
    });

    res.send(fileData.buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File deleted successfully' })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.filesService.deleteFile(id, user.id);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get files by entity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Files retrieved successfully' })
  async getFilesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query('documentType') documentType?: string,
  ) {
    return this.filesService.getFilesByEntity(entityType, entityId, documentType);
  }

  @Post('attach')
  @ApiOperation({ summary: 'Attach existing file to entity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File attached successfully' })
  async attachFileToEntity(
    @Body() attachDto: {
      fileId: number;
      entityType: string;
      entityId: number;
      documentType?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.filesService.attachFileToEntity(
      attachDto.fileId,
      attachDto.entityType,
      attachDto.entityId,
      attachDto.documentType,
      user.id,
    );
  }

  @Post('detach')
  @ApiOperation({ summary: 'Detach file from entity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File detached successfully' })
  async detachFileFromEntity(
    @Body() detachDto: {
      fileId: number;
      entityType: string;
      entityId: number;
    },
    @CurrentUser() user: User,
  ) {
    return this.filesService.detachFileFromEntity(
      detachDto.fileId,
      detachDto.entityType,
      detachDto.entityId,
      user.id,
    );
  }

  @Get('stats/user')
  @ApiOperation({ summary: 'Get user file statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File statistics retrieved successfully' })
  async getUserFileStats(@CurrentUser() user: User) {
    return this.filesService.getUserFileStats(user.id);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up orphaned files' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cleanup completed successfully' })
  async cleanupOrphanedFiles(@CurrentUser() user: User) {
    // Only admins can perform cleanup
    if (user.role !== 'admin') {
      throw new BadRequestException('Only administrators can perform cleanup');
    }
    return this.filesService.cleanupOrphanedFiles();
  }
}
