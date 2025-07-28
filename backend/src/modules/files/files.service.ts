import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId: string,
  ): Promise<FileUpload> {
    const uploadDir = path.join(process.cwd(), 'uploads', entityType);
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save file metadata to database
    const fileUpload = this.fileUploadRepository.create({
      fileName: fileName,
      originalName: file.originalname,
      filePath: filePath,
      mimeType: file.mimetype,
      size: file.size,
      entityType,
      entityId,
      url: `/uploads/${entityType}/${fileName}`,
    });

    return this.fileUploadRepository.save(fileUpload);
  }

  async uploadFiles(
    files: Express.Multer.File[],
    entityType: string,
    entityId: string,
  ): Promise<FileUpload[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file, entityType, entityId),
    );
    return Promise.all(uploadPromises);
  }

  async findAll(entityType?: string, entityId?: string): Promise<FileUpload[]> {
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    return this.fileUploadRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FileUpload> {
    const file = await this.fileUploadRepository.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.findOne(id);

    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete file record from database
    await this.fileUploadRepository.remove(file);
  }

  async getFileStream(id: string): Promise<fs.ReadStream> {
    const file = await this.findOne(id);

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return fs.createReadStream(file.filePath);
  }

  async getFileBuffer(id: string): Promise<Buffer> {
    const file = await this.findOne(id);

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return fs.readFileSync(file.filePath);
  }

  async updateFileMetadata(
    id: string,
    metadata: Partial<FileUpload>,
  ): Promise<FileUpload> {
    const file = await this.findOne(id);
    Object.assign(file, metadata);
    return this.fileUploadRepository.save(file);
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}