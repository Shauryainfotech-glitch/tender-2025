import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tender, TenderStatus } from './entities/tender.entity';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { User } from '../auth/entities/user.entity';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private tenderRepository: Repository<Tender>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private filesService: FilesService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    createTenderDto: CreateTenderDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<Tender> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tender = this.tenderRepository.create({
      ...createTenderDto,
      createdBy: user,
      organization: user.organization,
      status: TenderStatus.DRAFT,
    });

    const savedTender = await this.tenderRepository.save(tender);

    if (files && files.length > 0) {
      for (const file of files) {
        await this.filesService.uploadFile(file, 'tender', savedTender.id);
      }
    }

    return savedTender;
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: TenderStatus;
    category?: string;
    search?: string;
  }) {
    const { page, limit, status, category, search } = params;
    const skip = (page - 1) * limit;

    const query = this.tenderRepository
      .createQueryBuilder('tender')
      .leftJoinAndSelect('tender.organization', 'organization')
      .leftJoinAndSelect('tender.createdBy', 'createdBy')
      .where('tender.status != :draftStatus', { draftStatus: TenderStatus.DRAFT });

    if (status) {
      query.andWhere('tender.status = :status', { status });
    }

    if (category) {
      query.andWhere('tender.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(tender.title ILIKE :search OR tender.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [tenders, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('tender.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: tenders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [tenders, total] = await this.tenderRepository.findAndCount({
      where: { createdBy: { id: userId } },
      relations: ['organization', 'bids'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tenders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByOrganization(organizationId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [tenders, total] = await this.tenderRepository.findAndCount({
      where: { organization: { id: organizationId } },
      relations: ['createdBy', 'bids'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tenders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Tender> {
    const tender = await this.tenderRepository.findOne({
      where: { id },
      relations: ['organization', 'createdBy', 'bids', 'bids.vendor'],
    });

    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }

    return tender;
  }

  async update(
    id: string,
    updateTenderDto: UpdateTenderDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only update your own tenders');
    }

    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException('Only draft tenders can be updated');
    }

    Object.assign(tender, updateTenderDto);
    const updatedTender = await this.tenderRepository.save(tender);

    if (files && files.length > 0) {
      for (const file of files) {
        await this.filesService.uploadFile(file, 'tender', updatedTender.id);
      }
    }

    return updatedTender;
  }

  async publish(id: string, userId: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only publish your own tenders');
    }

    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException('Only draft tenders can be published');
    }

    tender.status = TenderStatus.PUBLISHED;
    tender.publishDate = new Date();
    const publishedTender = await this.tenderRepository.save(tender);

    // Send notifications to relevant vendors
    // await this.notificationsService.notifyVendorsAboutNewTender(publishedTender);

    return publishedTender;
  }

  async close(id: string, userId: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only close your own tenders');
    }

    if (tender.status !== TenderStatus.PUBLISHED) {
      throw new BadRequestException('Only published tenders can be closed');
    }

    // Move to evaluation status instead of closed
    tender.status = TenderStatus.EVALUATION;
    return this.tenderRepository.save(tender);
  }

  async cancel(id: string, userId: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only cancel your own tenders');
    }

    if (tender.status === TenderStatus.AWARDED || tender.status === TenderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel awarded or completed tenders');
    }

    tender.status = TenderStatus.CANCELLED;
    tender.cancellationDate = new Date();
    return this.tenderRepository.save(tender);
  }

  async extend(id: string, newDeadline: Date, userId: string): Promise<Tender> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only extend your own tenders');
    }

    if (tender.status !== TenderStatus.PUBLISHED) {
      throw new BadRequestException('Only published tenders can be extended');
    }

    if (new Date(newDeadline) <= tender.bidEndDate) {
      throw new BadRequestException('New deadline must be after current deadline');
    }

    tender.bidEndDate = new Date(newDeadline);
    return this.tenderRepository.save(tender);
  }

  async remove(id: string, userId: string): Promise<void> {
    const tender = await this.findOne(id);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only delete your own tenders');
    }

    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException('Only draft tenders can be deleted');
    }

    await this.tenderRepository.remove(tender);
  }

  async addToFavorites(tenderId: string, userId: string): Promise<void> {
    const tender = await this.findOne(tenderId);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteTenders'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyFavorite = user.favoriteTenders.some(t => t.id === tenderId);
    if (!isAlreadyFavorite) {
      user.favoriteTenders.push(tender);
      await this.userRepository.save(user);
    }
  }

  async removeFromFavorites(tenderId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteTenders'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favoriteTenders = user.favoriteTenders.filter(t => t.id !== tenderId);
    await this.userRepository.save(user);
  }

  async getAnalytics(tenderId: string, userId: string) {
    const tender = await this.findOne(tenderId);

    if (tender.createdBy.id !== userId) {
      throw new ForbiddenException('You can only view analytics for your own tenders');
    }

    const bidCount = await this.tenderRepository
      .createQueryBuilder('tender')
      .leftJoin('tender.bids', 'bid')
      .where('tender.id = :tenderId', { tenderId })
      .select('COUNT(bid.id)', 'count')
      .getRawOne();

    const bidAmounts = await this.tenderRepository
      .createQueryBuilder('tender')
      .leftJoin('tender.bids', 'bid')
      .where('tender.id = :tenderId', { tenderId })
      .select(['MIN(bid.amount) as minBid', 'MAX(bid.amount) as maxBid', 'AVG(bid.amount) as avgBid'])
      .getRawOne();

    return {
      tender: {
        id: tender.id,
        title: tender.title,
        status: tender.status,
        estimatedValue: tender.estimatedValue,
      },
      analytics: {
        totalBids: parseInt(bidCount.count) || 0,
        minBidAmount: bidAmounts.minBid || 0,
        maxBidAmount: bidAmounts.maxBid || 0,
        avgBidAmount: bidAmounts.avgBid || 0,
        daysRemaining: Math.max(0, Math.floor((tender.bidEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      },
    };
  }
}