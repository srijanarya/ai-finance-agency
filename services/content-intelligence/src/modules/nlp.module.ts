/**
 * NLP Module
 * 
 * Comprehensive Natural Language Processing module that provides:
 * - Advanced NLP processing pipeline
 * - Market insight extraction capabilities
 * - Real-time trend detection and analysis
 * - Content quality scoring and recommendations
 * - Real-time content streaming via WebSockets
 * - High-performance caching layer
 * - Intelligent workflow orchestration
 * - Comprehensive performance monitoring
 * 
 * This module integrates all NLP-related services and provides a unified
 * interface for content intelligence operations within the application.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { NlpProcessingService } from '../services/nlp-processing.service';
import { MarketInsightService } from '../services/market-insight.service';
import { TrendDetectionService } from '../services/trend-detection.service';
import { ContentScoringService } from '../services/content-scoring.service';
import { ContentCacheService } from '../services/content-cache.service';
import { ContentIntelligenceOrchestratorService } from '../services/content-intelligence-orchestrator.service';
import { PerformanceMonitorService } from '../services/performance-monitor.service';

// Gateways
import { ContentStreamGateway } from '../gateways/content-stream.gateway';

// Controllers
import { NlpController } from '../controllers/nlp.controller';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    ScheduleModule,
  ],
  controllers: [
    NlpController,
  ],
  providers: [
    // Core NLP Services
    NlpProcessingService,
    MarketInsightService,
    TrendDetectionService,
    ContentScoringService,
    ContentCacheService,

    // Advanced Services
    ContentIntelligenceOrchestratorService,
    PerformanceMonitorService,

    // Real-time Streaming
    ContentStreamGateway,
  ],
  exports: [
    // Export services for use in other modules
    NlpProcessingService,
    MarketInsightService,
    TrendDetectionService,
    ContentScoringService,
    ContentCacheService,
    ContentIntelligenceOrchestratorService,
    PerformanceMonitorService,
    ContentStreamGateway,
  ],
})
export class NlpModule {}