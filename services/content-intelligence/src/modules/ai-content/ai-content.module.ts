import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { AIGeneratedContent } from '../../entities/ai-content/generated-content.entity';
import { ContentTemplate } from '../../entities/ai-content/content-template.entity';

// Services
import { AIContentService } from '../../services/ai-content/ai-content.service';
import { OpenAIProviderService } from '../../services/ai-content/openai-provider.service';
import { AnthropicProviderService } from '../../services/ai-content/anthropic-provider.service';

// Controllers
import { AIContentController } from '../../controllers/ai-content.controller';

// Import MarketDataModule for market data integration
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIGeneratedContent, ContentTemplate]),
    HttpModule,
    ConfigModule,
    MarketDataModule,
  ],
  controllers: [AIContentController],
  providers: [
    AIContentService,
    OpenAIProviderService,
    AnthropicProviderService,
  ],
  exports: [
    AIContentService,
    OpenAIProviderService,
    AnthropicProviderService,
  ],
})
export class AIContentModule {}