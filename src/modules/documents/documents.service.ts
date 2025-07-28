// modules/documents/documents.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { User } from '../../entities/user.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    metadata: {
      title: string;
      description?: string;
      category: string;
      entityType: string;
      entityId: string;
      userId: string;
      isPublic?: boolean;
    },
  ): Promise<Document> {
    // Calculate file hash
    const fileBuffer = await fs.readFile(file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check if document with same hash already exists
    const existingDoc = await this.documentRepository.findOne({
      where: { hash },
    });

    if (existingDoc) {
      // Delete the duplicate file
      await fs.unlink(file.path);
      throw new BadRequestException('Document with same content already exists');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: metadata.userId },
    });

    if (!user) {
      await fs.unlink(file.path);
      throw new NotFoundException('User not found');
    }

    // Create document record
    const document = this.documentRepository.create({
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      hash,
      entityType: metadata.entityType,
      entityId: metadata.entityId,
      uploadedBy: user,
      isPublic: metadata.isPublic || false,
    });

    return await this.documentRepository.save(document);
  }

  async findAll(filters: {
    entityType?: string;
    entityId?: string;
    category?: string;
    uploadedBy?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Document[]; total: number; page: number; limit: number }> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy');

    if (filters.entityType) {
      query.andWhere('document.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      query.andWhere('document.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.category) {
      query.andWhere('document.category = :category', {
        category: filters.category,
      });
    }

    if (filters.uploadedBy) {
      query.andWhere('document.uploadedBy.id = :uploadedBy', {
        uploadedBy: filters.uploadedBy,
      });
    }

    if (filters.isPublic !== undefined) {
      query.andWhere('document.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    query.orderBy('document.createdAt', 'DESC');

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getDocumentPath(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id);

    // Check access permissions
    if (!document.isPublic) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['organization'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has access to this document
      const hasAccess = await this.checkDocumentAccess(document, user);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied to this document');
      }
    }

    // Update download count
    document.downloadCount += 1;
    document.lastAccessedAt = new Date();
    await this.documentRepository.save(document);

    return document.path;
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id);

    // Only uploader or admin can delete
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (document.uploadedBy.id !== userId && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete documents you uploaded');
    }

    // Delete file from storage
    try {
      await fs.unlink(document.path);
    } catch (error) {
      // File might already be deleted
      console.error('Error deleting file:', error);
    }

    // Delete database record
    await this.documentRepository.remove(document);
  }

  async updateDocument(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      category?: string;
      isPublic?: boolean;
    },
    userId: string,
  ): Promise<Document> {
    const document = await this.findOne(id);

    // Only uploader or admin can update
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (document.uploadedBy.id !== userId && user.role !== 'admin') {
      throw new ForbiddenException('You can only update documents you uploaded');
    }

    Object.assign(document, updateData);
    return await this.documentRepository.save(document);
  }

  private async checkDocumentAccess(document: Document, user: User): Promise<boolean> {
    // Admin has access to all documents
    if (user.role === 'admin') {
      return true;
    }

    // User who uploaded has access
    if (document.uploadedBy.id === user.id) {
      return true;
    }

    // Check based on entity type
    switch (document.entityType) {
      case 'tender':
        // For tenders, check if user's organization is involved
        // This would require additional logic based on your business rules
        return true; // Simplified for now

      case 'bid':
        // For bids, check if user's organization submitted the bid
        return true; // Simplified for now

      case 'organization':
        // For organization documents, check if user belongs to the organization
        return user.organization?.id === document.entityId;

      default:
        return false;
    }
  }

  async getStatistics(entityType?: string, entityId?: string): Promise<any> {
    const query = this.documentRepository.createQueryBuilder('document');

    if (entityType) {
      query.where('document.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('document.entityId = :entityId', { entityId });
    }

    const documents = await query.getMany();

    const stats = {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      byCategory: {},
      byType: {},
      recentUploads: documents
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };

    // Group by category
    documents.forEach(doc => {
      if (!stats.byCategory[doc.category]) {
        stats.byCategory[doc.category] = 0;
      }
      stats.byCategory[doc.category]++;

      const ext = path.extname(doc.originalName).toLowerCase();
      if (!stats.byType[ext]) {
        stats.byType[ext] = 0;
      }
      stats.byType[ext]++;
    });

    return stats;
  }

  async cleanupOrphanedFiles(): Promise<{ deleted: number; errors: number }> {
    const uploadDir = './uploads';
    let deleted = 0;
    let errors = 0;

    try {
      const files = await fs.readdir(uploadDir);

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        
        // Check if file exists in database
        const document = await this.documentRepository.findOne({
          where: { filename: file },
        });

        if (!document) {
          // File is orphaned, delete it
          try {
            await fs.unlink(filePath);
            deleted++;
          } catch (error) {
            console.error(`Error deleting orphaned file ${file}:`, error);
            errors++;
          }
        }
      }
    } catch (error) {
      console.error('Error reading upload directory:', error);
    }

    return { deleted, errors };
  }
}
