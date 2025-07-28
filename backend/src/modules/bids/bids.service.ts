import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid, BidStatus } from './entities/bid.entity';
import { Tender, TenderStatus } from '../tenders/entities/tender.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createBidDto: CreateBidDto,
    vendorId: string,
    files?: Express.Multer.File[],
  ): Promise<Bid> {
    // Check if tender exists and is open for bidding
    const tender = await this.tenderRepository.findOne({
      where: { id: createBidDto.tenderId },
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    if (tender.status !== TenderStatus.PUBLISHED) {
      throw new BadRequestException('Tender is not open for bidding');
    }

    const now = new Date();
    if (tender.bidEndDate && now > tender.bidEndDate) {
      throw new BadRequestException('Bidding period has closed');
    }

    // Check if vendor already has a bid for this tender
    const existingBid = await this.bidRepository.findOne({
      where: {
        tender: { id: tender.id },
        vendor: { id: vendorId },
      },
    });

    if (existingBid) {
      throw new BadRequestException('You have already submitted a bid for this tender');
    }

    // Generate reference number
    const referenceNumber = `BID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Transform deviations from string[] to the expected format
    const deviations = createBidDto.deviations?.map(deviation => ({
      clause: deviation,
      description: deviation,
      impact: 'To be assessed',
    }));

    // Create bid without spread operator to avoid type issues
    const bid = this.bidRepository.create({
      referenceNumber,
      tenderId: tender.id,
      vendorId,
      organizationId: tender.organizationId,
      status: BidStatus.DRAFT,
      quotedAmount: createBidDto.quotedAmount,
      deliveryPeriod: createBidDto.deliveryPeriod,
      technicalProposal: createBidDto.technicalProposal,
      commercialProposal: createBidDto.financialProposal,
      deviations,
      notes: createBidDto.remarks,
      metadata: createBidDto.additionalInfo,
      submittedAt: new Date(),
    });

    // Handle file uploads
    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedFile = await this.filesService.uploadFile(file, 'bid', referenceNumber);
          return {
            name: file.originalname,
            url: uploadedFile.url,
            type: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
          };
        }),
      );
      bid.submittedDocuments = uploadedFiles;
    }

    const savedBid = await this.bidRepository.save(bid);

    return savedBid;
  }

  async findAll(filters: {
    page: number;
    limit: number;
    tenderId?: string;
    status?: BidStatus;
  }) {
    const { page, limit, tenderId, status } = filters;
    const skip = (page - 1) * limit;

    const query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.vendor', 'vendor')
      .leftJoinAndSelect('bid.tender', 'tender')
      .leftJoinAndSelect('bid.documents', 'documents');

    if (tenderId) {
      query.andWhere('bid.tenderId = :tenderId', { tenderId });
    }

    if (status) {
      query.andWhere('bid.status = :status', { status });
    }

    const [bids, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: bids,
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

    const [bids, total] = await this.bidRepository.findAndCount({
      where: { vendor: { id: vendorId } },
      relations: ['tender'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: bids,
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

    const [bids, total] = await this.bidRepository.findAndCount({
      where: { tender: { id: tenderId } },
      relations: ['vendor'],
      skip,
      take: limit,
      order: { quotedAmount: 'ASC' },
    });

    return {
      data: bids,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['vendor', 'tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  async update(
    id: string,
    updateBidDto: UpdateBidDto,
    vendorId: string,
    files?: Express.Multer.File[],
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id, vendor: { id: vendorId } },
      relations: ['tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Only draft bids can be updated');
    }

    // Check if tender is still open
    const now = new Date();
    if (bid.tender.bidEndDate && now > bid.tender.bidEndDate) {
      throw new BadRequestException('Bidding period has closed');
    }

    // Update bid fields
    Object.assign(bid, updateBidDto);

    // Handle new file uploads
    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedFile = await this.filesService.uploadFile(file, 'bid', bid.referenceNumber);
          return {
            name: file.originalname,
            url: uploadedFile.url,
            type: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
          };
        }),
      );
      bid.submittedDocuments = [...(bid.submittedDocuments || []), ...uploadedFiles];
    }

    return this.bidRepository.save(bid);
  }

  async submit(id: string, vendorId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id, vendor: { id: vendorId } },
      relations: ['tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Bid is already submitted');
    }

    // Validate bid completeness
    if (!bid.quotedAmount || !bid.deliveryPeriod) {
      throw new BadRequestException('Please complete all required fields before submitting');
    }

    bid.status = BidStatus.SUBMITTED;
    bid.submittedAt = new Date();

    const savedBid = await this.bidRepository.save(bid);

    return savedBid;
  }

  async withdraw(id: string, vendorId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id, vendor: { id: vendorId } },
      relations: ['tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted bids can be withdrawn');
    }

    bid.status = BidStatus.WITHDRAWN;
    bid.withdrawnAt = new Date();

    return this.bidRepository.save(bid);
  }

  async disqualify(
    id: string,
    reason: string,
    userId: string,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['vendor', 'tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    bid.status = BidStatus.DISQUALIFIED;
    bid.disqualificationReason = reason;
    bid.evaluatedBy = { id: userId } as any;
    bid.evaluatedAt = new Date();

    const savedBid = await this.bidRepository.save(bid);

    return savedBid;
  }

  async shortlist(id: string, userId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['vendor', 'tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted bids can be shortlisted');
    }

    bid.status = BidStatus.SHORTLISTED;
    // Mark bid as shortlisted
    bid.evaluatedBy = { id: userId } as any;

    const savedBid = await this.bidRepository.save(bid);

    return savedBid;
  }

  async remove(id: string, vendorId: string): Promise<void> {
    const bid = await this.bidRepository.findOne({
      where: { id, vendor: { id: vendorId } },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Only draft bids can be deleted');
    }

    await this.bidRepository.remove(bid);
  }

  async compareBids(tenderId: string) {
    const bids = await this.bidRepository.find({
      where: {
        tender: { id: tenderId },
        status: BidStatus.SUBMITTED,
      },
      relations: ['vendor'],
      order: { quotedAmount: 'ASC' },
    });

    if (bids.length === 0) {
      throw new NotFoundException('No bids found for this tender');
    }

    const lowestBid = bids[0];
    const averageAmount = bids.reduce((sum, bid) => sum + bid.quotedAmount, 0) / bids.length;

    return {
      totalBids: bids.length,
      lowestBid: {
        id: lowestBid.id,
        vendor: lowestBid.vendor.name,
        amount: lowestBid.quotedAmount,
      },
      averageAmount,
      bids: bids.map((bid) => ({
        id: bid.id,
        vendor: bid.vendor.name,
        amount: bid.quotedAmount,
        deliveryPeriod: bid.deliveryPeriod,
        // Add validity period from DTO if needed
        percentageFromLowest: ((bid.quotedAmount - lowestBid.quotedAmount) / lowestBid.quotedAmount) * 100,
      })),
    };
  }

  async getBidAnalytics(bidId: string, vendorId: string) {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId, vendor: { id: vendorId } },
      relations: ['tender'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Get all bids for the same tender
    const allBids = await this.bidRepository.find({
      where: {
        tender: { id: bid.tender.id },
        status: BidStatus.SUBMITTED,
      },
    });

    const amounts = allBids.map(b => b.quotedAmount).sort((a, b) => a - b);
    const position = amounts.indexOf(bid.quotedAmount) + 1;

    return {
      bidPosition: position,
      totalBids: allBids.length,
      lowestBid: Math.min(...amounts),
      highestBid: Math.max(...amounts),
      averageBid: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      yourBid: bid.quotedAmount,
      percentageFromLowest: ((bid.quotedAmount - amounts[0]) / amounts[0]) * 100,
    };
  }
}