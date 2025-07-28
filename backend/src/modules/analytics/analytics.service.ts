import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { Tender, TenderStatus, TenderCategory } from '../tenders/entities/tender.entity';
import { Bid, BidStatus } from '../bids/entities/bid.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../auth/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async getDashboardStats(organizationId: string) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [
      totalTenders,
      activeTenders,
      totalBids,
      totalVendors,
      recentTenders,
      recentPayments,
    ] = await Promise.all([
      this.tenderRepository.count({ where: { organizationId } }),
      this.tenderRepository.count({
        where: {
          organizationId,
          status: TenderStatus.PUBLISHED,
        },
      }),
      this.bidRepository.count({
        where: {
          tender: { organizationId },
        },
      }),
      this.vendorRepository.count(),
      this.tenderRepository.count({
        where: {
          organizationId,
          createdAt: Between(thirtyDaysAgo, today),
        },
      }),
      this.paymentRepository.sum('amount', {
        organizationId,
        createdAt: Between(thirtyDaysAgo, today),
        status: PaymentStatus.COMPLETED,
      }),
    ]);

    return {
      totalTenders,
      activeTenders,
      totalBids,
      totalVendors,
      recentTenders,
      recentPaymentsAmount: recentPayments || 0,
      lastUpdated: new Date(),
    };
  }

  async getTenderStatistics(filters: {
    startDate?: Date;
    endDate?: Date;
    organizationId?: string;
  }) {
    const query = this.tenderRepository.createQueryBuilder('tender');

    if (filters.organizationId) {
      query.andWhere('tender.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('tender.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const tenders = await query.getMany();

    const statusCounts = tenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {} as Record<TenderStatus, number>);

    const categoryCounts = tenders.reduce((acc, tender) => {
      acc[tender.category] = (acc[tender.category] || 0) + 1;
      return acc;
    }, {} as Record<TenderCategory, number>);

    const totalValue = tenders.reduce(
      (sum, tender) => sum + Number(tender.estimatedValue),
      0,
    );

    const averageBidsPerTender =
      tenders.length > 0
        ? tenders.reduce((sum, tender) => sum + tender.bidCount, 0) /
          tenders.length
        : 0;

    return {
      totalTenders: tenders.length,
      statusBreakdown: statusCounts,
      categoryBreakdown: categoryCounts,
      totalEstimatedValue: totalValue,
      averageEstimatedValue: tenders.length > 0 ? totalValue / tenders.length : 0,
      averageBidsPerTender,
    };
  }

  async getBidStatistics(filters: {
    tenderId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.tender', 'tender');

    if (filters.tenderId) {
      query.andWhere('bid.tenderId = :tenderId', {
        tenderId: filters.tenderId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('bid.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const bids = await query.getMany();

    const statusCounts = bids.reduce((acc, bid) => {
      acc[bid.status] = (acc[bid.status] || 0) + 1;
      return acc;
    }, {} as Record<BidStatus, number>);

    const totalQuotedAmount = bids.reduce(
      (sum, bid) => sum + Number(bid.quotedAmount),
      0,
    );

    const submittedBids = bids.filter(
      (bid) => bid.status === BidStatus.SUBMITTED,
    );

    return {
      totalBids: bids.length,
      statusBreakdown: statusCounts,
      totalQuotedAmount,
      averageQuotedAmount: bids.length > 0 ? totalQuotedAmount / bids.length : 0,
      lowestBid: Math.min(...bids.map((bid) => Number(bid.quotedAmount))),
      highestBid: Math.max(...bids.map((bid) => Number(bid.quotedAmount))),
      submissionRate:
        bids.length > 0 ? (submittedBids.length / bids.length) * 100 : 0,
    };
  }

  async getVendorPerformance(filters: {
    vendorId?: string;
    period?: number;
  }) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (filters.period || 90));

    const query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.vendor', 'vendor')
      .where('bid.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (filters.vendorId) {
      query.andWhere('bid.vendorId = :vendorId', {
        vendorId: filters.vendorId,
      });
    }

    const bids = await query.getMany();

    const vendorStats = bids.reduce((acc, bid) => {
      const vendorId = bid.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendorId,
          vendorName: bid.vendor.name,
          totalBids: 0,
          wonBids: 0,
          totalValue: 0,
          averageResponseTime: 0,
          successRate: 0,
        };
      }

      acc[vendorId].totalBids++;
      if (bid.status === BidStatus.ACCEPTED) {
        acc[vendorId].wonBids++;
      }
      acc[vendorId].totalValue += Number(bid.quotedAmount);

      return acc;
    }, {} as Record<string, any>);

    Object.values(vendorStats).forEach((stat) => {
      stat.successRate = stat.totalBids > 0
        ? (stat.wonBids / stat.totalBids) * 100
        : 0;
      stat.averageQuotedAmount = stat.totalBids > 0
        ? stat.totalValue / stat.totalBids
        : 0;
    });

    return {
      period: filters.period || 90,
      vendors: Object.values(vendorStats),
    };
  }

  async getPaymentAnalytics(filters: {
    period?: number;
    status?: string;
  }) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (filters.period || 30));

    const query = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (filters.status) {
      query.andWhere('payment.status = :status', {
        status: filters.status,
      });
    }

    const payments = await query.getMany();

    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<PaymentStatus, number>);

    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const completedPayments = payments.filter(
      (payment) => payment.status === PaymentStatus.COMPLETED,
    );

    return {
      totalPayments: payments.length,
      totalAmount,
      statusBreakdown: statusCounts,
      averagePaymentAmount: payments.length > 0 ? totalAmount / payments.length : 0,
      completionRate:
        payments.length > 0
          ? (completedPayments.length / payments.length) * 100
          : 0,
      period: filters.period || 30,
    };
  }

  async getCategoryWiseTenders(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const tenders = await this.tenderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const categoryStats = Object.values(TenderCategory).reduce((acc, category) => {
      const categoryTenders = tenders.filter((t) => t.category === category);
      acc[category] = {
        count: categoryTenders.length,
        totalValue: categoryTenders.reduce(
          (sum, t) => sum + Number(t.estimatedValue),
          0,
        ),
        averageValue: 0,
      };
      acc[category].averageValue =
        categoryTenders.length > 0
          ? acc[category].totalValue / categoryTenders.length
          : 0;
      return acc;
    }, {} as Record<string, any>);

    return {
      year,
      categories: categoryStats,
      total: {
        count: tenders.length,
        value: tenders.reduce((sum, t) => sum + Number(t.estimatedValue), 0),
      },
    };
  }

  async getMonthlyTrends(year: number, metric: 'tenders' | 'bids' | 'value') {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
      value: 0,
    }));

    if (metric === 'tenders' || metric === 'value') {
      const tenders = await this.tenderRepository.find({
        where: {
          createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
        },
      });

      tenders.forEach((tender) => {
        const month = tender.createdAt.getMonth();
        months[month].count++;
        months[month].value += Number(tender.estimatedValue);
      });
    } else if (metric === 'bids') {
      const bids = await this.bidRepository.find({
        where: {
          createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
        },
      });

      bids.forEach((bid) => {
        const month = bid.createdAt.getMonth();
        months[month].count++;
        months[month].value += Number(bid.quotedAmount);
      });
    }

    return {
      year,
      metric,
      data: months.map((month, index) => ({
        month: index + 1,
        monthName: new Date(year, index, 1).toLocaleString('default', {
          month: 'long',
        }),
        count: month.count,
        value: month.value,
      })),
    };
  }

  async getSavingsReport(filters: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.tenderRepository.createQueryBuilder('tender')
      .where('tender.status = :status', { status: TenderStatus.AWARDED })
      .andWhere('tender.awardedAmount IS NOT NULL');

    if (filters.startDate && filters.endDate) {
      query.andWhere('tender.awardedDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const awardedTenders = await query.getMany();

    const totalEstimated = awardedTenders.reduce(
      (sum, tender) => sum + Number(tender.estimatedValue),
      0,
    );

    const totalAwarded = awardedTenders.reduce(
      (sum, tender) => sum + Number(tender.awardedAmount),
      0,
    );

    const savings = totalEstimated - totalAwarded;
    const savingsPercentage =
      totalEstimated > 0 ? (savings / totalEstimated) * 100 : 0;

    return {
      totalTenders: awardedTenders.length,
      totalEstimatedValue: totalEstimated,
      totalAwardedValue: totalAwarded,
      totalSavings: savings,
      savingsPercentage,
      averageSavingsPerTender:
        awardedTenders.length > 0 ? savings / awardedTenders.length : 0,
    };
  }

  async getVendorAnalytics(vendorId: string) {
    const [totalBids, wonBids, activeBids, totalEarnings] = await Promise.all([
      this.bidRepository.count({ where: { vendorId } }),
      this.bidRepository.count({
        where: { vendorId, status: BidStatus.ACCEPTED },
      }),
      this.bidRepository.count({
        where: {
          vendorId,
          status: BidStatus.SUBMITTED,
        },
      }),
      this.bidRepository.sum('quotedAmount', {
        vendorId,
        status: BidStatus.ACCEPTED,
      }),
    ]);

    const successRate = totalBids > 0 ? (wonBids / totalBids) * 100 : 0;

    return {
      totalBids,
      wonBids,
      activeBids,
      totalEarnings: totalEarnings || 0,
      successRate,
    };
  }

  async getTenderParticipation(vendorId: string, period: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    const bids = await this.bidRepository.find({
      where: {
        vendorId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['tender'],
    });

    const participationByCategory = bids.reduce((acc, bid) => {
      const category = bid.tender.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          submitted: 0,
          won: 0,
        };
      }
      acc[category].count++;
      if (bid.status === BidStatus.SUBMITTED) {
        acc[category].submitted++;
      }
      if (bid.status === BidStatus.ACCEPTED) {
        acc[category].won++;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      period,
      totalParticipation: bids.length,
      byCategory: Object.values(participationByCategory),
    };
  }

  async getVendorSuccessRate(vendorId: string) {
    const bids = await this.bidRepository.find({
      where: { vendorId },
      relations: ['tender'],
    });

    const totalBids = bids.length;
    const submittedBids = bids.filter(
      (bid) => bid.status !== BidStatus.DRAFT,
    ).length;
    const wonBids = bids.filter(
      (bid) => bid.status === BidStatus.ACCEPTED,
    ).length;
    const lostBids = bids.filter(
      (bid) => bid.status === BidStatus.REJECTED,
    ).length;

    return {
      totalBids,
      submittedBids,
      wonBids,
      lostBids,
      draftBids: totalBids - submittedBids,
      submissionRate: totalBids > 0 ? (submittedBids / totalBids) * 100 : 0,
      winRate: submittedBids > 0 ? (wonBids / submittedBids) * 100 : 0,
    };
  }

  async exportAnalytics(options: {
    type: 'tender' | 'bid' | 'vendor' | 'payment';
    format: 'csv' | 'excel' | 'pdf';
    startDate?: Date;
    endDate?: Date;
  }) {
    // Implementation would depend on the specific export libraries used
    // This is a placeholder for the export functionality
    return {
      message: 'Export functionality to be implemented',
      options,
    };
  }
}