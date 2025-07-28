import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { User } from '../auth/entities/user.entity';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: string;
  userId: string;
  metadata?: any;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...data,
      type: data.type as NotificationType,
      status: NotificationStatus.UNREAD,
    });
    
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    options: {
      page: number;
      limit: number;
      unreadOnly?: boolean;
    },
  ) {
    const { page, limit, unreadOnly } = options;
    const skip = (page - 1) * limit;

    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      query.andWhere('notification.status = :status', { status: NotificationStatus.UNREAD });
    }

    const [notifications, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });

    return { count };
  }

  async getNotification(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.getNotification(id, userId);
    
    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      {
        userId,
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    return { affected: result.affected || 0 };
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.getNotification(id, userId);
    await this.notificationRepository.remove(notification);
  }

  async deleteAllNotifications(
    userId: string,
    readOnly?: boolean,
  ): Promise<{ affected: number }> {
    const criteria: any = { userId };
    
    if (readOnly) {
      criteria.status = NotificationStatus.READ;
    }

    const result = await this.notificationRepository.delete(criteria);
    return { affected: result.affected || 0 };
  }

  async updateUserPreferences(
    userId: string,
    preferences: {
      notificationsEnabled?: boolean;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
    },
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, preferences);
    return this.userRepository.save(user);
  }

  async getUserPreferences(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['notificationsEnabled', 'emailNotifications', 'smsNotifications'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      notificationsEnabled: user.notificationsEnabled,
      emailNotifications: user.emailNotifications,
      smsNotifications: user.smsNotifications,
    };
  }

  async sendTestNotification(
    userId: string,
    type: 'email' | 'sms' | 'push',
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a test notification
    await this.createNotification({
      userId,
      title: 'Test Notification',
      message: `This is a test ${type} notification from the Tender Management System.`,
      type: NotificationType.INFO,
      metadata: { test: true, notificationType: type },
    });

    return {
      success: true,
      message: `Test ${type} notification created successfully`,
    };
  }
}