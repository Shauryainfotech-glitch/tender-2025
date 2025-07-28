import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';
import { Tender, TenderStatus } from '../tenders/entities/tender.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
  }) {
    const { page, limit, search, type, status } = filters;
    const skip = (page - 1) * limit;

    const query = this.organizationRepository.createQueryBuilder('organization');

    if (search) {
      query.andWhere(
        '(organization.name ILIKE :search OR organization.email ILIKE :search OR organization.registrationNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      query.andWhere('organization.type = :type', { type });
    }

    if (status) {
      query.andWhere('organization.status = :status', { status });
    }

    const [organizations, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
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

    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);

    // Check if there are any associated records
    const userCount = await this.userRepository.count({
      where: { organization: { id } },
    });

    if (userCount > 0) {
      throw new Error('Cannot delete organization with associated users');
    }

    await this.organizationRepository.remove(organization);
  }

  async updateStatus(id: string, status: string): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.status = status as any; // Cast to any to handle enum type
    return this.organizationRepository.save(organization);
  }

  async getOrganizationUsers(
    id: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: { organization: { id } },
      skip,
      take: limit,
      select: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
    });

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrganizationTenders(
    id: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [tenders, total] = await this.tenderRepository.findAndCount({
      where: { organization: { id } },
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

  async getOrganizationStatistics(id: string) {
    const organization = await this.findOne(id);

    const [userCount, tenderCount, activeTenderCount] = await Promise.all([
      this.userRepository.count({
        where: { organization: { id } },
      }),
      this.tenderRepository.count({
        where: { organization: { id } },
      }),
      this.tenderRepository.count({
        where: {
          organization: { id },
          status: TenderStatus.PUBLISHED,
        },
      }),
    ]);

    const totalTenderValue = await this.tenderRepository
      .createQueryBuilder('tender')
      .select('SUM(tender.estimatedValue)', 'total')
      .where('tender.organizationId = :id', { id })
      .getRawOne();

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
      },
      statistics: {
        totalUsers: userCount,
        totalTenders: tenderCount,
        activeTenders: activeTenderCount,
        totalTenderValue: totalTenderValue?.total || 0,
      },
    };
  }

  async updateSettings(
    id: string,
    settings: any,
    userId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    // Store settings in metadata field since Organization doesn't have a settings property
    organization.metadata = {
      ...organization.metadata,
      settings: {
        ...(organization.metadata?.settings || {}),
        ...settings,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date(),
      },
    };

    return this.organizationRepository.save(organization);
  }

  async getSettings(id: string): Promise<any> {
    const organization = await this.findOne(id);
    return organization.metadata?.settings || {};
  }
}