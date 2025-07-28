import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { unlink } from 'fs';

const unlinkAsync = promisify(unlink);

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: number, metadata?: any): Promise<File> {
    try {
      const newFile = this.fileRepository.create({
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedById: userId,
        metadata,
      });

      return await this.fileRepository.save(newFile);
    } catch (error) {
      // Clean up the uploaded file if database save fails
      await this.deleteFileFromDisk(file.path);
      throw new InternalServerErrorException('Failed to save file information');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], userId: number, metadata?: any): Promise<File[]> {
    const uploadedFiles: File[] = [];
    
    try {
      for (const file of files) {
        const uploadedFile = await this.uploadFile(file, userId, metadata);
        uploadedFiles.push(uploadedFile);
      }
      
      return uploadedFiles;
    } catch (error) {
      // Clean up all uploaded files if any fails
      for (const file of uploadedFiles) {
        await this.deleteFile(file.id, userId);
      }
      throw error;
    }
  }

  async getFileInfo(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['uploadedBy'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; mimeType: string; originalName: string; size: number }> {
    const file = await this.getFileInfo(id);

    try {
      const buffer = await fs.readFile(file.path);
      return {
        buffer,
        mimeType: file.mimeType,
        originalName: file.originalName,
        size: file.size,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to read file');
    }
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    const file = await this.getFileInfo(id);

    // Check if user has permission to delete
    if (file.uploadedById !== userId && !await this.isUserAdmin(userId)) {
      throw new BadRequestException('You do not have permission to delete this file');
    }

    // Soft delete
    file.deletedAt = new Date();
    await this.fileRepository.save(file);

    // Delete physical file
    await this.deleteFileFromDisk(file.path);
  }

  async getFilesByEntity(entityType: string, entityId: number, documentType?: string): Promise<File[]> {
    const query = this.fileRepository.createQueryBuilder('file')
      .where('file.entityType = :entityType', { entityType })
      .andWhere('file.entityId = :entityId', { entityId })
      .andWhere('file.deletedAt IS NULL');

    if (documentType) {
      query.andWhere('file.documentType = :documentType', { documentType });
    }

    return query.getMany();
  }

  async attachFileToEntity(
    fileId: number,
    entityType: string,
    entityId: number,
    documentType?: string,
    userId: number,
  ): Promise<File> {
    const file = await this.getFileInfo(fileId);

    // Check if user has permission
    if (file.uploadedById !== userId && !await this.isUserAdmin(userId)) {
      throw new BadRequestException('You do not have permission to attach this file');
    }

    file.entityType = entityType;
    file.entityId = entityId;
    if (documentType) {
      file.documentType = documentType;
    }

    return await this.fileRepository.save(file);
  }

  async detachFileFromEntity(
    fileId: number,
    entityType: string,
    entityId: number,
    userId: number,
  ): Promise<File> {
    const file = await this.getFileInfo(fileId);

    // Verify the file is attached to the specified entity
    if (file.entityType !== entityType || file.entityId !== entityId) {
      throw new BadRequestException('File is not attached to the specified entity');
    }

    // Check if user has permission
    if (file.uploadedById !== userId && !await this.isUserAdmin(userId)) {
      throw new BadRequestException('You do not have permission to detach this file');
    }

    file.entityType = null;
    file.entityId = null;
    file.documentType = null;

    return await this.fileRepository.save(file);
  }

  async getUserFileStats(userId: number): Promise<any> {
    const stats = await this.fileRepository
      .createQueryBuilder('file')
      .select('COUNT(*)', 'totalFiles')
      .addSelect('SUM(file.size)', 'totalSize')
      .addSelect('file.mimeType', 'mimeType')
      .where('file.uploadedById = :userId', { userId })
      .andWhere('file.deletedAt IS NULL')
      .groupBy('file.mimeType')
      .getRawMany();

    const totalStats = await this.fileRepository
      .createQueryBuilder('file')
      .select('COUNT(*)', 'totalFiles')
      .addSelect('SUM(file.size)', 'totalSize')
      .where('file.uploadedById = :userId', { userId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    return {
      totalFiles: parseInt(totalStats.totalFiles) || 0,
      totalSize: parseInt(totalStats.totalSize) || 0,
      byType: stats.map(s => ({
        mimeType: s.mimeType,
        count: parseInt(s.totalFiles),
        size: parseInt(s.totalSize),
      })),
    };
  }

  async cleanupOrphanedFiles(): Promise<{ deletedCount: number; freedSpace: number }> {
    // Find files that are not attached to any entity and are older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orphanedFiles = await this.fileRepository.find({
      where: {
        entityType: IsNull(),
        entityId: IsNull(),
        createdAt: LessThan(sevenDaysAgo),
        deletedAt: IsNull(),
      },
    });

    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of orphanedFiles) {
      try {
        await this.deleteFileFromDisk(file.path);
        file.deletedAt = new Date();
        await this.fileRepository.save(file);
        deletedCount++;
        freedSpace += file.size;
      } catch (error) {
        console.error(`Failed to delete orphaned file ${file.id}:`, error);
      }
    }

    return { deletedCount, freedSpace };
  }

  private async deleteFileFromDisk(filePath: string): Promise<void> {
    try {
      await unlinkAsync(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to delete file from disk: ${filePath}`, error);
      }
    }
  }

  private async isUserAdmin(userId: number): Promise<boolean> {
    // This should be implemented based on your user/role system
    // For now, returning false
    return false;
  }

  async generatePresignedUrl(fileId: number, expiresIn: number = 3600): Promise<string> {
    const file = await this.getFileInfo(fileId);
    
    // In a production environment, you would use a service like AWS S3 to generate presigned URLs
    // For local storage, we'll return a URL with a token
    const token = Buffer.from(`${fileId}:${Date.now() + expiresIn * 1000}`).toString('base64');
    
    return `${process.env.APP_URL}/api/files/download/${fileId}?token=${token}`;
  }

  async validateFileAccess(fileId: number, userId: number): Promise<boolean> {
    const file = await this.getFileInfo(fileId);
    
    // Implement your access control logic here
    // For example:
    // - Check if user owns the file
    // - Check if user has access to the entity the file is attached to
    // - Check if file is public
    
    return file.uploadedById === userId || await this.isUserAdmin(userId);
  }
}

// Create directory decorator if needed
export function CurrentUser() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // This is a placeholder - implement based on your auth system
  };
}
