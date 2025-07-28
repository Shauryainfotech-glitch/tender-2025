// modules/notifications/notifications.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType, NotificationChannel } from './entities/notification.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from './email.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const recipient = await this.userRepository.findOne({
      where: { id: createNotificationDto.recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      recipient,
      recipientEmail: recipient.email,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send email if required
    if (
      notification.channel === NotificationChannel.EMAIL ||
      notification.channel === NotificationChannel.BOTH
    ) {
      await this.sendEmailNotification(savedNotification);
    }

    return savedNotification;
  }

  async createBulk(
    recipientIds: string[],
    notificationData: Omit<CreateNotificationDto, 'recipientId'>,
  ): Promise<Notification[]> {
    const recipients = await this.userRepository.findBy({
      id: In(recipientIds),
    });

    const notifications = recipients.map((recipient) =>
      this.notificationRepository.create({
        ...notificationData,
        recipient,
        recipientEmail: recipient.email,
      }),
    );

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Send emails in parallel
    const emailPromises = savedNotifications
      .filter(
        (n) =>
          n.channel === NotificationChannel.EMAIL ||
          n.channel === NotificationChannel.BOTH,
      )
      .map((n) => this.sendEmailNotification(n));

    await Promise.allSettled(emailPromises);

    return savedNotifications;
  }

  async findAll(filters: {
    recipientId?: string;
    type?: NotificationType;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
  }> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipient', 'recipient');

    if (filters.recipientId) {
      query.andWhere('notification.recipient.id = :recipientId', {
        recipientId: filters.recipientId,
      });
    }

    if (filters.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }

    if (filters.isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
    }

    query.orderBy('notification.createdAt', 'DESC');

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: {
        recipient: { id: filters.recipientId },
        isRead: false,
      },
    });

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      unreadCount,
    };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['recipient'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.recipient.id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      {
        recipient: { id: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id);

    if (notification.recipient.id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('isRead = :isRead', { isRead: true })
      .execute();

    return result.affected || 0;
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      await this.emailService.sendNotificationEmail(
        notification.recipientEmail,
        notification.title,
        notification.message,
        notification.type,
        notification.metadata,
      );

      notification.emailSent = true;
      notification.emailSentAt = new Date();
    } catch (error) {
      notification.emailSent = false;
      notification.emailError = error.message;
    }

    await this.notificationRepository.save(notification);
  }

  // Notification templates for different types
  async sendTenderNotification(
    type: NotificationType,
    recipientIds: string[],
    tenderData: any,
  ): Promise<void> {
    const templates = {
      [NotificationType.TENDER_CREATED]: {
        title: 'New Tender Created',
        message: `A new tender "${tenderData.title}" has been created.`,
      },
      [NotificationType.TENDER_PUBLISHED]: {
        title: 'Tender Published',
        message: `The tender "${tenderData.title}" is now open for bidding.`,
      },
      [NotificationType.TENDER_CLOSED]: {
        title: 'Tender Closed',
        message: `The tender "${tenderData.title}" has been closed for bidding.`,
      },
      [NotificationType.TENDER_AWARDED]: {
        title: 'Tender Awarded',
        message: `The tender "${tenderData.title}" has been awarded.`,
      },
    };

    const template = templates[type];
    if (!template) return;

    await this.createBulk(recipientIds, {
      type,
      title: template.title,
      message: template.message,
      channel: NotificationChannel.BOTH,
      entityType: 'tender',
      entityId: tenderData.id,
      actionUrl: `/tenders/${tenderData.id}`,
      metadata: { tenderId: tenderData.id, tenderTitle: tenderData.title },
    });
  }

  async sendBidNotification(
    type: NotificationType,
    recipientId: string,
    bidData: any,
  ): Promise<void> {
    const templates = {
      [NotificationType.BID_SUBMITTED]: {
        title: 'Bid Submitted Successfully',
        message: `Your bid for tender "${bidData.tenderTitle}" has been submitted.`,
      },
      [NotificationType.BID_EVALUATED]: {
        title: 'Bid Evaluated',
        message: `Your bid for tender "${bidData.tenderTitle}" has been evaluated.`,
      },
      [NotificationType.BID_SELECTED]: {
        title: 'Congratulations! Bid Selected',
        message: `Your bid for tender "${bidData.tenderTitle}" has been selected as the winner!`,
      },
      [NotificationType.BID_REJECTED]: {
        title: 'Bid Not Selected',
        message: `Your bid for tender "${bidData.tenderTitle}" was not selected. Thank you for participating.`,
      },
    };

    const template = templates[type];
    if (!template) return;

    await this.create({
      recipientId,
      type,
      title: template.title,
      message: template.message,
      channel: NotificationChannel.BOTH,
      entityType: 'bid',
      entityId: bidData.id,
      actionUrl: `/bids/${bidData.id}`,
      metadata: {
        bidId: bidData.id,
        tenderId: bidData.tenderId,
        tenderTitle: bidData.tenderTitle,
      },
    });
  }
}
