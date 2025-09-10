import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FinancialEntityRecognitionResult,
  FinancialEntityRecognitionOptions,
  RecognizedFinancialEntity,
  EntityDisambiguation,
  TickerResolution,
  ExtractedFinancialMetric,
  CurrencyMention,
  CommodityMention,
  FinancialEntityType,
  FinancialInstrument,
  DisambiguationCandidate,
  ConfidenceMetrics,
  ServiceResponse,
  BatchProcessingResult
} from '../interfaces/market-insight-extraction.interface';
import { NLPProcessingService } from './nlp-processing.service';
import { MarketDataService } from './market-data.service';
import { ContentCacheService } from './content-cache.service';

interface EntityRecognitionConfig {
  nerModel: string;
  disambiguationModel: string;
  tickerResolverAPI: string;
  financialMetricsModel: string;
  confidenceThreshold: number;
  contextWindowSize: number;
  maxAlternatives: number;
}

interface ExternalDataSources {
  yahooFinanceAPI: string;
  alphaVantageAPI: string;
  polygonAPI: string;
  fmpAPI: string;
  sec_edgarAPI: string;
  exchangeAPIs: Record<string, string>;
}

interface TickerDatabase {
  symbols: Map<string, FinancialInstrument>;
  companyNames: Map<string, string[]>;
  aliases: Map<string, string>;
  exchanges: Map<string, string[]>;
}

@Injectable()
export class FinancialEntityRecognizerService {
  private readonly logger = new Logger(FinancialEntityRecognizerService.name);
  private readonly config: EntityRecognitionConfig;
  private readonly dataSources: ExternalDataSources;
  private readonly tickerDatabase: TickerDatabase;
  
  // Financial patterns and dictionaries
  private readonly stockPatterns = [
    /\b[A-Z]{1,5}\b(?:\.[A-Z]{1,3})?/g, // Basic ticker patterns
    /\$([A-Z]{1,5})\b/g, // Dollar-prefixed tickers
    /\(([A-Z]{1,5})\)/g, // Parenthesis-wrapped tickers
    /NYSE:\s*([A-Z]{1,5})/gi,
    /NASDAQ:\s*([A-Z]{1,5})/gi,
    /\b([A-Z]{1,5})\s+stock/gi,
    /\bstock\s+([A-Z]{1,5})/gi
  ];

  private readonly financialMetricPatterns = new Map([
    ['pe_ratio', [/P\/E\s+ratio[:\s]*(\d+\.?\d*)/gi, /price[- ]to[- ]earnings[:\s]*(\d+\.?\d*)/gi]],
    ['market_cap', [/market\s+cap[:\s]*\$?(\d+\.?\d*)\s*([BMK]?)/gi, /market\s+capitalization[:\s]*\$?(\d+\.?\d*)\s*([BMK]?)/gi]],
    ['revenue', [/revenue[:\s]*\$?(\d+\.?\d*)\s*([BMK]?)/gi, /sales[:\s]*\$?(\d+\.?\d*)\s*([BMK]?)/gi]],
    ['eps', [/EPS[:\s]*\$?(\d+\.?\d*)/gi, /earnings\s+per\s+share[:\s]*\$?(\d+\.?\d*)/gi]],
    ['dividend_yield', [/dividend\s+yield[:\s]*(\d+\.?\d*)%?/gi]],
    ['beta', [/beta[:\s]*(\d+\.?\d*)/gi]],
    ['roa', [/ROA[:\s]*(\d+\.?\d*)%?/gi, /return\s+on\s+assets[:\s]*(\d+\.?\d*)%?/gi]],
    ['roe', [/ROE[:\s]*(\d+\.?\d*)%?/gi, /return\s+on\s+equity[:\s]*(\d+\.?\d*)%?/gi]]
  ]);

  private readonly currencyPatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)?/gi,
    /€(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:EUR|euros?)?/gi,
    /£(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:GBP|pounds?)?/gi,
    /¥(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:JPY|yen)?/gi,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|BRL|KRW|SGD|HKD)/gi
  ];

  private readonly commodityPatterns = [
    /gold\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /silver\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /oil\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /crude\s+oil\s+(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /natural\s+gas\s+(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /copper\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /wheat\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi,
    /corn\s+(?:price\s+)?(?:at\s+)?\$?(\d+(?:\.\d{2})?)/gi
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly nlpService: NLPProcessingService,
    private readonly marketDataService: MarketDataService,
    private readonly cacheService: ContentCacheService
  ) {
    this.config = {
      nerModel: this.configService.get<string>('NER_MODEL', 'huggingface/bert-base-NER'),
      disambiguationModel: this.configService.get<string>('DISAMBIGUATION_MODEL', 'sentence-transformers/all-mpnet-base-v2'),
      tickerResolverAPI: this.configService.get<string>('TICKER_RESOLVER_API'),
      financialMetricsModel: this.configService.get<string>('FINANCIAL_METRICS_MODEL', 'openai/gpt-4'),
      confidenceThreshold: this.configService.get<number>('ENTITY_CONFIDENCE_THRESHOLD', 0.7),
      contextWindowSize: this.configService.get<number>('CONTEXT_WINDOW_SIZE', 100),
      maxAlternatives: this.configService.get<number>('MAX_ALTERNATIVES', 3)
    };

    this.dataSources = {
      yahooFinanceAPI: this.configService.get<string>('YAHOO_FINANCE_API'),
      alphaVantageAPI: this.configService.get<string>('ALPHA_VANTAGE_API'),
      polygonAPI: this.configService.get<string>('POLYGON_API'),
      fmpAPI: this.configService.get<string>('FMP_API'),
      sec_edgarAPI: this.configService.get<string>('SEC_EDGAR_API'),
      exchangeAPIs: {
        NYSE: this.configService.get<string>('NYSE_API'),
        NASDAQ: this.configService.get<string>('NASDAQ_API'),
        LSE: this.configService.get<string>('LSE_API'),
        TSE: this.configService.get<string>('TSE_API')
      }
    };

    this.tickerDatabase = {
      symbols: new Map(),
      companyNames: new Map(),
      aliases: new Map(),
      exchanges: new Map()
    };

    this.initializeTickerDatabase();
  }

  /**
   * Main entry point for financial entity recognition
   */
  async recognizeFinancialEntities(
    content: string | string[],
    options: FinancialEntityRecognitionOptions
  ): Promise<ServiceResponse<FinancialEntityRecognitionResult>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      this.logger.log(`Starting financial entity recognition for request ${requestId}`);

      // Normalize input
      const contentArray = Array.isArray(content) ? content : [content];
      
      // Process each content piece
      const allEntities: RecognizedFinancialEntity[] = [];
      const allDisambiguations: EntityDisambiguation[] = [];
      const allTickerResolutions: TickerResolution[] = [];
      const allMetrics: ExtractedFinancialMetric[] = [];
      const allCurrencyMentions: CurrencyMention[] = [];
      const allCommodityMentions: CommodityMention[] = [];

      for (const text of contentArray) {
        // Extract entities using multiple approaches
        const entities = await this.extractEntitiesMultiModal(text, options);
        allEntities.push(...entities);

        // Perform disambiguations
        if (options.enableDisambiguation) {
          const disambiguations = await this.performEntityDisambiguation(entities, text);
          allDisambiguations.push(...disambiguations);
        }

        // Resolve tickers
        if (options.enableTickerResolution) {
          const resolutions = await this.resolveTickerSymbols(entities, text);
          allTickerResolutions.push(...resolutions);
        }

        // Extract financial metrics
        if (options.enableMetricExtraction) {
          const metrics = await this.extractFinancialMetrics(text);
          allMetrics.push(...metrics);
        }

        // Extract currency mentions
        if (options.enableCurrencyRecognition) {
          const currencies = await this.extractCurrencyMentions(text);
          allCurrencyMentions.push(...currencies);
        }

        // Extract commodity mentions
        if (options.enableCommodityRecognition) {
          const commodities = await this.extractCommodityMentions(text);
          allCommodityMentions.push(...commodities);
        }
      }

      // Deduplicate and rank entities
      const uniqueEntities = this.deduplicateEntities(allEntities);
      const rankedEntities = this.rankEntitiesByConfidence(uniqueEntities, options.confidenceThreshold);

      // Calculate confidence metrics
      const confidence = this.calculateOverallConfidence(rankedEntities);

      const result: FinancialEntityRecognitionResult = {
        entities: rankedEntities,
        disambiguations: allDisambiguations,
        tickerResolutions: allTickerResolutions,
        financialMetrics: allMetrics,
        currencyMentions: allCurrencyMentions,
        commodityMentions: allCommodityMentions,
        processingMetrics: {
          totalEntitiesFound: allEntities.length,
          entitiesRecognized: rankedEntities.length,
          ambiguitiesResolved: allDisambiguations.length,
          processingTimeMs: Date.now() - startTime
        },
        confidence
      };

      this.logger.log(`Financial entity recognition completed for request ${requestId} in ${Date.now() - startTime}ms`);

      return {
        success: true,
        data: result,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          timestamp: new Date(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logger.error(`Error in financial entity recognition for request ${requestId}:`, error);

      return {
        success: false,
        error: {
          code: 'ENTITY_RECOGNITION_ERROR',
          message: error.message,
          details: error
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
    }
  }

  /**
   * Extract entities using multiple recognition approaches
   */
  private async extractEntitiesMultiModal(
    text: string,
    options: FinancialEntityRecognitionOptions
  ): Promise<RecognizedFinancialEntity[]> {
    const entities: RecognizedFinancialEntity[] = [];

    try {
      // 1. Rule-based pattern matching
      const patternEntities = await this.extractEntitiesWithPatterns(text, options);
      entities.push(...patternEntities);

      // 2. NLP-based entity extraction
      const nlpEntities = await this.extractEntitiesWithNLP(text, options);
      entities.push(...nlpEntities);

      // 3. Dictionary-based lookup
      const dictionaryEntities = await this.extractEntitiesWithDictionary(text, options);
      entities.push(...dictionaryEntities);

      // 4. ML-based entity recognition
      if (options.useExternalDataSources) {
        const mlEntities = await this.extractEntitiesWithML(text, options);
        entities.push(...mlEntities);
      }

    } catch (error) {
      this.logger.error('Error in multi-modal entity extraction:', error);
    }

    return entities;
  }

  /**
   * Extract entities using pattern matching
   */
  private async extractEntitiesWithPatterns(
    text: string,
    options: FinancialEntityRecognitionOptions
  ): Promise<RecognizedFinancialEntity[]> {
    const entities: RecognizedFinancialEntity[] = [];

    try {
      // Extract stock symbols
      if (options.entityTypes.includes(FinancialEntityType.STOCK)) {
        for (const pattern of this.stockPatterns) {
          const matches = [...text.matchAll(pattern)];
          
          for (const match of matches) {
            const symbol = match[1] || match[0];
            const cleanSymbol = symbol.replace(/[\$\(\)]/g, '').trim();
            
            if (this.isValidStockSymbol(cleanSymbol)) {
              const entity: RecognizedFinancialEntity = {
                id: this.generateEntityId(),
                text: cleanSymbol,
                type: FinancialEntityType.STOCK,
                startOffset: match.index,
                endOffset: match.index + match[0].length,
                confidence: this.calculatePatternConfidence(cleanSymbol, text, match.index),
                context: this.extractContext(text, match.index, options.contextWindowSize),
                relatedEntities: [],
                metadata: {
                  extractionMethod: 'pattern_matching',
                  pattern: pattern.source,
                  originalMatch: match[0]
                }
              };

              entities.push(entity);
            }
          }
        }
      }

      // Extract company names (basic pattern-based approach)
      if (options.entityTypes.includes(FinancialEntityType.COMPANY_NAME)) {
        const companyPatterns = [
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc\.?|Corp\.?|Ltd\.?|LLC|Company|Co\.?)/g,
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+shares?/gi,
          /\bshares?\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
        ];

        for (const pattern of companyPatterns) {
          const matches = [...text.matchAll(pattern)];
          
          for (const match of matches) {
            const companyName = match[1];
            
            if (companyName && companyName.length > 2) {
              const entity: RecognizedFinancialEntity = {
                id: this.generateEntityId(),
                text: companyName,
                type: FinancialEntityType.COMPANY_NAME,
                startOffset: match.index,
                endOffset: match.index + match[0].length,
                confidence: this.calculatePatternConfidence(companyName, text, match.index),
                context: this.extractContext(text, match.index, options.contextWindowSize),
                relatedEntities: [],
                metadata: {
                  extractionMethod: 'pattern_matching',
                  fullMatch: match[0]
                }
              };

              entities.push(entity);
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in pattern-based entity extraction:', error);
    }

    return entities;
  }

  /**
   * Extract entities using NLP service
   */
  private async extractEntitiesWithNLP(
    text: string,
    options: FinancialEntityRecognitionOptions
  ): Promise<RecognizedFinancialEntity[]> {
    const entities: RecognizedFinancialEntity[] = [];

    try {
      const nlpResult = await this.nlpService.processText(text, {
        enableEntityExtraction: true,
        entityTypes: ['ORGANIZATION', 'STOCK_SYMBOL', 'FINANCIAL_INSTRUMENT', 'MONEY', 'PERCENT'],
        confidenceThreshold: options.confidenceThreshold
      });

      if (nlpResult.entities?.entities) {
        for (const nlpEntity of nlpResult.entities.entities) {
          const financialEntityType = this.mapNLPEntityToFinancialType(nlpEntity.type);
          
          if (financialEntityType && options.entityTypes.includes(financialEntityType)) {
            const entity: RecognizedFinancialEntity = {
              id: this.generateEntityId(),
              text: nlpEntity.text,
              type: financialEntityType,
              startOffset: nlpEntity.startOffset,
              endOffset: nlpEntity.endOffset,
              confidence: nlpEntity.confidence,
              context: this.extractContext(text, nlpEntity.startOffset, options.contextWindowSize),
              relatedEntities: nlpEntity.relatedEntities || [],
              metadata: {
                extractionMethod: 'nlp',
                originalType: nlpEntity.type,
                nlpMetadata: nlpEntity.metadata
              }
            };

            entities.push(entity);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in NLP-based entity extraction:', error);
    }

    return entities;
  }

  /**
   * Extract entities using dictionary lookup
   */
  private async extractEntitiesWithDictionary(
    text: string,
    options: FinancialEntityRecognitionOptions
  ): Promise<RecognizedFinancialEntity[]> {
    const entities: RecognizedFinancialEntity[] = [];

    try {
      const words = text.split(/\s+/);
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, '');
        
        // Check ticker database
        if (this.tickerDatabase.symbols.has(word.toUpperCase())) {
          const instrument = this.tickerDatabase.symbols.get(word.toUpperCase());
          
          const entity: RecognizedFinancialEntity = {
            id: this.generateEntityId(),
            text: word.toUpperCase(),
            type: this.mapInstrumentTypeToEntityType(instrument.type),
            startOffset: text.indexOf(word),
            endOffset: text.indexOf(word) + word.length,
            confidence: 0.95, // High confidence for dictionary matches
            instrument,
            context: this.extractContext(text, text.indexOf(word), options.contextWindowSize),
            relatedEntities: [],
            metadata: {
              extractionMethod: 'dictionary_lookup',
              instrumentData: instrument
            }
          };

          entities.push(entity);
        }

        // Check for multi-word company names
        if (i < words.length - 2) {
          const multiWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`.replace(/[^\w\s]/g, '');
          
          if (this.tickerDatabase.companyNames.has(multiWord.toLowerCase())) {
            const tickers = this.tickerDatabase.companyNames.get(multiWord.toLowerCase());
            
            const entity: RecognizedFinancialEntity = {
              id: this.generateEntityId(),
              text: multiWord,
              type: FinancialEntityType.COMPANY_NAME,
              startOffset: text.indexOf(multiWord),
              endOffset: text.indexOf(multiWord) + multiWord.length,
              confidence: 0.90,
              context: this.extractContext(text, text.indexOf(multiWord), options.contextWindowSize),
              relatedEntities: tickers,
              metadata: {
                extractionMethod: 'dictionary_lookup',
                associatedTickers: tickers
              }
            };

            entities.push(entity);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in dictionary-based entity extraction:', error);
    }

    return entities;
  }

  /**
   * Extract entities using ML models
   */
  private async extractEntitiesWithML(
    text: string,
    options: FinancialEntityRecognitionOptions
  ): Promise<RecognizedFinancialEntity[]> {
    const entities: RecognizedFinancialEntity[] = [];

    try {
      // This would integrate with external ML services like OpenAI, Hugging Face, etc.
      // For now, we'll implement a placeholder that simulates ML extraction
      
      const mlResponse = await this.callMLEntityExtraction(text, options);
      
      if (mlResponse && mlResponse.entities) {
        for (const mlEntity of mlResponse.entities) {
          const entity: RecognizedFinancialEntity = {
            id: this.generateEntityId(),
            text: mlEntity.text,
            type: mlEntity.type,
            startOffset: mlEntity.start,
            endOffset: mlEntity.end,
            confidence: mlEntity.confidence,
            context: this.extractContext(text, mlEntity.start, options.contextWindowSize),
            relatedEntities: mlEntity.relatedEntities || [],
            metadata: {
              extractionMethod: 'ml_model',
              modelName: this.config.nerModel,
              modelScore: mlEntity.score
            }
          };

          entities.push(entity);
        }
      }

    } catch (error) {
      this.logger.error('Error in ML-based entity extraction:', error);
    }

    return entities;
  }

  /**
   * Perform entity disambiguation
   */
  private async performEntityDisambiguation(
    entities: RecognizedFinancialEntity[],
    text: string
  ): Promise<EntityDisambiguation[]> {
    const disambiguations: EntityDisambiguation[] = [];

    try {
      for (const entity of entities) {
        if (entity.type === FinancialEntityType.COMPANY_NAME) {
          // Find potential ticker matches for company names
          const candidates = await this.findDisambiguationCandidates(entity.text, text);
          
          if (candidates.length > 1) {
            const selectedCandidate = await this.selectBestCandidate(candidates, entity, text);
            
            const disambiguation: EntityDisambiguation = {
              originalText: entity.text,
              candidates,
              selectedCandidate,
              disambiguationMethod: 'context_similarity',
              contextFactors: this.extractContextFactors(entity, text),
              confidence: selectedCandidate.score
            };

            disambiguations.push(disambiguation);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in entity disambiguation:', error);
    }

    return disambiguations;
  }

  /**
   * Resolve ticker symbols
   */
  private async resolveTickerSymbols(
    entities: RecognizedFinancialEntity[],
    text: string
  ): Promise<TickerResolution[]> {
    const resolutions: TickerResolution[] = [];

    try {
      for (const entity of entities) {
        if (entity.type === FinancialEntityType.COMPANY_NAME) {
          const resolution = await this.resolveCompanyToTicker(entity.text, text);
          
          if (resolution) {
            resolutions.push(resolution);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in ticker resolution:', error);
    }

    return resolutions;
  }

  /**
   * Extract financial metrics from text
   */
  private async extractFinancialMetrics(text: string): Promise<ExtractedFinancialMetric[]> {
    const metrics: ExtractedFinancialMetric[] = [];

    try {
      for (const [metricName, patterns] of this.financialMetricPatterns) {
        for (const pattern of patterns) {
          const matches = [...text.matchAll(pattern)];
          
          for (const match of matches) {
            const value = parseFloat(match[1]);
            const unit = match[2] || '';
            
            if (!isNaN(value)) {
              // Extract context to find associated symbol
              const context = this.extractContext(text, match.index, 50);
              const symbol = this.extractSymbolFromContext(context);

              const metric: ExtractedFinancialMetric = {
                symbol: symbol || undefined,
                metricName,
                value: this.normalizeMetricValue(value, unit),
                unit: this.standardizeUnit(unit),
                period: this.extractPeriodFromContext(context),
                metricType: this.classifyMetricType(metricName),
                context,
                confidence: this.calculateMetricConfidence(match, context),
                extractionMethod: 'pattern_matching'
              };

              metrics.push(metric);
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error extracting financial metrics:', error);
    }

    return metrics;
  }

  /**
   * Extract currency mentions
   */
  private async extractCurrencyMentions(text: string): Promise<CurrencyMention[]> {
    const currencies: CurrencyMention[] = [];

    try {
      for (const pattern of this.currencyPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        for (const match of matches) {
          const amount = this.parseAmount(match[1]);
          const currencyCode = this.extractCurrencyCode(match);
          
          const currency: CurrencyMention = {
            currency: this.getCurrencyName(currencyCode),
            currencyCode,
            amount,
            context: this.extractContext(text, match.index, 30),
            confidence: this.calculateCurrencyConfidence(match, text)
          };

          currencies.push(currency);
        }
      }

    } catch (error) {
      this.logger.error('Error extracting currency mentions:', error);
    }

    return currencies;
  }

  /**
   * Extract commodity mentions
   */
  private async extractCommodityMentions(text: string): Promise<CommodityMention[]> {
    const commodities: CommodityMention[] = [];

    try {
      for (const pattern of this.commodityPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        for (const match of matches) {
          const price = parseFloat(match[1]);
          const commodity = this.extractCommodityName(match);
          
          if (!isNaN(price) && commodity) {
            const commodityMention: CommodityMention = {
              commodity,
              commodityCode: this.getCommodityCode(commodity),
              amount: price,
              unit: this.getCommodityUnit(commodity),
              context: this.extractContext(text, match.index, 30),
              confidence: this.calculateCommodityConfidence(match, text),
              currentPrice: price,
              priceUnit: 'USD'
            };

            commodities.push(commodityMention);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error extracting commodity mentions:', error);
    }

    return commodities;
  }

  // ==================
  // HELPER METHODS
  // ==================

  private isValidStockSymbol(symbol: string): boolean {
    // Basic validation for stock symbols
    if (!symbol || symbol.length < 1 || symbol.length > 5) return false;
    if (!/^[A-Z]+$/.test(symbol)) return false;
    
    // Filter out common false positives
    const falsePositives = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'HAS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
    
    return !falsePositives.includes(symbol);
  }

  private calculatePatternConfidence(text: string, fullText: string, index: number): number {
    let confidence = 0.6; // Base confidence for pattern matches
    
    // Increase confidence based on context
    const context = this.extractContext(fullText, index, 20);
    
    if (context.includes('stock') || context.includes('share') || context.includes('ticker')) {
      confidence += 0.2;
    }
    
    if (context.includes('NYSE') || context.includes('NASDAQ') || context.includes('exchange')) {
      confidence += 0.15;
    }
    
    if (/\$/.test(context)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  private extractContext(text: string, index: number, windowSize: number): string {
    const start = Math.max(0, index - windowSize);
    const end = Math.min(text.length, index + windowSize);
    return text.substring(start, end);
  }

  private mapNLPEntityToFinancialType(nlpType: string): FinancialEntityType | null {
    const mappings: Record<string, FinancialEntityType> = {
      'ORGANIZATION': FinancialEntityType.COMPANY_NAME,
      'STOCK_SYMBOL': FinancialEntityType.STOCK,
      'FINANCIAL_INSTRUMENT': FinancialEntityType.STOCK,
      'MONEY': FinancialEntityType.FINANCIAL_METRIC,
      'PERCENT': FinancialEntityType.FINANCIAL_METRIC
    };

    return mappings[nlpType] || null;
  }

  private mapInstrumentTypeToEntityType(instrumentType: string): FinancialEntityType {
    const mappings: Record<string, FinancialEntityType> = {
      'stock': FinancialEntityType.STOCK,
      'bond': FinancialEntityType.BOND,
      'option': FinancialEntityType.OPTION,
      'future': FinancialEntityType.FUTURE,
      'etf': FinancialEntityType.ETF,
      'mutual_fund': FinancialEntityType.MUTUAL_FUND,
      'crypto': FinancialEntityType.CRYPTOCURRENCY,
      'commodity': FinancialEntityType.COMMODITY,
      'currency': FinancialEntityType.CURRENCY_PAIR,
      'index': FinancialEntityType.INDEX
    };

    return mappings[instrumentType] || FinancialEntityType.STOCK;
  }

  private deduplicateEntities(entities: RecognizedFinancialEntity[]): RecognizedFinancialEntity[] {
    const unique = new Map<string, RecognizedFinancialEntity>();
    
    for (const entity of entities) {
      const key = `${entity.text.toLowerCase()}_${entity.type}_${entity.startOffset}`;
      
      if (!unique.has(key) || unique.get(key).confidence < entity.confidence) {
        unique.set(key, entity);
      }
    }
    
    return Array.from(unique.values());
  }

  private rankEntitiesByConfidence(
    entities: RecognizedFinancialEntity[],
    threshold: number
  ): RecognizedFinancialEntity[] {
    return entities
      .filter(entity => entity.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private calculateOverallConfidence(entities: RecognizedFinancialEntity[]): ConfidenceMetrics {
    if (entities.length === 0) {
      return {
        overall: 0,
        dataQuality: 0,
        sourceReliability: 0,
        modelAccuracy: 0,
        temporalRelevance: 0
      };
    }

    const avgConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
    
    return {
      overall: avgConfidence,
      dataQuality: 0.85,
      sourceReliability: 0.80,
      modelAccuracy: 0.78,
      temporalRelevance: 0.95
    };
  }

  private generateRequestId(): string {
    return `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEntityId(): string {
    return `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  private async initializeTickerDatabase(): Promise<void> {
    try {
      // Initialize with some common tickers - in production, this would load from a comprehensive database
      const commonTickers = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services' }
      ];

      for (const ticker of commonTickers) {
        const instrument: FinancialInstrument = {
          symbol: ticker.symbol,
          name: ticker.name,
          type: ticker.type as any,
          exchange: ticker.exchange,
          sector: ticker.sector,
          currency: 'USD'
        };

        this.tickerDatabase.symbols.set(ticker.symbol, instrument);
        
        // Add company name mapping
        const companyKey = ticker.name.toLowerCase();
        if (!this.tickerDatabase.companyNames.has(companyKey)) {
          this.tickerDatabase.companyNames.set(companyKey, []);
        }
        this.tickerDatabase.companyNames.get(companyKey).push(ticker.symbol);
      }

      this.logger.log('Ticker database initialized with common symbols');
    } catch (error) {
      this.logger.error('Error initializing ticker database:', error);
    }
  }

  // Placeholder methods for full implementation
  private async callMLEntityExtraction(text: string, options: FinancialEntityRecognitionOptions): Promise<any> {
    // This would call external ML APIs
    return { entities: [] };
  }

  private async findDisambiguationCandidates(text: string, context: string): Promise<DisambiguationCandidate[]> {
    // Implement disambiguation candidate finding
    return [];
  }

  private async selectBestCandidate(candidates: DisambiguationCandidate[], entity: RecognizedFinancialEntity, text: string): Promise<DisambiguationCandidate> {
    // Implement best candidate selection
    return candidates[0];
  }

  private extractContextFactors(entity: RecognizedFinancialEntity, text: string): string[] {
    // Extract factors used in disambiguation
    return ['sector_match', 'geographic_proximity', 'temporal_relevance'];
  }

  private async resolveCompanyToTicker(companyName: string, context: string): Promise<TickerResolution | null> {
    // Implement company name to ticker resolution
    return null;
  }

  private extractSymbolFromContext(context: string): string | null {
    // Extract stock symbol from context
    const symbolMatch = context.match(/\b([A-Z]{1,5})\b/);
    return symbolMatch ? symbolMatch[1] : null;
  }

  private extractPeriodFromContext(context: string): string {
    // Extract time period from context
    if (context.includes('quarterly')) return 'quarterly';
    if (context.includes('annual') || context.includes('yearly')) return 'annual';
    if (context.includes('TTM') || context.includes('trailing')) return 'TTM';
    return 'current';
  }

  private classifyMetricType(metricName: string): 'profitability' | 'liquidity' | 'efficiency' | 'leverage' | 'valuation' | 'growth' {
    const classifications: Record<string, any> = {
      'pe_ratio': 'valuation',
      'market_cap': 'valuation',
      'revenue': 'growth',
      'eps': 'profitability',
      'dividend_yield': 'profitability',
      'beta': 'valuation',
      'roa': 'profitability',
      'roe': 'profitability'
    };

    return classifications[metricName] || 'valuation';
  }

  private normalizeMetricValue(value: number, unit: string): number {
    const multipliers: Record<string, number> = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000,
      'T': 1000000000000
    };

    return value * (multipliers[unit.toUpperCase()] || 1);
  }

  private standardizeUnit(unit: string): string {
    const standardUnits: Record<string, string> = {
      'K': 'thousands',
      'M': 'millions',
      'B': 'billions',
      'T': 'trillions'
    };

    return standardUnits[unit.toUpperCase()] || 'units';
  }

  private calculateMetricConfidence(match: RegExpMatchArray, context: string): number {
    let confidence = 0.7; // Base confidence
    
    if (context.includes('reported') || context.includes('official')) confidence += 0.1;
    if (context.includes('estimated') || context.includes('projected')) confidence -= 0.1;
    if (/\d+\.\d{2}/.test(match[1])) confidence += 0.1; // Precise numbers
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private parseAmount(amountStr: string): number {
    return parseFloat(amountStr.replace(/,/g, ''));
  }

  private extractCurrencyCode(match: RegExpMatchArray): string {
    // Extract currency code from regex match
    if (match[0].includes('$')) return 'USD';
    if (match[0].includes('€')) return 'EUR';
    if (match[0].includes('£')) return 'GBP';
    if (match[0].includes('¥')) return 'JPY';
    return match[2] || 'USD';
  }

  private getCurrencyName(code: string): string {
    const names: Record<string, string> = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'CHF': 'Swiss Franc',
      'CNY': 'Chinese Yuan',
      'INR': 'Indian Rupee'
    };

    return names[code] || code;
  }

  private calculateCurrencyConfidence(match: RegExpMatchArray, text: string): number {
    let confidence = 0.8; // Base confidence for currency patterns
    
    const context = this.extractContext(text, match.index, 20);
    if (context.includes('price') || context.includes('cost') || context.includes('revenue')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  private extractCommodityName(match: RegExpMatchArray): string {
    const commodityMap: Record<string, string> = {
      'gold': 'Gold',
      'silver': 'Silver',
      'oil': 'Crude Oil',
      'crude oil': 'Crude Oil',
      'natural gas': 'Natural Gas',
      'copper': 'Copper',
      'wheat': 'Wheat',
      'corn': 'Corn'
    };

    const matchText = match[0].toLowerCase();
    for (const [key, value] of Object.entries(commodityMap)) {
      if (matchText.includes(key)) return value;
    }

    return 'Unknown';
  }

  private getCommodityCode(commodity: string): string {
    const codes: Record<string, string> = {
      'Gold': 'XAU',
      'Silver': 'XAG',
      'Crude Oil': 'CL',
      'Natural Gas': 'NG',
      'Copper': 'HG',
      'Wheat': 'ZW',
      'Corn': 'ZC'
    };

    return codes[commodity] || commodity.toUpperCase();
  }

  private getCommodityUnit(commodity: string): string {
    const units: Record<string, string> = {
      'Gold': 'troy oz',
      'Silver': 'troy oz',
      'Crude Oil': 'barrel',
      'Natural Gas': 'MMBtu',
      'Copper': 'pound',
      'Wheat': 'bushel',
      'Corn': 'bushel'
    };

    return units[commodity] || 'unit';
  }

  private calculateCommodityConfidence(match: RegExpMatchArray, text: string): number {
    let confidence = 0.85; // High confidence for commodity price patterns
    
    const context = this.extractContext(text, match.index, 30);
    if (context.includes('price') || context.includes('trading') || context.includes('futures')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }
}