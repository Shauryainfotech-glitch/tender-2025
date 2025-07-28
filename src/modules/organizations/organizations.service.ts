// modules/organizations/organizations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Tender } from '../../entities/tender.entity';
import { Bid } from '../../entities/bid.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SearchOrganizationDto } from './dto/search-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tender)
    private tenderRepository: Repository<Tender>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Check if organization with same registration number exists
    const existingOrg = await this.organizationRepository.findOne({
      where: { registrationNumber: createOrganizationDto.registrationNumber },
    });

    if (existingOrg) {
      throw new ConflictException('Organization with this registration number already exists');
    }

    // Check if email is already in use
    const emailExists = await this.organizationRepository.findOne({
      where: { email: createOrganizationDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Organization with this email already exists');
    }

    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      isVerified: false,
      isActive: true,
      rating: 0,
      totalTenders: 0,
      totalBids: 0,
    });

    return await this.organizationRepository.save(organization);
  }

  async findAll(searchDto: SearchOrganizationDto): Promise<{
    data: Organization[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.organizationRepository.createQueryBuilder('organization')
      .leftJoinAndSelect('organization.users', 'users')
      .leftJoinAndSelect('organization.tenders', 'tenders')
      .leftJoinAndSelect('organization.bids', 'bids');

    // Apply filters
    if (searchDto.search) {
      query.andWhere(
        '(organization.name ILIKE :search OR organization.description ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    if (searchDto.type) {
      query.andWhere('organization.type = :type', { type: searchDto.type });
    }

    if (searchDto.isVerified !== undefined) {
      query.andWhere('organization.isVerified = :isVerified', {
        isVerified: searchDto.isVerified,
      });
    }

    if (searchDto.isActive !== undefined) {
      query.andWhere('organization.isActive = :isActive', {
        isActive: searchDto.isActive,
      });
    }

    if (searchDto.country) {
      query.andWhere('organization.country = :country', { country: searchDto.country });
    }

    if (searchDto.city) {
      query.andWhere('organization.city = :city', { city: searchDto.city });
    }

    if (searchDto.minRating !== undefined) {
      query.andWhere('organization.rating >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    // Sorting
    const sortField = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    query.orderBy(`organization.${sortField}`, sortOrder);

    // Pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
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

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users', 'tenders', 'bids'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { registrationNumber },
      relations: ['users'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    // Check if email is being updated and is unique
    if (updateOrganizationDto.email && updateOrganizationDto.email !== organization.email) {
      const emailExists = await this.organizationRepository.findOne({
        where: { email: updateOrganizationDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another organization');
      }
    }

    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async verify(id: string, verifiedBy: string): Promise<Organization> {
    const organization = await this.findOne(id);

    if (organization.isVerified) {
      throw new BadRequestException('Organization is already verified');
    }

    organization.isVerified = true;
    organization.verifiedAt = new Date();
    organization.verifiedBy = verifiedBy;

    return await this.organizationRepository.save(organization);
  }

  async activate(id: string): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.isActive = true;
    return await this.organizationRepository.save(organization);
  }

  async deactivate(id: string): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.isActive = false;
    return await this.organizationRepository.save(organization);
  }

  async updateRating(id: string, rating: number): Promise<Organization> {
    const organization = await this.findOne(id);
    
    // Calculate new rating (assuming it's an average)
    const currentTotal = organization.rating * organization.ratingCount;
    organization.ratingCount += 1;
    organization.rating = (currentTotal + rating) / organization.ratingCount;

    return await this.organizationRepository.save(organization);
  }

  async getStatistics(id: string): Promise<any> {
    const organization = await this.findOne(id);

    const stats = {
      basic: {
        name: organization.name,
        type: organization.type,
        isVerified: organization.isVerified,
        isActive: organization.isActive,
        rating: organization.rating,
        memberSince: organization.createdAt,
      },
      users: {
        total: organization.users.length,
        active: organization.users.filter(u => u.isActive).length,
      },
      tenders: {
        total: organization.tenders.length,
        published: organization.tenders.filter(t => t.status === 'published').length,
        awarded: organization.tenders.filter(t => t.status === 'awarded').length,
        closed: organization.tenders.filter(t => t.status === 'closed').length,
      },
      bids: {
        total: organization.bids.length,
        submitted: organization.bids.filter(b => b.status === 'submitted').length,
        selected: organization.bids.filter(b => b.status === 'selected').length,
        rejected: organization.bids.filter(b => b.status === 'rejected').length,
      },
    };

    // Calculate success rate for suppliers
    if (organization.type === 'supplier' && stats.bids.total > 0) {
      stats.bids.successRate = (stats.bids.selected / stats.bids.total) * 100;
    }

    return stats;
  }

  async addUser(organizationId: string, userId: string): Promise<Organization> {
    const organization = await this.findOne(organizationId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organization) {
      throw new BadRequestException('User already belongs to an organization');
    }

    user.organization = organization;
    await this.userRepository.save(user);

    return await this.findOne(organizationId);
  }

  async removeUser(organizationId: string, userId: string): Promise<Organization> {
    const organization = await this.findOne(organizationId);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.organization || user.organization.id !== organizationId) {
      throw new BadRequestException('User does not belong to this organization');
    }

    user.organization = null;
    await this.userRepository.save(user);

    return await this.findOne(organizationId);
  }

  async getTopSuppliers(limit: number = 10): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { type: 'supplier', isActive: true, isVerified: true },
      order: { rating: 'DESC' },
      take: limit,
    });
  }

  async getTopBuyers(limit: number = 10): Promise<Organization[]> {
    const query = this.organizationRepository.createQueryBuilder('organization')
      .leftJoinAndSelect('organization.tenders', 'tenders')
      .where('organization.type = :type', { type: 'buyer' })
      .andWhere('organization.isActive = :isActive', { isActive: true })
      .andWhere('organization.isVerified = :isVerified', { isVerified: true })
      .orderBy('organization.totalTenders', 'DESC')
      .take(limit);

    return await query.getMany();
  }
}
