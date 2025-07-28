// modules/bids/bids.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../../entities/bid.entity';
import { Tender } from '../../entities/tender.entity';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { EvaluateBidDto } from './dto/evaluate-bid.dto';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Tender)
    private tenderRepository: Repository<Tender>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createBidDto: CreateBidDto, userId: string): Promise<Bid> {
    // Verify tender exists and is open for bidding
    const tender = await this.tenderRepository.findOne({
      where: { id: createBidDto.tenderId },
      relations: ['organization'],
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    if (tender.status !== 'published') {
      throw new BadRequestException('Tender is not open for bidding');
    }

    // Check bid submission deadline
    const now = new Date();
    if (tender.bidDeadline && new Date(tender.bidDeadline) < now) {
      throw new BadRequestException('Bid submission deadline has passed');
    }

    // Verify user and organization
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.organization) {
      throw new BadRequestException('User must belong to an organization to submit bids');
    }

    // Check if organization has already submitted a bid for this tender
    const existingBid = await this.bidRepository.findOne({
      where: {
        tender: { id: tender.id },
        organization: { id: user.organization.id },
        status: 'submitted',
      },
    });

    if (existingBid) {
      throw new BadRequestException('Your organization has already submitted a bid for this tender');
    }

    // Create bid
    const bid = this.bidRepository.create({
      ...createBidDto,
      tender,
      organization: user.organization,
      submittedBy: user,
      status: 'submitted',
      submittedAt: new Date(),
    });

    return await this.bidRepository.save(bid);
  }

  async findAll(filters: any): Promise<Bid[]> {
    const query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.tender', 'tender')
      .leftJoinAndSelect('bid.organization', 'organization')
      .leftJoinAndSelect('bid.submittedBy', 'submittedBy')
      .leftJoinAndSelect('bid.evaluatedBy', 'evaluatedBy');

    if (filters.tenderId) {
      query.andWhere('bid.tender.id = :tenderId', { tenderId: filters.tenderId });
    }

    if (filters.organizationId) {
      query.andWhere('bid.organization.id = :organizationId', { organizationId: filters.organizationId });
    }

    if (filters.status) {
      query.andWhere('bid.status = :status', { status: filters.status });
    }

    if (filters.minAmount) {
      query.andWhere('bid.amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount) {
      query.andWhere('bid.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    query.orderBy('bid.submittedAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['tender', 'organization', 'submittedBy', 'evaluatedBy'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  async findByTender(tenderId: string): Promise<Bid[]> {
    return await this.bidRepository.find({
      where: { tender: { id: tenderId } },
      relations: ['organization', 'submittedBy', 'evaluatedBy'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Bid[]> {
    return await this.bidRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['tender', 'submittedBy', 'evaluatedBy'],
      order: { submittedAt: 'DESC' },
    });
  }

  async update(id: string, updateBidDto: UpdateBidDto, userId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    // Verify user belongs to the same organization
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.organization || user.organization.id !== bid.organization.id) {
      throw new ForbiddenException('You can only update bids from your organization');
    }

    // Can only update submitted bids
    if (bid.status !== 'submitted') {
      throw new BadRequestException('Can only update bids with submitted status');
    }

    // Check if tender is still open
    if (bid.tender.status !== 'published') {
      throw new BadRequestException('Tender is no longer open for bidding');
    }

    // Check deadline
    const now = new Date();
    if (bid.tender.bidDeadline && new Date(bid.tender.bidDeadline) < now) {
      throw new BadRequestException('Bid submission deadline has passed');
    }

    Object.assign(bid, updateBidDto);
    return await this.bidRepository.save(bid);
  }

  async withdraw(id: string, userId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    // Verify user belongs to the same organization
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.organization || user.organization.id !== bid.organization.id) {
      throw new ForbiddenException('You can only withdraw bids from your organization');
    }

    if (bid.status !== 'submitted') {
      throw new BadRequestException('Can only withdraw submitted bids');
    }

    bid.status = 'withdrawn';
    bid.withdrawnAt = new Date();
    return await this.bidRepository.save(bid);
  }

  async evaluate(id: string, evaluateBidDto: EvaluateBidDto, userId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    // Verify user is from the tender owner organization
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.organization || user.organization.id !== bid.tender.organization.id) {
      throw new ForbiddenException('Only tender owner organization can evaluate bids');
    }

    if (bid.status !== 'submitted') {
      throw new BadRequestException('Can only evaluate submitted bids');
    }

    // Update bid evaluation
    bid.technicalScore = evaluateBidDto.technicalScore;
    bid.financialScore = evaluateBidDto.financialScore;
    bid.overallScore = evaluateBidDto.overallScore;
    bid.evaluationNotes = evaluateBidDto.evaluationNotes;
    bid.status = 'evaluated';
    bid.evaluatedBy = user;
    bid.evaluatedAt = new Date();

    return await this.bidRepository.save(bid);
  }

  async selectWinner(tenderId: string, bidId: string, userId: string): Promise<Bid> {
    // Verify tender and bid
    const tender = await this.tenderRepository.findOne({
      where: { id: tenderId },
      relations: ['organization'],
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    const bid = await this.findOne(bidId);

    if (bid.tender.id !== tenderId) {
      throw new BadRequestException('Bid does not belong to this tender');
    }

    // Verify user is from the tender owner organization
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user || !user.organization || user.organization.id !== tender.organization.id) {
      throw new ForbiddenException('Only tender owner organization can select winners');
    }

    if (bid.status !== 'evaluated') {
      throw new BadRequestException('Can only select evaluated bids as winners');
    }

    // Mark current bid as selected
    bid.status = 'selected';
    await this.bidRepository.save(bid);

    // Mark all other bids as rejected
    await this.bidRepository.update(
      { 
        tender: { id: tenderId },
        id: Not(bidId),
        status: 'evaluated'
      },
      { status: 'rejected' }
    );

    // Update tender status
    tender.status = 'awarded';
    await this.tenderRepository.save(tender);

    return bid;
  }

  async getStatistics(tenderId: string): Promise<any> {
    const bids = await this.findByTender(tenderId);
    
    const stats = {
      totalBids: bids.length,
      submittedBids: bids.filter(b => b.status === 'submitted').length,
      evaluatedBids: bids.filter(b => b.status === 'evaluated').length,
      averageAmount: 0,
      lowestBid: null,
      highestBid: null,
    };

    if (bids.length > 0) {
      const amounts = bids.map(b => b.amount);
      stats.averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      stats.lowestBid = Math.min(...amounts);
      stats.highestBid = Math.max(...amounts);
    }

    return stats;
  }
}

// Import the Not operator from TypeORM
import { Not } from 'typeorm';
