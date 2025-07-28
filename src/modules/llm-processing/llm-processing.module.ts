import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LLMProcessingService } from './llm-processing.service';
import { LLMProcessingController } from './llm-processing.controller';
import { DocumentProcessingJob } from './entities/document-processing-job.entity';
import { ProcessingTemplate } from './entities/processing-template.entity';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { ProcessingResult } from './entities/processing-result.entity';
import { FilesModule } from '../files/files.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentProcessingJob,
      ProcessingTemplate,
      KnowledgeBase,
      ProcessingResult,
    ]),
    HttpModule,
    ConfigModule,
    FilesModule,
    BullModule.registerQueue({
      name: 'document-processing',
    }),
  ],
  controllers: [LLMProcessingController],
  providers: [LLMProcessingService],
  exports: [LLMProcessingService],
})
export class LLMProcessingModule {}
