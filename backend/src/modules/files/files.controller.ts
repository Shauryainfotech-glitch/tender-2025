import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @CurrentUser() user: any,
  ) {
    const fileUpload = await this.filesService.uploadFile(file, entityType, entityId);
    return {
      id: fileUpload.id,
      fileName: fileUpload.fileName,
      originalName: fileUpload.originalName,
      mimeType: fileUpload.mimeType,
      size: fileUpload.size,
      url: fileUpload.url,
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @CurrentUser() user: any,
  ) {
    const fileUploads = await this.filesService.uploadFiles(files, entityType, entityId);
    return fileUploads.map(file => ({
      id: file.id,
      fileName: file.fileName,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      url: file.url,
    }));
  }

  @Get()
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.filesService.findAll(entityType, entityId);
  }

  @Get('entity/:entityType/:entityId')
  async getFilesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.filesService.getFilesByEntity(entityType, entityId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findOne(id);
    const stream = await this.filesService.getFileStream(id);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size,
    });
    
    stream.pipe(res);
  }

  @Get(':id/view')
  async viewFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findOne(id);
    const stream = await this.filesService.getFileStream(id);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.originalName}"`,
      'Content-Length': file.size,
    });
    
    stream.pipe(res);
  }

  @Patch(':id')
  async updateMetadata(
    @Param('id') id: string,
    @Body() updateDto: { description?: string; metadata?: Record<string, any> },
  ) {
    return this.filesService.updateFileMetadata(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }
}