import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Tender } from '../tenders/entities/tender.entity';
import { Bid } from '../bids/entities/bid.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { DateUtil } from '../../common/utils/date.util';

interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async getDashboardAnalytics(period?: string) {
    const dateRange = this.getDateRange(period || '30d');
    
    const [
      totalTenders,
      activeTenders,
      totalBids,
      submittedBids,
      totalOrganizations,
      verifiedOrganizations,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.tenderRepository.count(),
      this.tenderRepository.count({ where: { status: APP_CONSTANTS.TENDER_STATUS.ACTIVE } }),
      this.bidRepository.count(),
      this.bidRepository.count({ where: { status: APP_CONSTANTS.BID_STATUS.SUBMITTED } }),
      this.organizationRepository.count(),
      this.organizationRepository.count({ where: { isVerified: true } }),
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
    ]);

    const tenderValue = await this.tenderRepository
      .createQueryBuilder('tender')
      .select('SUM(tender.estimatedValue)', 'total')
      .where('tender.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      })
      .getRawOne();

    return {
      overview: {
        totalTenders,
        activeTenders,
        totalBids,
        submittedBids,
        totalOrganizations,
        verifiedOrganizations,
        totalUsers,
        activeUsers,
        totalValue: tenderValue?.total || 0,
      },
      period,
      generatedAt: new Date(),
    };
  }

  async getTenderAnalytics(filters: AnalyticsFilter) {
    const query = this.tenderRepository.createQueryBuilder('tender');

    if (filters.startDate && filters.endDate) {
      query.andWhere('tender.createdAt BETWEEN :start AND :end', {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      });
    }

    if (filters.status) {
      query.andWhere('tender.status = :status', { status: filters.status });
    }

    const tenders = await query.getMany();

    const statusDistribution = tenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryDistribution = tenders.reduce((acc, tender) => {
      acc[tender.category] = (acc[tender.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrend = await this.getMonthlyTrend('tender', filters);

    return {
      total: tenders.length,
      statusDistribution,
      categoryDistribution,
      monthlyTrend,
      averageValue: tenders.reduce((sum, t) => sum + t.estimatedValue, 0) / tenders.length || 0,
      filters,
    };
  }

  async getBidAnalytics(filters: AnalyticsFilter) {
    const query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.tender', 'tender')
      .leftJoinAndSelect('bid.bidder', 'bidder');

    if (filters.startDate && filters.endDate) {
      query.andWhere('bid.createdAt BETWEEN :start AND :end', {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      });
    }

    if (filters.status) {
      query.andWhere('bid.status = :status', { status: filters.status });
    }

    const bids = await query.getMany();

    const statusDistribution = bids.reduce((acc, bid) => {
      acc[bid.status] = (acc[bid.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tenderDistribution = bids.reduce((acc, bid) => {
      const tenderTitle = bid.tender?.title || 'Unknown';
      acc[tenderTitle] = (acc[tenderTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrend = await this.getMonthlyTrend('bid', filters);

    return {
      total: bids.length,
      statusDistribution,
      tenderDistribution: Object.entries(tenderDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      monthlyTrend,
      averageAmount: bids.reduce((sum, b) => sum + b.amount, 0) / bids.length || 0,
      filters,
    };
  }

  async getOrganizationAnalytics() {
    const organizations = await this.organizationRepository.find({
      relations: ['users', 'tenders', 'bids'],
    });

    const typeDistribution = organizations.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const verificationStatus = {
      verified: organizations.filter(org => org.isVerified).length,
      unverified: organizations.filter(org => !org.isVerified).length,
    };

    const topOrganizations = organizations
      .map(org => ({
        id: org.id,
        name: org.name,
        type: org.type,
        tenderCount: org.tenders?.length || 0,
        bidCount: org.bids?.length || 0,
        userCount: org.users?.length || 0,
      }))
      .sort((a, b) => b.tenderCount + b.bidCount - a.tenderCount - a.bidCount)
      .slice(0, 10);

    return {
      total: organizations.length,
      typeDistribution,
      verificationStatus,
      topOrganizations,
      averageUsersPerOrg: organizations.reduce((sum, org) => sum + (org.users?.length || 0), 0) / organizations.length || 0,
    };
  }

  async getTrends(metric: string, period: string) {
    const dateRange = this.getDateRange(period);
    const intervals = this.getIntervals(dateRange, period);

    let data: any[] = [];

    switch (metric) {
      case 'tenders':
        data = await this.getTenderTrends(intervals);
        break;
      case 'bids':
        data = await this.getBidTrends(intervals);
        break;
      case 'users':
        data = await this.getUserTrends(intervals);
        break;
      case 'revenue':
        data = await this.getRevenueTrends(intervals);
        break;
      default:
        throw new Error(`Unknown metric: ${metric}`);
    }

    return {
      metric,
      period,
      data,
      intervals: intervals.map(i => ({
        start: i.start.toISOString(),
        end: i.end.toISOString(),
      })),
    };
  }

  async getTenderReport(tenderId: number) {
    const tender = await this.tenderRepository.findOne({
      where: { id: tenderId },
      relations: ['bids', 'documents', 'organization'],
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    const bidAnalysis = {
      total: tender.bids.length,
      submitted: tender.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.SUBMITTED).length,
      shortlisted: tender.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.SHORTLISTED).length,
      rejected: tender.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.REJECTED).length,
      averageAmount: tender.bids.reduce((sum, b) => sum + b.amount, 0) / tender.bids.length || 0,
      lowestBid: Math.min(...tender.bids.map(b => b.amount)) || 0,
      highestBid: Math.max(...tender.bids.map(b => b.amount)) || 0,
    };

    const timeline = {
      created: tender.createdAt,
      published: tender.publishedDate,
      deadline: tender.deadline,
      daysActive: DateUtil.getDifferenceInDays(tender.createdAt, new Date()),
      daysRemaining: DateUtil.getDifferenceInDays(new Date(), tender.deadline),
    };

    return {
      tender: {
        id: tender.id,
        title: tender.title,
        referenceNumber: tender.referenceNumber,
        status: tender.status,
        category: tender.category,
        estimatedValue: tender.estimatedValue,
        organization: tender.organization?.name,
      },
      bidAnalysis,
      timeline,
      documents: tender.documents.length,
      generatedAt: new Date(),
    };
  }

  async getOrganizationReport(organizationId: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: ['users', 'tenders', 'bids'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const tenderAnalysis = {
      total: organization.tenders.length,
      active: organization.tenders.filter(t => t.status === APP_CONSTANTS.TENDER_STATUS.ACTIVE).length,
      closed: organization.tenders.filter(t => t.status === APP_CONSTANTS.TENDER_STATUS.CLOSED).length,
      totalValue: organization.tenders.reduce((sum, t) => sum + t.estimatedValue, 0),
    };

    const bidAnalysis = {
      total: organization.bids.length,
      submitted: organization.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.SUBMITTED).length,
      awarded: organization.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.AWARDED).length,
      successRate: organization.bids.length > 0 
        ? (organization.bids.filter(b => b.status === APP_CONSTANTS.BID_STATUS.AWARDED).length / organization.bids.length) * 100 
        : 0,
    };

    const userAnalysis = {
      total: organization.users.length,
      active: organization.users.filter(u => u.isActive).length,
      roles: organization.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        isVerified: organization.isVerified,
        registeredAt: organization.createdAt,
      },
      tenderAnalysis,
      bidAnalysis,
      userAnalysis,
      generatedAt: new Date(),
    };
  }

  async getPerformanceMetrics() {
    const now = new Date();
    const thirtyDaysAgo = DateUtil.subtractDays(now, 30);

    const metrics = {
      tenderProcessingTime: await this.calculateAverageProcessingTime('tender', thirtyDaysAgo, now),
      bidResponseTime: await this.calculateAverageProcessingTime('bid', thirtyDaysAgo, now),
      userEngagement: await this.calculateUserEngagement(thirtyDaysAgo, now),
      systemUptime: 99.9, // This would come from monitoring service
      apiResponseTime: 150, // This would come from monitoring service
    };

    return {
      metrics,
      period: '30d',
      generatedAt: new Date(),
    };
  }

  async getRevenueAnalytics(year?: number, month?: number) {
    const targetYear = year || new Date().getFullYear();
    const query = this.tenderRepository.createQueryBuilder('tender')
      .where('EXTRACT(YEAR FROM tender.createdAt) = :year', { year: targetYear });

    if (month) {
      query.andWhere('EXTRACT(MONTH FROM tender.createdAt) = :month', { month });
    }

    const tenders = await query.getMany();

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthTenders = tenders.filter(t => new Date(t.createdAt).getMonth() === i);
      return {
        month: i + 1,
        revenue: monthTenders.reduce((sum, t) => sum + t.estimatedValue, 0),
        count: monthTenders.length,
      };
    });

    const quarterlyRevenue = [
      { quarter: 1, revenue: monthlyRevenue.slice(0, 3).reduce((sum, m) => sum + m.revenue, 0) },
      { quarter: 2, revenue: monthlyRevenue.slice(3, 6).reduce((sum, m) => sum + m.revenue, 0) },
      { quarter: 3, revenue: monthlyRevenue.slice(6, 9).reduce((sum, m) => sum + m.revenue, 0) },
      { quarter: 4, revenue: monthlyRevenue.slice(9, 12).reduce((sum, m) => sum + m.revenue, 0) },
    ];

    return {
      year: targetYear,
      totalRevenue: tenders.reduce((sum, t) => sum + t.estimatedValue, 0),
      monthlyRevenue,
      quarterlyRevenue,
      averagePerTender: tenders.length > 0 
        ? tenders.reduce((sum, t) => sum + t.estimatedValue, 0) / tenders.length 
        : 0,
    };
  }

  async getActivityAnalytics(userId?: number, period: string = '7d') {
    const dateRange = this.getDateRange(period);
    
    // This would track user activities like logins, tender views, bid submissions, etc.
    // For now, returning mock data
    return {
      userId,
      period,
      activities: {
        logins: 15,
        tenderViews: 45,
        bidSubmissions: 3,
        documentDownloads: 12,
      },
      dateRange,
    };
  }

  // Helper methods
  private getDateRange(period: string) {
    const now = new Date();
    let start: Date;

    switch (period) {
      case '7d':
        start = DateUtil.subtractDays(now, 7);
        break;
      case '30d':
        start = DateUtil.subtractDays(now, 30);
        break;
      case '90d':
        start = DateUtil.subtractDays(now, 90);
        break;
      case '1y':
        start = DateUtil.subtractDays(now, 365);
        break;
      default:
        start = DateUtil.subtractDays(now, 30);
    }

    return { start, end: now };
  }

  private getIntervals(dateRange: { start: Date; end: Date }, period: string) {
    const intervals = [];
    const days = DateUtil.getDifferenceInDays(dateRange.start, dateRange.end);
    
    let intervalDays: number;
    if (days <= 7) intervalDays = 1;
    else if (days <= 30) intervalDays = 7;
    else if (days <= 90) intervalDays = 30;
    else intervalDays = 30;

    let current = new Date(dateRange.start);
    while (current < dateRange.end) {
      const next = DateUtil.addDays(current, intervalDays);
      intervals.push({
        start: new Date(current),
        end: next > dateRange.end ? new Date(dateRange.end) : next,
      });
      current = next;
    }

    return intervals;
  }

  private async getMonthlyTrend(entity: 'tender' | 'bid', filters: AnalyticsFilter) {
    // Implementation would query the database for monthly counts
    // Returning mock data for now
    return [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 15 },
      { month: 'Mar', count: 18 },
      { month: 'Apr', count: 22 },
      { month: 'May', count: 20 },
      { month: 'Jun', count: 25 },
    ];
  }

  private async getTenderTrends(intervals: Array<{ start: Date; end: Date }>) {
    return Promise.all(intervals.map(async interval => {
      const count = await this.tenderRepository.count({
        where: {
          createdAt: Between(interval.start, interval.end),
        },
      });
      return {
        date: interval.start.toISOString(),
        value: count,
      };
    }));
  }

  private async getBidTrends(intervals: Array<{ start: Date; end: Date }>) {
    return Promise.all(intervals.map(async interval => {
      const count = await this.bidRepository.count({
        where: {
          createdAt: Between(interval.start, interval.end),
        },
      });
      return {
        date: interval.start.toISOString(),
        value: count,
      };
    }));
  }

  private async getUserTrends(intervals: Array<{ start: Date; end: Date }>) {
    return Promise.all(intervals.map(async interval => {
      const count = await this.userRepository.count({
        where: {
          createdAt: Between(interval.start, interval.end),
        },
      });
      return {
        date: interval.start.toISOString(),
        value: count,
      };
    }));
  }

  private async getRevenueTrends(intervals: Array<{ start: Date; end: Date }>) {
    return Promise.all(intervals.map(async interval => {
      const result = await this.tenderRepository
        .createQueryBuilder('tender')
        .select('SUM(tender.estimatedValue)', 'total')
        .where('tender.createdAt BETWEEN :start AND :end', {
          start: interval.start,
          end: interval.end,
        })
        .getRawOne();
      return {
        date: interval.start.toISOString(),
        value: result?.total || 0,
      };
    }));
  }

  private async calculateAverageProcessingTime(entity: string, start: Date, end: Date) {
    // This would calculate actual processing times
    // Returning mock data for now
    return entity === 'tender' ? 2.5 : 1.8; // days
  }

  private async calculateUserEngagement(start: Date, end: Date) {
    // This would calculate actual user engagement metrics
    // Returning mock data for now
    return {
      dailyActiveUsers: 145,
      weeklyActiveUsers: 389,
      monthlyActiveUsers: 567,
      engagementRate: 72.5,
    };
  }
}
