import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Configuration
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import corsConfig from './config/cors.config';
import throttleConfig from './config/throttle.config';
import multerConfig from './config/multer.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TendersModule } from './modules/tenders/tenders.module';
import { BidsModule } from './modules/bids/bids.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { FilesModule } from './modules/files/files.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EmdModule } from './modules/emd/emd.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SecurityModule } from './modules/security/security.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { AuditModule } from './modules/audit/audit.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { LlmProcessingModule } from './modules/llm-processing/llm-processing.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        jwtConfig,
        corsConfig,
        throttleConfig,
        multerConfig,
      ],
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        console.log('Connecting to Neon PostgreSQL at:', dbConfig.host);
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('throttle'),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    UsersModule,
    TendersModule,
    BidsModule,
    OrganizationsModule,
    FilesModule,
    NotificationsModule,
    AnalyticsModule,
    EmdModule,
    ContractsModule,
    VendorsModule,
    PaymentsModule,
    SecurityModule,
    WorkflowModule,
    AuditModule,
    WebsocketModule,
    CustomFieldsModule,
    LlmProcessingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
