import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emd, EmdStatus } from './entities/emd.entity';
import { Tender } from '../tenders/entities/tender.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateEmdDto } from './dto/create-emd.dto';
import { UpdateEmdDto } from './dto/update-emd.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class EmdService {
  constructor(
    @InjectRepository(Emd)
    private readonly emdRepository: Repository<Emd>,
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createEmdDto: CreateEmdDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<Emd> {
    // Get vendor by createdById
    const vendor = await this.vendorRepository.findOne({
      where: { createdById: userId },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor profile not found');
    }

    // Check tender
    const tender = await this.tenderRepository.findOne({
      where: { id: createEmdDto.tenderId },
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    // Check if EMD already exists
    const existingEmd = await this.emdRepository.findOne({
      where: {
        tenderId: tender.id,
        vendorId: vendor.id,
      },
    });

    if (existingEmd) {
      throw new BadRequestException('EMD already submitted for this tender');
    }

    // Generate reference number
    const referenceNumber = `EMD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create EMD
    const emd = this.emdRepository.create({
      ...createEmdDto,
      referenceNumber,
      vendorId: vendor.id,
      amount: tender.emdAmount || createEmdDto.amount,
      validUpto: this.calculateValidUpto(tender.bidEndDate),
    });

    // Handle file uploads
    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedFile = await this.filesService.uploadFile(file, 'emd', referenceNumber);
          return {
            name: file.originalname,
            url: uploadedFile.url,
            uploadedAt: new Date(),
          };
        }),
      );
      emd.documents = uploadedFiles;
    }

    return this.emdRepository.save(emd);
  }

  async findAll(filters: {
    page: number;
    limit: number;
    status?: EmdStatus;
    tenderId?: string;
    vendorId?: string;
  }) {
    const { page, limit, status, tenderId, vendorId } = filters;
    const skip = (page - 1) * limit;

    const query = this.emdRepository.createQueryBuilder('emd')
      .leftJoinAndSelect('emd.tender', 'tender')
      .leftJoinAndSelect('emd.vendor', 'vendor');

    if (status) {
      query.andWhere('emd.status = :status', { status });
    }

    if (tenderId) {
      query.andWhere('emd.tenderId = :tenderId', { tenderId });
    }

    if (vendorId) {
      query.andWhere('emd.vendorId = :vendorId', { vendorId });
    }

    const [emds, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: emds,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByVendor(
    vendorId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [emds, total] = await this.emdRepository.findAndCount({
      where: { vendorId },
      relations: ['tender'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: emds,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByTender(
    tenderId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [emds, total] = await this.emdRepository.findAndCount({
      where: { tenderId },
      relations: ['vendor'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: emds,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Emd> {
    const emd = await this.emdRepository.findOne({
      where: { id },
      relations: ['tender', 'vendor', 'verifier'],
    });

    if (!emd) {
      throw new NotFoundException('EMD not found');
    }

    return emd;
  }

  async update(
    id: string,
    updateEmdDto: UpdateEmdDto,
    userId: string,
  ): Promise<Emd> {
    const emd = await this.findOne(id);

    if (emd.status !== EmdStatus.PENDING) {
      throw new BadRequestException('Only pending EMDs can be updated');
    }

    Object.assign(emd, updateEmdDto);

    return this.emdRepository.save(emd);
  }

  async verify(
    id: string,
    verifierId: string,
    remarks?: string,
  ): Promise<Emd> {
    const emd = await this.findOne(id);

    if (emd.status !== EmdStatus.PAID) {
      throw new BadRequestException('Only paid EMDs can be verified');
    }

    emd.status = EmdStatus.VERIFIED;
    emd.verifiedAt = new Date();
    emd.verifiedBy = verifierId;
    if (remarks) {
      emd.remarks = remarks;
    }

    return this.emdRepository.save(emd);
  }

  async refund(
    id: string,
    reason: string,
    transactionId: string | undefined,
    userId: string,
  ): Promise<Emd> {
    const emd = await this.findOne(id);

    if (emd.status !== EmdStatus.VERIFIED) {
      throw new BadRequestException('Only verified EMDs can be refunded');
    }

    emd.status = EmdStatus.REFUNDED;
    emd.refundedAt = new Date();
    emd.refundReason = reason;
    if (transactionId) {
      emd.refundTransactionId = transactionId;
    }

    return this.emdRepository.save(emd);
  }

  async forfeit(
    id: string,
    reason: string,
    userId: string,
  ): Promise<Emd> {
    const emd = await this.findOne(id);

    if (emd.status !== EmdStatus.VERIFIED) {
      throw new BadRequestException('Only verified EMDs can be forfeited');
    }

    emd.status = EmdStatus.FORFEITED;
    emd.forfeitedAt = new Date();
    emd.forfeitureReason = reason;

    return this.emdRepository.save(emd);
  }

  async getTenderEmdSummary(tenderId: string) {
    const emds = await this.emdRepository.find({
      where: { tenderId },
      relations: ['vendor'],
    });

    const summary = {
      total: emds.length,
      pending: emds.filter(e => e.status === EmdStatus.PENDING).length,
      paid: emds.filter(e => e.status === EmdStatus.PAID).length,
      verified: emds.filter(e => e.status === EmdStatus.VERIFIED).length,
      refunded: emds.filter(e => e.status === EmdStatus.REFUNDED).length,
      forfeited: emds.filter(e => e.status === EmdStatus.FORFEITED).length,
      totalAmount: emds.reduce((sum, e) => sum + Number(e.amount), 0),
      vendors: emds.map(e => ({
        id: e.vendor.id,
        name: e.vendor.legalName,
        status: e.status,
        amount: e.amount,
        paidAt: e.paidAt,
      })),
    };

    return summary;
  }

  async remove(id: string): Promise<void> {
    const emd = await this.findOne(id);

    if (emd.status !== EmdStatus.PENDING) {
      throw new BadRequestException('Only pending EMDs can be deleted');
    }

    await this.emdRepository.remove(emd);
  }

  private calculateValidUpto(bidEndDate: Date): Date {
    const validUpto = new Date(bidEndDate);
    validUpto.setDate(validUpto.getDate() + 180); // Valid for 180 days after bid end date
    return validUpto;
  }
}