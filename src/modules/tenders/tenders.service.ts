// modules/tenders/tenders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In } from 'typeorm';
import { Tender, TenderStatus } from './entities/tender.entity';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { SearchTenderDto } from './dto/search-tender.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
  ) {}

  async create(createTenderDto: CreateTenderDto, userId: string): Promise<Tender> {
    // Generate unique reference number
    const referenceNumber = await this.generateReferenceNumber();

    const tender = this.tenderRepository.create({
      ...createTenderDto,
      referenceNumber,
      createdById: userId,
    });

    return await this.tenderRepository.save(tender);
  }

  async findAll(searchDto: SearchTenderDto): Promise<{ data: Tender[]; total: number }> {
    const queryBuilder = this.tenderRepository.createQueryBuilder('tender')
      .leftJoinAndSelect('tender.organization', 'organization')
      .leftJoinAndSelect('tender.createdBy', 'createdBy');

    // Apply filters
    if (searchDto.status) {
      queryBuilder.andWhere('tender.status = :status', { status: searchDto.status });
    }

    if (searchDto.type) {
      queryBuilder.andWhere('tender.type = :type', { type: searchDto.type });
    }

    if (searchDto.organizationId) {
      queryBuilder.andWhere('tender.organizationId = :organizationId', { 
        organizationId: searchDto.organizationId 
      });
    }

    if (searchDto.search) {
      queryBuilder.andWhere(
        '(tender.title ILIKE :search OR tender.description ILIKE :search OR tender.referenceNumber ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    if (searchDto.minValue) {
      queryBuilder.andWhere('tender.estimatedValue >= :minValue', { 
        minValue: searchDto.minValue 
      });
    }

    if (searchDto.maxValue) {
      queryBuilder.andWhere('tender.estimatedValue <= :maxValue', { 
        maxValue: searchDto.maxValue 
      });
    }

    if (searchDto.startDate && searchDto.endDate) {
      queryBuilder.andWhere('tender.publishDate BETWEEN :startDate AND :endDate', {
        startDate: searchDto.startDate,
        endDate: searchDto.endDate,
      });
    }

    // Pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`tender.${sortBy}`, sortOrder);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Tender> {
    const tender = await this.tenderRepository.findOne({
      where: { id },
      relations: ['organization', 'createdBy', 'bids', 'documents'],
    });

    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }

    return tender;
  }

  async update(id: string, updateTenderDto: UpdateTenderDto): Promise<Tender> {
    const tender = await this.findOne(id);

    Object.assign(tender, updateTenderDto);
    return await this.tenderRepository.save(tender);
  }

  async remove(id: string): Promise<void> {
    const tender = await this.findOne(id);
    
    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException('Only draft tenders can be deleted');
    }

    await this.tenderRepository.remove(tender);
  }

  async publishTender(id: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException('Only draft tenders can be published');
    }

    tender.status = TenderStatus.PUBLISHED;
    tender.publishDate = new Date();

    return await this.tenderRepository.save(tender);
  }

  async closeTender(id: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.status !== TenderStatus.ACTIVE) {
      throw new BadRequestException('Only active tenders can be closed');
    }

    tender.status = TenderStatus.CLOSED;
    return await this.tenderRepository.save(tender);
  }

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.tenderRepository.count({
      where: {
        referenceNumber: Like(`TND-${year}-%`),
      },
    });

    return `TND-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async getActiveTenders(): Promise<Tender[]> {
    const now = new Date();
    return await this.tenderRepository.find({
      where: {
        status: TenderStatus.ACTIVE,
        bidClosingDate: Between(now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
      },
      relations: ['organization'],
      order: { bidClosingDate: 'ASC' },
    });
  }

  async getTendersByOrganization(organizationId: string): Promise<Tender[]> {
    return await this.tenderRepository.find({
      where: { organizationId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
