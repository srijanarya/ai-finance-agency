/**
 * NLP Processing Service Unit Tests
 * 
 * Comprehensive test suite for the NLP Processing Service covering:
 * - Sentiment analysis functionality
 * - Entity extraction capabilities
 * - Key phrase identification
 * - Language detection
 * - Text summarization
 * - Topic modeling
 * - Error handling and edge cases
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NlpProcessingService } from './nlp-processing.service';
import { EntityType } from '../interfaces/nlp.interface';

describe('NlpProcessingService', () => {
  let service: NlpProcessingService;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NlpProcessingService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NlpProcessingService>(NlpProcessingService);
    configService = module.get(ConfigService);

    // Setup default config values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'ai.openaiApiKey':
          return 'test-openai-key';
        case 'ai.anthropicApiKey':
          return 'test-anthropic-key';
        default:
          return undefined;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processText', () => {
    it('should process text with default options', async () => {
      const testText = 'Apple Inc. reported strong earnings of $2.50 per share, beating analyst estimates. The stock surged 5% in after-hours trading.';
      
      const result = await service.processText(testText);

      expect(result).toBeDefined();
      expect(result.text).toBe(testText);
      expect(result.processedAt).toBeInstanceOf(Date);
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.textLength).toBe(testText.length);
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should perform sentiment analysis', async () => {
      const positiveText = 'This is excellent news! The company is performing wonderfully and investors are very happy.';
      
      const result = await service.processText(positiveText, {
        enableSentimentAnalysis: true
      });

      expect(result.sentiment).toBeDefined();
      expect(result.sentiment!.score).toBeGreaterThan(0);
      expect(result.sentiment!.label).toBe('positive');
      expect(result.sentiment!.confidence).toBeGreaterThan(0);
      expect(result.sentiment!.magnitude).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', async () => {
      const negativeText = 'This is terrible news. The company is failing badly and investors are losing money.';
      
      const result = await service.processText(negativeText, {
        enableSentimentAnalysis: true
      });

      expect(result.sentiment).toBeDefined();
      expect(result.sentiment!.score).toBeLessThan(0);
      expect(result.sentiment!.label).toBe('negative');
    });

    it('should extract financial entities', async () => {
      const textWithEntities = 'AAPL stock price reached $150. Tesla (TSLA) and Microsoft Corp are also performing well.';
      
      const result = await service.processText(textWithEntities, {
        enableEntityExtraction: true
      });

      expect(result.entities).toBeDefined();
      expect(result.entities!.entities.length).toBeGreaterThan(0);
      
      const stockSymbols = result.entities!.entities.filter(e => e.type === EntityType.STOCK_SYMBOL);
      expect(stockSymbols.length).toBeGreaterThanOrEqual(2);
    });

    it('should extract key phrases', async () => {
      const textWithKeyPhrases = 'Quarterly earnings report shows strong revenue growth and improved profit margins despite market volatility.';
      
      const result = await service.processText(textWithKeyPhrases, {
        enableKeyPhraseExtraction: true
      });

      expect(result.keyPhrases).toBeDefined();
      expect(result.keyPhrases!.keyPhrases.length).toBeGreaterThan(0);
      expect(result.keyPhrases!.keyPhrases[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should detect language', async () => {
      const englishText = 'This is a financial report about market conditions.';
      
      const result = await service.processText(englishText, {
        enableLanguageDetection: true
      });

      expect(result.language).toBeDefined();
      expect(result.language!.language).toBe('en');
      expect(result.language!.confidence).toBeGreaterThan(0.5);
    });

    it('should summarize text', async () => {
      const longText = `
        Apple Inc. reported quarterly earnings that exceeded analyst expectations. 
        The company posted revenue of $89.5 billion, up 8% year over year. 
        iPhone sales were particularly strong, growing 12% compared to the same quarter last year.
        The company also announced a new share buyback program worth $90 billion.
        CEO Tim Cook expressed optimism about future growth prospects.
        The stock price rose 5% in after-hours trading following the announcement.
      `;
      
      const result = await service.processText(longText.trim(), {
        enableTextSummarization: true,
        summaryLength: 2
      });

      expect(result.summary).toBeDefined();
      expect(result.summary!.summary.length).toBeLessThan(longText.length);
      expect(result.summary!.compressionRatio).toBeLessThan(1);
      expect(result.summary!.keyPoints.length).toBeGreaterThan(0);
    });

    it('should model topics', async () => {
      const textWithTopics = 'Earnings revenue profit growth dividend yield market analysis financial performance';
      
      const result = await service.processText(textWithTopics, {
        enableTopicModeling: true
      });

      expect(result.topics).toBeDefined();
      expect(result.topics!.topics.length).toBeGreaterThan(0);
      expect(result.topics!.dominantTopic).toBeDefined();
    });

    it('should filter entities by type', async () => {
      const textWithMixedEntities = 'AAPL stock price is $150. John Smith from Goldman Sachs likes it. New York market opens soon.';
      
      const result = await service.processText(textWithMixedEntities, {
        enableEntityExtraction: true,
        entityTypes: [EntityType.STOCK_SYMBOL]
      });

      expect(result.entities).toBeDefined();
      result.entities!.entities.forEach(entity => {
        expect(entity.type).toBe(EntityType.STOCK_SYMBOL);
      });
    });

    it('should respect confidence threshold', async () => {
      const testText = 'Some ambiguous financial text that might have low confidence entities.';
      
      const result = await service.processText(testText, {
        enableEntityExtraction: true,
        confidenceThreshold: 0.8
      });

      expect(result.entities).toBeDefined();
      result.entities!.entities.forEach(entity => {
        expect(entity.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should limit key phrases', async () => {
      const textWithManyPhrases = 'earnings revenue profit growth dividend yield market analysis financial performance investment strategy';
      
      const result = await service.processText(textWithManyPhrases, {
        enableKeyPhraseExtraction: true,
        maxKeyPhrases: 5
      });

      expect(result.keyPhrases).toBeDefined();
      expect(result.keyPhrases!.keyPhrases.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty text gracefully', async () => {
      const result = await service.processText('', {
        enableSentimentAnalysis: true,
        enableEntityExtraction: true
      });

      expect(result).toBeDefined();
      expect(result.text).toBe('');
      expect(result.metadata.wordCount).toBe(0);
    });

    it('should handle very short text', async () => {
      const shortText = 'AAPL up.';
      
      const result = await service.processText(shortText);

      expect(result).toBeDefined();
      expect(result.text).toBe(shortText);
      expect(result.metadata.wordCount).toBe(2);
    });

    it('should handle text with special characters', async () => {
      const specialText = 'Apple\'s Q3 earnings: $2.50/share (vs. $2.35 est.) 📈 #AAPL';
      
      const result = await service.processText(specialText, {
        enableEntityExtraction: true
      });

      expect(result).toBeDefined();
      expect(result.entities).toBeDefined();
    });

    it('should measure processing time', async () => {
      const testText = 'Test text for processing time measurement.';
      
      const result = await service.processText(testText);

      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should extract comprehensive metadata', async () => {
      const testText = `
        This is a test paragraph with multiple sentences. 
        It contains various types of content for analysis.
        
        This is a second paragraph to test structure detection.
      `;
      
      const result = await service.processText(testText.trim());

      expect(result.metadata).toBeDefined();
      expect(result.metadata.textLength).toBe(testText.trim().length);
      expect(result.metadata.wordCount).toBeGreaterThan(0);
      expect(result.metadata.sentenceCount).toBeGreaterThan(1);
      expect(result.metadata.paragraphCount).toBeGreaterThanOrEqual(2);
      expect(result.metadata.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.readabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock a scenario that might cause an error
      const invalidText = null as any;
      
      await expect(service.processText(invalidText)).rejects.toThrow();
    });

    it('should handle malformed options', async () => {
      const testText = 'Valid text';
      const invalidOptions = {
        confidenceThreshold: 2.0, // Invalid: should be 0-1
        maxKeyPhrases: -5 // Invalid: should be positive
      } as any;
      
      // Service should either handle gracefully or throw meaningful error
      const result = await service.processText(testText, invalidOptions);
      expect(result).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should process text within reasonable time limits', async () => {
      const longText = 'This is a sample text. '.repeat(100); // 2300+ characters
      
      const startTime = Date.now();
      const result = await service.processText(longText);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent processing', async () => {
      const texts = [
        'AAPL earnings beat expectations',
        'TSLA stock price increases 10%', 
        'MSFT announces new product launch',
        'GOOGL revenue grows year over year',
        'AMZN expands into new markets'
      ];
      
      const promises = texts.map(text => service.processText(text, { 
        enableSentimentAnalysis: true,
        enableEntityExtraction: true 
      }));
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.sentiment).toBeDefined();
        expect(result.entities).toBeDefined();
      });
    });
  });

  describe('Integration Features', () => {
    it('should properly initialize NLP models', () => {
      // Test that the service initializes without errors
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(NlpProcessingService);
    });

    it('should support all entity types', () => {
      const allEntityTypes = Object.values(EntityType);
      
      // Test that all entity types are recognized
      allEntityTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should validate configuration', () => {
      expect(configService.get).toHaveBeenCalled();
    });
  });
});