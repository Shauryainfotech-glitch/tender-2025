import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, LessThan } from 'typeorm';
import { EMD, EMDStatus, PaymentMethod } from './entities/emd.entity';
import { EMDTransaction, TransactionType, TransactionStatus } from './entities/emd-transaction.entity';
import { TendersService } from '../tenders/tenders.service';
import { BidsService } from '../bids/bids.service';
import { CreateEMDDto } from './dto/create-emd.dto';
import { VerifyEMDDto } from './dto/verify-emd.dto';
import { RefundEMDDto } from './dto/refund-emd.dto';
import { ForfeitEMDDto } from './dto/forfeit-emd.dto';
import { DateUtil } from '../../common/utils/date.util';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { ERROR_CODES } from '../../common/constants/error-codes.constants';

@Injectable()
export class EMDService {
  constructor(
    @InjectRepository(EMD)
    private readonly emdRepository: Repository<EMD>,
    @InjectRepository(EMDTransaction)
    private readonly transactionRepository: Repository<EMDTransaction>,
    private readonly tendersService: TendersService,
    private readonly bidsService: BidsService,
  ) {}

  async calculateEMD(tenderId: number, bidAmount?: number): Promise<{ amount: number; percentage: number }> {
    const tender = await this.tendersService.findOne(tenderId);
    
    if (!tender) {
      throw new NotFoundException(ERROR_CODES.TENDER_NOT_FOUND.message);
    }

    if (tender.emdExempted) {
      return { amount: 0, percentage: 0 };
    }

    // If tender has fixed EMD amount
    if (tender.emdAmount > 0) {
      return { amount: tender.emdAmount, percentage: 0 };
    }

    // Calculate based on percentage (default 2% of bid amount or estimated value)
    const baseAmount = bidAmount || tender.estimatedValue;
    const percentage = tender.emdPercentage || 2;
    const amount = (baseAmount * percentage) / 100;

    // Apply min/max limits if defined
    let finalAmount = amount;
    if (tender.minEmdAmount && finalAmount < tender.minEmdAmount) {
      finalAmount = tender.minEmdAmount;
    }
    if (tender.maxEmdAmount && finalAmount > tender.maxEmdAmount) {
      finalAmount = tender.maxEmdAmount;
    }

    return { amount: finalAmount, percentage };
  }

  async submitEMD(createDto: CreateEMDDto, userId: number): Promise<EMD> {
    // Validate tender
    const tender = await this.tendersService.findOne(createDto.tenderId);
    if (!tender) {
      throw new NotFoundException(ERROR_CODES.TENDER_NOT_FOUND.message);
    }

    if (tender.emdExempted) {
      throw new BadRequestException('EMD is exempted for this tender');
    }

    // Check if EMD already exists for this bid
    if (createDto.bidId) {
      const existingEMD = await this.emdRepository.findOne({
        where: { bidId: createDto.bidId, status: Not(EMDStatus.EXPIRED) },
      });

      if (existingEMD) {
        throw new BadRequestException('EMD already submitted for this bid');
      }
    }

    // Generate EMD number
    const emdNumber = await this.generateEMDNumber();

    // Create EMD
    const emd = this.emdRepository.create({
      ...createDto,
      emdNumber,
      status: EMDStatus.PENDING,
    });

    const savedEMD = await this.emdRepository.save(emd);

    // Create payment transaction
    const transaction = this.transactionRepository.create({
      transactionNumber: await this.generateTransactionNumber(),
      emdId: savedEMD.id,
      type: TransactionType.PAYMENT,
      amount: savedEMD.amount,
      currency: savedEMD.currency,
      status: TransactionStatus.INITIATED,
      initiatedBy: userId,
    });

    await this.transactionRepository.save(transaction);

    return savedEMD;
  }

  async verifyEMD(id: number, verifyDto: VerifyEMDDto, userId: number): Promise<EMD> {
    const emd = await this.findOne(id);

    if (emd.status !== EMDStatus.PAID) {
      throw new BadRequestException('Only paid EMDs can be verified');
    }

    emd.status = verifyDto.isValid ? EMDStatus.VERIFIED : EMDStatus.PENDING;
    emd.verificationRemarks = verifyDto.remarks;
    emd.verifiedBy = userId;
    emd.verifiedAt = new Date();

    return await this.emdRepository.save(emd);
  }

  async refundEMD(id: number, refundDto: RefundEMDDto, userId: number): Promise<EMD> {
    const emd = await this.findOne(id);

    if (![EMDStatus.VERIFIED, EMDStatus.PAID].includes(emd.status)) {
      throw new BadRequestException('EMD must be verified or paid to initiate refund');
    }

    // Create refund transaction
    const transaction = this.transactionRepository.create({
      transactionNumber: await this.generateTransactionNumber(),
      emdId: emd.id,
      type: TransactionType.REFUND,
      amount: refundDto.amount || emd.amount,
      currency: emd.currency,
      status: TransactionStatus.INITIATED,
      remarks: refundDto.reason,
      initiatedBy: userId,
    });

    await this.transactionRepository.save(transaction);

    emd.status = EMDStatus.REFUNDED;
    emd.refundReason = refundDto.reason;
    emd.refundedAt = new Date();

    return await this.emdRepository.save(emd);
  }

  async forfeitEMD(id: number, forfeitDto: ForfeitEMDDto, userId: number): Promise<EMD> {
    const emd = await this.findOne(id);

    if (![EMDStatus.VERIFIED, EMDStatus.PAID].includes(emd.status)) {
      throw new BadRequestException('EMD must be verified or paid to forfeit');
    }

    // Create forfeiture transaction
    const transaction = this.transactionRepository.create({
      transactionNumber: await this.generateTransactionNumber(),
      emdId: emd.id,
      type: TransactionType.FORFEITURE,
      amount: emd.amount,
      currency: emd.currency,
      status: TransactionStatus.COMPLETED,
      remarks: forfeitDto.reason,
      initiatedBy: userId,
      approvedBy: userId,
      approvedAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    emd.status = EMDStatus.FORFEITED;
    emd.forfeitureReason = forfeitDto.reason;
    emd.forfeitedAt = new Date();

    return await this.emdRepository.save(emd);
  }

  async getAllEMDs(filters: any) {
    const query = this.emdRepository.createQueryBuilder('emd')
      .leftJoinAndSelect('emd.tender', 'tender')
      .leftJoinAndSelect('emd.organization', 'organization')
      .leftJoinAndSelect('emd.bid', 'bid');

    if (filters.tenderId) {
      query.andWhere('emd.tenderId = :tenderId', { tenderId: filters.tenderId });
    }

    if (filters.organizationId) {
      query.andWhere('emd.organizationId = :organizationId', { 
        organizationId: filters.organizationId 
      });
    }

    if (filters.status) {
      query.andWhere('emd.status = :status', { status: filters.status });
    }

    const [data, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getOrganizationEMDs(organizationId: number, filters: any) {
    return this.getAllEMDs({ ...filters, organizationId });
  }

  async getEMDDetails(id: number): Promise<EMD> {
    const emd = await this.emdRepository.findOne({
      where: { id },
      relations: ['tender', 'organization', 'bid', 'transactions'],
    });

    if (!emd) {
      throw new NotFoundException('EMD not found');
    }

    return emd;
  }

  async getEMDTransactions(emdId: number): Promise<EMDTransaction[]> {
    return await this.transactionRepository.find({
      where: { emdId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTenderEMDSummary(tenderId: number) {
    const emds = await this.emdRepository.find({
      where: { tenderId },
      relations: ['organization', 'bid'],
    });

    const summary = {
      total: emds.length,
      totalAmount: emds.reduce((sum, emd) => sum + Number(emd.amount), 0),
      statusBreakdown: emds.reduce((acc, emd) => {
        acc[emd.status] = (acc[emd.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      paymentMethodBreakdown: emds.reduce((acc, emd) => {
        acc[emd.paymentMethod] = (acc[emd.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return summary;
  }

  async bulkRefundEMDs(
    tenderId: number, 
    excludeBidIds: number[] = [], 
    reason: string, 
    userId: number
  ) {
    const emds = await this.emdRepository.find({
      where: {
        tenderId,
        status: In([EMDStatus.VERIFIED, EMDStatus.PAID]),
        ...(excludeBidIds.length > 0 && { bidId: Not(In(excludeBidIds)) }),
      },
    });

    const results = {
      successful: 0,
      failed: 0,
      total: emds.length,
    };

    for (const emd of emds) {
      try {
        await this.refundEMD(emd.id, { reason }, userId);
        results.successful++;
      } catch (error) {
        results.failed++;
      }
    }

    return results;
  }

  async getPendingRefundsReport() {
    const pendingRefunds = await this.transactionRepository.find({
      where: {
        type: TransactionType.REFUND,
        status: In([TransactionStatus.INITIATED, TransactionStatus.PROCESSING]),
      },
      relations: ['emd', 'emd.tender', 'emd.organization'],
    });

    return {
      total: pendingRefunds.length,
      totalAmount: pendingRefunds.reduce((sum, t) => sum + Number(t.amount), 0),
      byStatus: pendingRefunds.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      transactions: pendingRefunds,
    };
  }

  async getExpiringEMDsReport(days: number) {
    const expiryDate = DateUtil.addDays(new Date(), days);

    const expiringEMDs = await this.emdRepository.find({
      where: {
        status: In([EMDStatus.VERIFIED, EMDStatus.PAID]),
        validityDate: LessThan(expiryDate),
      },
      relations: ['tender', 'organization'],
    });

    return {
      total: expiringEMDs.length,
      totalAmount: expiringEMDs.reduce((sum, emd) => sum + Number(emd.amount), 0),
      byDaysRemaining: expiringEMDs.map(emd => ({
        emd,
        daysRemaining: DateUtil.getDifferenceInDays(new Date(), emd.validityDate),
      })).sort((a, b) => a.daysRemaining - b.daysRemaining),
    };
  }

  async checkAndExpireEMDs() {
    const expiredEMDs = await this.emdRepository.find({
      where: {
        status: In([EMDStatus.PENDING, EMDStatus.PAID, EMDStatus.VERIFIED]),
        validityDate: LessThan(new Date()),
      },
    });

    for (const emd of expiredEMDs) {
      emd.status = EMDStatus.EXPIRED;
      await this.emdRepository.save(emd);
    }

    return { expired: expiredEMDs.length };
  }

  private async findOne(id: number): Promise<EMD> {
    const emd = await this.emdRepository.findOne({
      where: { id },
      relations: ['tender', 'organization', 'bid'],
    });

    if (!emd) {
      throw new NotFoundException('EMD not found');
    }

    return emd;
  }

  private async generateEMDNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.emdRepository.count({
      where: {
        emdNumber: Like(`EMD/${year}/%`),
      },
    });

    return `EMD/${year}/${String(count + 1).padStart(6, '0')}`;
  }

  private async generateTransactionNumber(): Promise<string> {
    const timestamp = Date.now();
    return `TXN${timestamp}`;
  }
}

// Import the Like operator
import { Like } from 'typeorm';
