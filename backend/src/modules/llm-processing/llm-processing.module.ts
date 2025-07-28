import { Module } from '@nestjs/common';
import { LlmProcessingController } from './llm-processing.controller';
import { LlmProcessingService } from './llm-processing.service';

@Module({
  controllers: [LlmProcessingController],
  providers: [LlmProcessingService],
  exports: [LlmProcessingService],
})
export class LlmProcessingModule {}