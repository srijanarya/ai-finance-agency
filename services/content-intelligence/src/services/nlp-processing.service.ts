/**
 * NLP Processing Service
 * 
 * Comprehensive natural language processing service that provides:
 * - Sentiment analysis using multiple engines
 * - Entity extraction with financial domain specialization
 * - Key phrase extraction and categorization
 * - Language detection and text summarization
 * - Topic modeling and content analysis
 * 
 * Integrates with both traditional NLP libraries and AI services for optimal accuracy
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as natural from 'natural';
import * as sentiment from 'sentiment';
import * as nlp from 'compromise';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  NLPProcessingOptions,
  NLPProcessingResult,
  SentimentAnalysisResult,
  EntityExtractionResult,
  NLPEntity,
  EntityType,
  KeyPhraseExtractionResult,
  KeyPhrase,
  LanguageDetectionResult,
  TextSummarizationResult,
  TopicModelingResult,
  Topic
} from '../interfaces/nlp.interface';

@Injectable()
export class NlpProcessingService {
  private readonly logger = new Logger(NlpProcessingService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;
  private readonly stemmer = natural.PorterStemmer;
  private readonly tokenizer = new natural.WordTokenizer();
  private readonly sentimentAnalyzer = new sentiment();

  // Financial domain-specific patterns and vocabularies
  private readonly financialPatterns = {
    stockSymbol: /\b[A-Z]{1,5}(?:\.[A-Z]{1,2})?\b/g,
    currency: /\$[\d,]+\.?\d*/g,
    percentage: /\d+\.?\d*%/g,
    priceTarget: /(?:price target|target price|pt)[:\s]*\$?(\d+\.?\d*)/gi,
    recommendation: /(?:rating|recommendation|upgrade|downgrade)[:\s]*(\w+)/gi,
    marketCap: /market cap[:\s]*\$?(\d+\.?\d*[bmk]?)/gi
  };

  private readonly financialTerms = new Set([
    'earnings', 'revenue', 'profit', 'loss', 'dividend', 'yield', 'eps',
    'pe ratio', 'market cap', 'volume', 'volatility', 'liquidity',
    'bull', 'bear', 'bullish', 'bearish', 'rally', 'correction',
    'merger', 'acquisition', 'ipo', 'buyback', 'split', 'guidance',
    'consensus', 'estimate', 'forecast', 'outlook', 'growth'
  ]);

  constructor(
    private configService: ConfigService,
  ) {
    // Initialize AI services
    const openaiKey = this.configService.get<string>('ai.openaiApiKey');
    const anthropicKey = this.configService.get<string>('ai.anthropicApiKey');

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    // Initialize Natural Language models
    this.initializeNLPModels();
  }

  private initializeNLPModels(): void {
    try {
      // Load tokenizer and stemmer
      natural.PorterStemmer.attach();
      
      // Initialize language detection
      natural.distance.setOptions({ ignoreCase: true });

      this.logger.log('NLP models initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize NLP models:', error);
    }
  }

  /**
   * Main processing method that orchestrates all NLP operations
   */
  async processText(
    text: string,
    options: NLPProcessingOptions = {}
  ): Promise<NLPProcessingResult> {
    const startTime = Date.now();
    
    try {
      const result: NLPProcessingResult = {
        text,
        processedAt: new Date(),
        processingTimeMs: 0,
        metadata: this.extractTextMetadata(text)
      };

      // Execute enabled analyses in parallel for performance
      const analyses = await Promise.allSettled([
        options.enableSentimentAnalysis !== false ? this.analyzeSentiment(text, options) : null,
        options.enableEntityExtraction !== false ? this.extractEntities(text, options) : null,
        options.enableKeyPhraseExtraction !== false ? this.extractKeyPhrases(text, options) : null,
        options.enableLanguageDetection !== false ? this.detectLanguage(text) : null,
        options.enableTextSummarization ? this.summarizeText(text, options) : null,
        options.enableTopicModeling ? this.modelTopics(text, options) : null,
      ]);

      // Safely assign results
      if (analyses[0].status === 'fulfilled' && analyses[0].value) {
        result.sentiment = analyses[0].value;
      }
      if (analyses[1].status === 'fulfilled' && analyses[1].value) {
        result.entities = analyses[1].value;
      }
      if (analyses[2].status === 'fulfilled' && analyses[2].value) {
        result.keyPhrases = analyses[2].value;
      }
      if (analyses[3].status === 'fulfilled' && analyses[3].value) {
        result.language = analyses[3].value;
      }
      if (analyses[4].status === 'fulfilled' && analyses[4].value) {
        result.summary = analyses[4].value;
      }
      if (analyses[5].status === 'fulfilled' && analyses[5].value) {
        result.topics = analyses[5].value;
      }

      result.processingTimeMs = Date.now() - startTime;
      
      this.logger.debug(`Processed text in ${result.processingTimeMs}ms`);
      return result;

    } catch (error) {
      this.logger.error('Error processing text:', error);
      throw new Error(`NLP processing failed: ${error.message}`);
    }
  }

  /**
   * Advanced sentiment analysis using multiple engines for accuracy
   */
  private async analyzeSentiment(
    text: string,
    options: NLPProcessingOptions
  ): Promise<SentimentAnalysisResult> {
    try {
      // Use sentiment library for basic analysis
      const basicSentiment = this.sentimentAnalyzer.analyze(text);
      
      // Use compromise for additional insights
      const doc = nlp(text);
      const sentences = doc.sentences().out('array');
      
      let totalScore = 0;
      let totalMagnitude = 0;
      const sentenceCount = sentences.length;

      // Analyze each sentence
      for (const sentence of sentences) {
        const sentenceAnalysis = this.sentimentAnalyzer.analyze(sentence);
        totalScore += sentenceAnalysis.score;
        totalMagnitude += Math.abs(sentenceAnalysis.score);
      }

      // Normalize scores
      const averageScore = sentenceCount > 0 ? totalScore / sentenceCount : 0;
      const averageMagnitude = sentenceCount > 0 ? totalMagnitude / sentenceCount : 0;
      
      // Map to -1 to 1 scale
      const normalizedScore = Math.max(-1, Math.min(1, averageScore / 5));
      const magnitude = Math.min(1, averageMagnitude / 5);

      // Determine label
      let label: 'positive' | 'negative' | 'neutral';
      if (normalizedScore > 0.1) label = 'positive';
      else if (normalizedScore < -0.1) label = 'negative';
      else label = 'neutral';

      // Calculate confidence based on magnitude and consistency
      const confidence = Math.min(1, magnitude + (1 - Math.abs(normalizedScore - averageScore / 5)) * 0.5);

      const result: SentimentAnalysisResult = {
        score: normalizedScore,
        magnitude,
        label,
        confidence,
        details: {
          positive: Math.max(0, normalizedScore),
          negative: Math.abs(Math.min(0, normalizedScore)),
          neutral: 1 - magnitude
        }
      };

      // Use advanced AI for complex analysis if enabled
      if (options.useAdvancedNLP && this.openai && text.length > 500) {
        try {
          const aiResult = await this.getAISentimentAnalysis(text);
          if (aiResult) {
            // Blend AI results with traditional analysis
            result.score = (result.score + aiResult.score) / 2;
            result.confidence = Math.max(result.confidence, aiResult.confidence);
          }
        } catch (error) {
          this.logger.warn('AI sentiment analysis failed, using traditional method', error);
        }
      }

      return result;

    } catch (error) {
      this.logger.error('Sentiment analysis failed:', error);
      throw error;
    }
  }

  /**
   * Financial domain-aware entity extraction
   */
  private async extractEntities(
    text: string,
    options: NLPProcessingOptions
  ): Promise<EntityExtractionResult> {
    try {
      const entities: NLPEntity[] = [];
      const doc = nlp(text);

      // Extract basic entities using compromise
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');
      
      // Add standard entities
      people.forEach(person => {
        entities.push(this.createEntity(person, EntityType.PERSON, text));
      });

      places.forEach(place => {
        entities.push(this.createEntity(place, EntityType.LOCATION, text));
      });

      organizations.forEach(org => {
        entities.push(this.createEntity(org, EntityType.ORGANIZATION, text));
      });

      // Extract financial-specific entities
      await this.extractFinancialEntities(text, entities);

      // Filter by confidence and requested types
      const filteredEntities = entities.filter(entity => {
        const confidenceCheck = entity.confidence >= (options.confidenceThreshold || 0.5);
        const typeCheck = !options.entityTypes || options.entityTypes.includes(entity.type);
        return confidenceCheck && typeCheck;
      });

      // Remove duplicates and sort by confidence
      const uniqueEntities = this.deduplicateEntities(filteredEntities);
      uniqueEntities.sort((a, b) => b.confidence - a.confidence);

      return {
        entities: uniqueEntities,
        totalEntities: uniqueEntities.length,
        entityTypes: [...new Set(uniqueEntities.map(e => e.type))]
      };

    } catch (error) {
      this.logger.error('Entity extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract financial domain entities using pattern matching and domain knowledge
   */
  private async extractFinancialEntities(text: string, entities: NLPEntity[]): Promise<void> {
    // Stock symbols
    const stockMatches = text.match(this.financialPatterns.stockSymbol) || [];
    stockMatches.forEach(match => {
      if (this.isValidStockSymbol(match)) {
        entities.push(this.createEntity(match, EntityType.STOCK_SYMBOL, text, 0.9));
      }
    });

    // Currency amounts
    const currencyMatches = text.match(this.financialPatterns.currency) || [];
    currencyMatches.forEach(match => {
      entities.push(this.createEntity(match, EntityType.MONEY, text, 0.8));
    });

    // Percentages
    const percentMatches = text.match(this.financialPatterns.percentage) || [];
    percentMatches.forEach(match => {
      entities.push(this.createEntity(match, EntityType.PERCENT, text, 0.8));
    });

    // Price targets
    const priceTargetMatches = [...text.matchAll(this.financialPatterns.priceTarget)];
    priceTargetMatches.forEach(match => {
      entities.push(this.createEntity(match[1], EntityType.MONEY, text, 0.7, {
        context: 'price_target',
        fullMatch: match[0]
      }));
    });
  }

  /**
   * Advanced key phrase extraction with financial domain awareness
   */
  private async extractKeyPhrases(
    text: string,
    options: NLPProcessingOptions
  ): Promise<KeyPhraseExtractionResult> {
    try {
      const doc = nlp(text);
      const phrases: KeyPhrase[] = [];

      // Extract noun phrases
      const nounPhrases = doc.nouns().out('array');
      
      // Extract financial terms
      const words = this.tokenizer.tokenize(text.toLowerCase()) || [];
      const financialTermsFound = words.filter(word => 
        this.financialTerms.has(word) || this.financialTerms.has(this.stemmer.stem(word))
      );

      // Score and rank phrases
      nounPhrases.forEach(phrase => {
        const relevanceScore = this.calculatePhraseRelevance(phrase, text);
        const frequency = this.calculatePhraseFrequency(phrase, text);
        
        if (relevanceScore > 0.3) {
          phrases.push({
            text: phrase,
            relevanceScore,
            frequency,
            category: this.categorizePlrase(phrase)
          });
        }
      });

      // Add financial terms as key phrases
      financialTermsFound.forEach(term => {
        const frequency = this.calculatePhraseFrequency(term, text);
        phrases.push({
          text: term,
          relevanceScore: 0.8,
          frequency,
          category: 'financial'
        });
      });

      // Remove duplicates and sort
      const uniquePhrases = this.deduplicatePhrases(phrases);
      uniquePhrases.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Limit results
      const maxPhrases = options.maxKeyPhrases || 20;
      const topPhrases = uniquePhrases.slice(0, maxPhrases);

      return {
        keyPhrases: topPhrases,
        totalPhrases: topPhrases.length,
        categories: [...new Set(topPhrases.map(p => p.category).filter(Boolean))]
      };

    } catch (error) {
      this.logger.error('Key phrase extraction failed:', error);
      throw error;
    }
  }

  /**
   * Language detection using multiple methods
   */
  private async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      // Simple heuristic-based detection
      // In production, you might want to use a more sophisticated library
      const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      
      const englishWordCount = words.filter(word => englishWords.includes(word)).length;
      const englishRatio = englishWordCount / words.length;
      
      const confidence = Math.min(0.95, englishRatio * 2);
      
      return {
        language: confidence > 0.7 ? 'en' : 'unknown',
        confidence,
        alternativeLanguages: confidence < 0.9 ? [
          { language: 'unknown', confidence: 1 - confidence }
        ] : undefined
      };

    } catch (error) {
      this.logger.error('Language detection failed:', error);
      return {
        language: 'unknown',
        confidence: 0.0
      };
    }
  }

  /**
   * Text summarization using extractive and abstractive methods
   */
  private async summarizeText(
    text: string,
    options: NLPProcessingOptions
  ): Promise<TextSummarizationResult> {
    try {
      const sentences = nlp(text).sentences().out('array');
      const targetLength = options.summaryLength || Math.max(1, Math.floor(sentences.length * 0.3));
      
      // Score sentences based on various factors
      const scoredSentences = sentences.map(sentence => ({
        text: sentence,
        score: this.scoreSentence(sentence, text)
      }));

      // Select top sentences
      scoredSentences.sort((a, b) => b.score - a.score);
      const selectedSentences = scoredSentences.slice(0, targetLength);
      
      // Reorder selected sentences to maintain original flow
      const summary = selectedSentences
        .sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text))
        .map(s => s.text)
        .join(' ');

      // Extract key points
      const keyPhrases = await this.extractKeyPhrases(text, { maxKeyPhrases: 5 });
      const keyPoints = keyPhrases.keyPhrases.slice(0, 3).map(p => p.text);

      return {
        summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: summary.length / text.length,
        keyPoints,
        confidence: 0.8,
        method: 'extractive'
      };

    } catch (error) {
      this.logger.error('Text summarization failed:', error);
      throw error;
    }
  }

  /**
   * Topic modeling using keyword clustering and semantic analysis
   */
  private async modelTopics(
    text: string,
    options: NLPProcessingOptions
  ): Promise<TopicModelingResult> {
    try {
      const doc = nlp(text);
      const sentences = doc.sentences().out('array');
      
      // Extract key terms and group them into topics
      const keyPhrases = await this.extractKeyPhrases(text, { maxKeyPhrases: 30 });
      const terms = keyPhrases.keyPhrases.map(p => p.text);

      // Simple topic clustering based on co-occurrence and semantic similarity
      const topics = this.clusterTermsIntoTopics(terms, sentences);
      
      // Find dominant topic
      const dominantTopic = topics.reduce((max, topic) => 
        topic.probability > max.probability ? topic : max, topics[0]);

      // Calculate topic distribution
      const topicDistribution = topics.reduce((dist, topic) => {
        dist[topic.label] = topic.probability;
        return dist;
      }, {} as Record<string, number>);

      return {
        topics,
        dominantTopic,
        topicDistribution,
        coherenceScore: this.calculateTopicCoherence(topics, text)
      };

    } catch (error) {
      this.logger.error('Topic modeling failed:', error);
      throw error;
    }
  }

  // Helper methods

  private extractTextMetadata(text: string) {
    const sentences = nlp(text).sentences().out('array');
    const words = this.tokenizer.tokenize(text) || [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());

    return {
      textLength: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      complexity: this.calculateComplexity(text),
      readabilityScore: this.calculateReadability(text)
    };
  }

  private createEntity(
    text: string,
    type: EntityType,
    fullText: string,
    confidence = 0.7,
    metadata?: Record<string, any>
  ): NLPEntity {
    const startOffset = fullText.indexOf(text);
    const endOffset = startOffset + text.length;

    return {
      text,
      type,
      confidence,
      startOffset,
      endOffset,
      metadata
    };
  }

  private isValidStockSymbol(symbol: string): boolean {
    // Basic validation for stock symbols
    return symbol.length >= 1 && symbol.length <= 5 && /^[A-Z]+(\.[A-Z]+)?$/.test(symbol);
  }

  private calculatePhraseRelevance(phrase: string, text: string): number {
    const frequency = this.calculatePhraseFrequency(phrase, text);
    const length = phrase.split(' ').length;
    const isFinancial = this.financialTerms.has(phrase.toLowerCase()) ? 1.5 : 1.0;
    
    return Math.min(1, (frequency * 0.3 + Math.min(length / 3, 1) * 0.4 + 0.3) * isFinancial);
  }

  private calculatePhraseFrequency(phrase: string, text: string): number {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex) || [];
    const totalWords = (text.match(/\b\w+\b/g) || []).length;
    
    return matches.length / Math.max(totalWords, 1);
  }

  private categorizePlrase(phrase: string): string {
    const lower = phrase.toLowerCase();
    
    if (this.financialTerms.has(lower)) return 'financial';
    if (/company|corp|inc|ltd/i.test(phrase)) return 'company';
    if (/\d/.test(phrase)) return 'numeric';
    if (/market|trading|investment/i.test(phrase)) return 'market';
    
    return 'general';
  }

  private deduplicateEntities(entities: NLPEntity[]): NLPEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.text.toLowerCase()}_${entity.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicatePhrases(phrases: KeyPhrase[]): KeyPhrase[] {
    const seen = new Set<string>();
    return phrases.filter(phrase => {
      const key = phrase.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private scoreSentence(sentence: string, fullText: string): number {
    // Score based on position, length, and keyword density
    const position = fullText.indexOf(sentence) / fullText.length;
    const length = sentence.split(' ').length;
    const hasFinancialTerms = Array.from(this.financialTerms).some(term =>
      sentence.toLowerCase().includes(term)
    );

    let score = 0.5; // Base score
    
    // Position scoring (first and last sentences get higher scores)
    if (position < 0.2 || position > 0.8) score += 0.2;
    
    // Length scoring (moderate length preferred)
    if (length >= 10 && length <= 30) score += 0.2;
    
    // Financial relevance
    if (hasFinancialTerms) score += 0.3;

    return Math.min(1, score);
  }

  private clusterTermsIntoTopics(terms: string[], sentences: string[]): Topic[] {
    // Simple topic clustering - in production, use more sophisticated algorithms
    const topics: Topic[] = [];
    const financialTerms: string[] = [];
    const companyTerms: string[] = [];
    const marketTerms: string[] = [];
    const generalTerms: string[] = [];

    terms.forEach(term => {
      const lower = term.toLowerCase();
      if (this.financialTerms.has(lower)) {
        financialTerms.push(term);
      } else if (/company|corp|inc|ltd/i.test(term)) {
        companyTerms.push(term);
      } else if (/market|trading|investment/i.test(term)) {
        marketTerms.push(term);
      } else {
        generalTerms.push(term);
      }
    });

    if (financialTerms.length > 0) {
      topics.push({
        id: 'financial',
        label: 'Financial Analysis',
        keywords: financialTerms.slice(0, 5),
        probability: financialTerms.length / terms.length,
        coherence: 0.8
      });
    }

    if (companyTerms.length > 0) {
      topics.push({
        id: 'companies',
        label: 'Companies',
        keywords: companyTerms.slice(0, 5),
        probability: companyTerms.length / terms.length,
        coherence: 0.7
      });
    }

    if (marketTerms.length > 0) {
      topics.push({
        id: 'market',
        label: 'Market Analysis',
        keywords: marketTerms.slice(0, 5),
        probability: marketTerms.length / terms.length,
        coherence: 0.75
      });
    }

    return topics;
  }

  private calculateTopicCoherence(topics: Topic[], text: string): number {
    // Simple coherence calculation based on keyword co-occurrence
    let totalCoherence = 0;
    let count = 0;

    topics.forEach(topic => {
      let topicCoherence = 0;
      const keywords = topic.keywords;
      
      for (let i = 0; i < keywords.length; i++) {
        for (let j = i + 1; j < keywords.length; j++) {
          const cooccurrence = this.calculateCooccurrence(keywords[i], keywords[j], text);
          topicCoherence += cooccurrence;
        }
      }
      
      if (keywords.length > 1) {
        topicCoherence /= (keywords.length * (keywords.length - 1)) / 2;
        totalCoherence += topicCoherence;
        count++;
      }
    });

    return count > 0 ? totalCoherence / count : 0;
  }

  private calculateCooccurrence(term1: string, term2: string, text: string): number {
    const sentences = nlp(text).sentences().out('array');
    let cooccurCount = 0;

    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(term1.toLowerCase()) && 
          sentence.toLowerCase().includes(term2.toLowerCase())) {
        cooccurCount++;
      }
    });

    return cooccurCount / sentences.length;
  }

  private calculateComplexity(text: string): number {
    const words = this.tokenizer.tokenize(text) || [];
    const sentences = nlp(text).sentences().out('array');
    
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / Math.max(words.length, 1);
    
    return Math.min(1, (avgWordsPerSentence / 20 + longWordRatio) / 2);
  }

  private calculateReadability(text: string): number {
    // Simplified Flesch Reading Ease calculation
    const words = this.tokenizer.tokenize(text) || [];
    const sentences = nlp(text).sentences().out('array');
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
    
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = syllables / Math.max(words.length, 1);
    
    const flesch = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, flesch)) / 100; // Normalize to 0-1
  }

  private countSyllables(word: string): number {
    // Simple syllable counting heuristic
    const matches = word.toLowerCase().match(/[aeiouy]+/g);
    let count = matches ? matches.length : 1;
    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  }

  /**
   * Advanced AI-powered sentiment analysis using OpenAI
   */
  private async getAISentimentAnalysis(text: string): Promise<SentimentAnalysisResult | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial sentiment analysis expert. Analyze the sentiment of financial text and respond with a JSON object containing: score (number between -1 and 1), confidence (0 to 1), and reasoning (string).'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of this financial text: ${text.substring(0, 2000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const aiResult = JSON.parse(content);
      return {
        score: aiResult.score,
        magnitude: Math.abs(aiResult.score),
        label: aiResult.score > 0.1 ? 'positive' : aiResult.score < -0.1 ? 'negative' : 'neutral',
        confidence: aiResult.confidence
      };

    } catch (error) {
      this.logger.warn('AI sentiment analysis failed:', error);
      return null;
    }
  }
}