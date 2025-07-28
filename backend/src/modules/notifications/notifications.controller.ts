import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getUserNotifications(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getUserNotifications(user.id, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Get(':id')
  getNotification(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationService.getNotification(id, user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationService.deleteNotification(id, user.id);
  }

  @Delete()
  deleteAllNotifications(
    @CurrentUser() user: any,
    @Query('readOnly') readOnly?: string,
  ) {
    return this.notificationService.deleteAllNotifications(
      user.id,
      readOnly === 'true',
    );
  }

  @Post('preferences')
  updatePreferences(
    @CurrentUser() user: any,
    @Body() preferences: any,
  ) {
    return this.notificationService.updateUserPreferences(user.id, preferences);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: any) {
    return this.notificationService.getUserPreferences(user.id);
  }

  @Post('test')
  sendTestNotification(
    @CurrentUser() user: any,
    @Body('type') type: 'email' | 'sms' | 'push' = 'email',
  ) {
    return this.notificationService.sendTestNotification(user.id, type);
  }
}