import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}

export interface UpdateNotificationDto {
  status?: NotificationStatus;
  readAt?: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: createDto.userId,
      title: createDto.title,
      message: createDto.message,
      type: createDto.type as NotificationType,
      data: createDto.data || {},
      priority: createDto.priority || 'medium',
      status: NotificationStatus.UNREAD,
      expiresAt: createDto.expiresAt,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Emit notification created event
    this.eventEmitter.emit('notification.created', {
      notificationId: savedNotification.id,
      userId: savedNotification.userId,
      type: savedNotification.type,
    });

    return savedNotification;
  }

  async findAll(userId: string, filters?: {
    status?: NotificationStatus;
    type?: NotificationType;
    page?: number;
    limit?: number;
  }): Promise<{ data: Notification[]; total: number }> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (filters?.status) {
      query.andWhere('notification.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }

    query.orderBy('notification.createdAt', 'DESC');

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, userId: string, updateDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);

    Object.assign(notification, updateDto);

    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return this.update(id, userId, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }

  async removeAll(userId: string, filters?: {
    status?: NotificationStatus;
    type?: NotificationType;
  }): Promise<void> {
    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    await this.notificationRepository.delete(query);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });
  }

  async createBulk(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const entities = notifications.map(dto => 
      this.notificationRepository.create({
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type as NotificationType,
        data: dto.data || {},
        priority: dto.priority || 'medium',
        status: NotificationStatus.UNREAD,
        expiresAt: dto.expiresAt,
      })
    );

    return await this.notificationRepository.save(entities);
  }

  async cleanupExpired(): Promise<void> {
    await this.notificationRepository.delete({
      expiresAt: new Date(),
    });
  }
}