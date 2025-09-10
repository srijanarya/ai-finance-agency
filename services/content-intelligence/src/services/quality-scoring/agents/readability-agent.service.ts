import { Injectable, Logger } from '@nestjs/common';
import {
  QualityAgent,
  AssessmentSpecialty,
  AgentAssessment,
  AssessmentContext,
  AgentCapabilities,
  QualityIssue,
  IssueType,
  IssueSeverity,
  ContentType,
} from '../../../interfaces/quality-scoring/quality-scoring.interface';

@Injectable()
export class ReadabilityAgentService implements QualityAgent {
  readonly id = 'readability-agent';
  readonly name = 'Readability Assessment Agent';
  readonly specialty = AssessmentSpecialty.READABILITY;
  
  private readonly logger = new Logger(ReadabilityAgentService.name);

  async assess(content: string, context: AssessmentContext): Promise<AgentAssessment> {
    const startTime = Date.now();

    try {
      this.logger.log(`Assessing readability for ${context.contentType} content`);

      const analysis = this.analyzeReadability(content, context);
      const issues = this.identifyReadabilityIssues(content, analysis, context);
      const suggestions = this.generateSuggestions(analysis, issues, context);
      const score = this.calculateReadabilityScore(analysis, context);

      return {
        agentId: this.id,
        agentName: this.name,
        specialty: this.specialty,
        score,
        confidence: this.calculateConfidence(analysis, content.length),
        reasoning: this.generateReasoning(analysis, score, context),
        issues,
        suggestions,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Readability assessment failed: ${error.message}`);
      throw error;
    }
  }

  getCapabilities(): AgentCapabilities {
    return {
      supportedContentTypes: Object.values(ContentType),
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      assessmentAreas: [
        'sentence_complexity',
        'vocabulary_difficulty',
        'text_structure',
        'paragraph_length',
        'flesch_reading_ease',
        'grade_level'
      ],
      processingSpeed: 'fast',
      accuracy: 0.92,
    };
  }

  private analyzeReadability(content: string, context: AssessmentContext): ReadabilityAnalysis {
    // Basic text statistics
    const words = this.getWords(content);
    const sentences = this.getSentences(content);
    const paragraphs = this.getParagraphs(content);
    const syllables = this.countSyllables(content);

    // Calculate metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const avgSentencesPerParagraph = sentences.length / paragraphs.length;

    // Flesch Reading Ease Score
    const fleschScore = this.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
    
    // Grade level (Flesch-Kincaid)
    const gradeLevel = this.calculateGradeLevel(avgWordsPerSentence, avgSyllablesPerWord);

    // Complexity analysis
    const complexWords = this.getComplexWords(words);
    const longSentences = sentences.filter(s => this.getWords(s).length > 20);
    const veryLongSentences = sentences.filter(s => this.getWords(s).length > 30);

    // Structure analysis
    const hasHeadings = this.hasHeadings(content);
    const hasBulletPoints = this.hasBulletPoints(content);
    const hasShortParagraphs = paragraphs.filter(p => this.getWords(p).length <= 50).length / paragraphs.length > 0.7;

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      syllableCount: syllables,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      avgSentencesPerParagraph,
      fleschScore,
      gradeLevel,
      complexWordCount: complexWords.length,
      complexWordRatio: complexWords.length / words.length,
      longSentenceCount: longSentences.length,
      veryLongSentenceCount: veryLongSentences.length,
      hasHeadings,
      hasBulletPoints,
      hasShortParagraphs,
      passiveVoiceCount: this.countPassiveVoice(sentences),
      transitionWordCount: this.countTransitionWords(content),
    };
  }

  private identifyReadabilityIssues(
    content: string,
    analysis: ReadabilityAnalysis,
    context: AssessmentContext
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Grade level too high for audience
    const targetGradeLevel = this.getTargetGradeLevel(context.targetAudience, context.contentType);
    if (analysis.gradeLevel > targetGradeLevel + 2) {
      issues.push({
        type: IssueType.READABILITY,
        severity: IssueSeverity.HIGH,
        description: `Content requires ${analysis.gradeLevel.toFixed(1)} grade level, but target audience expects ${targetGradeLevel} grade level`,
        suggestion: 'Simplify sentence structure and use more common words',
        impact: 8,
      });
    }

    // Too many complex words
    if (analysis.complexWordRatio > 0.15) {
      issues.push({
        type: IssueType.READABILITY,
        severity: IssueSeverity.MEDIUM,
        description: `${(analysis.complexWordRatio * 100).toFixed(1)}% of words are complex (threshold: 15%)`,
        suggestion: 'Replace complex words with simpler alternatives where possible',
        impact: 6,
      });
    }

    // Sentences too long
    if (analysis.avgWordsPerSentence > 25) {
      issues.push({
        type: IssueType.READABILITY,
        severity: IssueSeverity.MEDIUM,
        description: `Average sentence length is ${analysis.avgWordsPerSentence.toFixed(1)} words (recommended: <20)`,
        suggestion: 'Break long sentences into shorter, clearer statements',
        impact: 7,
      });
    }

    // Too many very long sentences
    if (analysis.veryLongSentenceCount > analysis.sentenceCount * 0.1) {
      issues.push({
        type: IssueType.READABILITY,
        severity: IssueSeverity.HIGH,
        description: `${analysis.veryLongSentenceCount} sentences exceed 30 words`,
        suggestion: 'Rewrite very long sentences for better clarity',
        impact: 8,
      });
    }

    // Poor structure
    if (!analysis.hasHeadings && analysis.wordCount > 500) {
      issues.push({
        type: IssueType.STRUCTURE,
        severity: IssueSeverity.MEDIUM,
        description: 'Long content lacks headings for better organization',
        suggestion: 'Add descriptive headings to break up content sections',
        impact: 5,
      });
    }

    // Lack of bullet points for lists
    if (this.hasListContent(content) && !analysis.hasBulletPoints) {
      issues.push({
        type: IssueType.STRUCTURE,
        severity: IssueSeverity.LOW,
        description: 'Content appears to contain lists but lacks bullet point formatting',
        suggestion: 'Format lists with bullet points for better readability',
        impact: 4,
      });
    }

    // Too much passive voice
    const passiveVoiceRatio = analysis.passiveVoiceCount / analysis.sentenceCount;
    if (passiveVoiceRatio > 0.25) {
      issues.push({
        type: IssueType.CLARITY,
        severity: IssueSeverity.MEDIUM,
        description: `${(passiveVoiceRatio * 100).toFixed(1)}% of sentences use passive voice (recommended: <25%)`,
        suggestion: 'Use active voice to make content more direct and engaging',
        impact: 6,
      });
    }

    return issues;
  }

  private generateSuggestions(
    analysis: ReadabilityAnalysis,
    issues: QualityIssue[],
    context: AssessmentContext
  ): string[] {
    const suggestions: string[] = [];

    // Specific suggestions based on analysis
    if (analysis.fleschScore < 50) {
      suggestions.push('Significantly simplify language and sentence structure');
    } else if (analysis.fleschScore < 70) {
      suggestions.push('Moderately simplify language for better accessibility');
    }

    if (analysis.avgWordsPerSentence > 20) {
      suggestions.push('Break long sentences into shorter, more digestible chunks');
    }

    if (analysis.complexWordRatio > 0.12) {
      suggestions.push('Replace technical jargon with simpler, more common terms where possible');
    }

    if (!analysis.hasHeadings && analysis.wordCount > 300) {
      suggestions.push('Add clear headings to organize content and improve scannability');
    }

    if (analysis.avgSentencesPerParagraph > 5) {
      suggestions.push('Break up long paragraphs for better visual appeal and readability');
    }

    // Content-type specific suggestions
    if (context.contentType === ContentType.EDUCATIONAL) {
      suggestions.push('Consider adding examples and analogies to clarify complex concepts');
      suggestions.push('Include summary points at the end of sections');
    }

    if (context.contentType === ContentType.MARKET_ANALYSIS) {
      suggestions.push('Define technical financial terms when first introduced');
      suggestions.push('Use charts or bullet points to present key data clearly');
    }

    // Audience-specific suggestions
    if (context.targetAudience === 'general_public') {
      suggestions.push('Avoid financial jargon or provide clear explanations');
      suggestions.push('Use concrete examples to illustrate abstract concepts');
    }

    return suggestions.filter((suggestion, index, array) => 
      array.indexOf(suggestion) === index // Remove duplicates
    );
  }

  private calculateReadabilityScore(analysis: ReadabilityAnalysis, context: AssessmentContext): number {
    let score = 5; // Base score

    // Flesch Reading Ease contribution (40% weight)
    const fleschWeight = 0.4;
    const targetGradeLevel = this.getTargetGradeLevel(context.targetAudience, context.contentType);
    
    if (analysis.fleschScore >= 70) {
      score += 3 * fleschWeight;
    } else if (analysis.fleschScore >= 50) {
      score += 2 * fleschWeight;
    } else if (analysis.fleschScore >= 30) {
      score += 1 * fleschWeight;
    }

    // Grade level appropriateness (25% weight)
    const gradeWeight = 0.25;
    const gradeDifference = Math.abs(analysis.gradeLevel - targetGradeLevel);
    if (gradeDifference <= 1) {
      score += 3 * gradeWeight;
    } else if (gradeDifference <= 2) {
      score += 2 * gradeWeight;
    } else if (gradeDifference <= 3) {
      score += 1 * gradeWeight;
    }

    // Sentence structure (20% weight)
    const structureWeight = 0.2;
    if (analysis.avgWordsPerSentence <= 15) {
      score += 3 * structureWeight;
    } else if (analysis.avgWordsPerSentence <= 20) {
      score += 2 * structureWeight;
    } else if (analysis.avgWordsPerSentence <= 25) {
      score += 1 * structureWeight;
    }

    // Content organization (15% weight)
    const organizationWeight = 0.15;
    let organizationScore = 0;
    if (analysis.hasHeadings) organizationScore += 1;
    if (analysis.hasBulletPoints) organizationScore += 1;
    if (analysis.hasShortParagraphs) organizationScore += 1;
    score += (organizationScore / 3) * 3 * organizationWeight;

    return Math.max(1, Math.min(10, score));
  }

  private calculateConfidence(analysis: ReadabilityAnalysis, contentLength: number): number {
    let confidence = 0.8; // Base confidence

    // More confident with longer content
    if (contentLength > 1000) confidence += 0.1;
    if (contentLength < 100) confidence -= 0.2;

    // More confident with more sentences
    if (analysis.sentenceCount > 10) confidence += 0.05;
    if (analysis.sentenceCount < 3) confidence -= 0.15;

    // Less confident with very unusual metrics
    if (analysis.avgWordsPerSentence > 40 || analysis.avgWordsPerSentence < 3) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(1, confidence));
  }

  private generateReasoning(
    analysis: ReadabilityAnalysis,
    score: number,
    context: AssessmentContext
  ): string {
    const gradeLevel = analysis.gradeLevel.toFixed(1);
    const fleschScore = analysis.fleschScore.toFixed(1);
    const avgSentenceLength = analysis.avgWordsPerSentence.toFixed(1);

    let reasoning = `Readability assessment based on: `;
    reasoning += `Flesch score: ${fleschScore}/100, `;
    reasoning += `Grade level: ${gradeLevel}, `;
    reasoning += `Avg sentence length: ${avgSentenceLength} words. `;

    if (score >= 8) {
      reasoning += 'Content is highly readable and well-structured for the target audience.';
    } else if (score >= 6) {
      reasoning += 'Content readability is good but could benefit from minor improvements.';
    } else if (score >= 4) {
      reasoning += 'Content readability needs improvement to better serve the target audience.';
    } else {
      reasoning += 'Content readability is poor and requires significant simplification.';
    }

    return reasoning;
  }

  // Helper methods for text analysis
  private getWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private getSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
  }

  private getParagraphs(text: string): string[] {
    return text.split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0);
  }

  private countSyllables(text: string): number {
    const words = this.getWords(text);
    return words.reduce((total, word) => total + this.countWordSyllables(word), 0);
  }

  private countWordSyllables(word: string): number {
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    
    return Math.max(1, count);
  }

  private calculateFleschScore(avgWordsPerSentence: number, avgSyllablesPerWord: number): number {
    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  }

  private calculateGradeLevel(avgWordsPerSentence: number, avgSyllablesPerWord: number): number {
    return (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
  }

  private getComplexWords(words: string[]): string[] {
    return words.filter(word => 
      word.length > 6 && 
      this.countWordSyllables(word) > 2 &&
      !this.isCommonWord(word)
    );
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'through', 'without', 'between', 'important', 'investment', 'financial',
      'different', 'possible', 'available', 'information', 'understand'
    ]);
    return commonWords.has(word.toLowerCase());
  }

  private hasHeadings(content: string): boolean {
    return /^#{1,6}\s+.+$/m.test(content) || /<h[1-6]>/i.test(content);
  }

  private hasBulletPoints(content: string): boolean {
    return /^\s*[-*•]\s+/m.test(content) || /<[uo]l>/i.test(content);
  }

  private hasListContent(content: string): boolean {
    const listPatterns = [
      /first|second|third|fourth|fifth/i,
      /\d+\.\s+/,
      /next|then|finally|lastly/i,
      /(step|stage|phase)\s+\d+/i
    ];
    return listPatterns.some(pattern => pattern.test(content));
  }

  private countPassiveVoice(sentences: string[]): number {
    const passivePatterns = [
      /\b(was|were|is|are|being|been)\s+\w+ed\b/i,
      /\b(was|were|is|are|being|been)\s+\w+en\b/i,
    ];
    
    return sentences.filter(sentence =>
      passivePatterns.some(pattern => pattern.test(sentence))
    ).length;
  }

  private countTransitionWords(content: string): number {
    const transitionWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'additionally',
      'consequently', 'nevertheless', 'meanwhile', 'subsequently', 'specifically'
    ];
    
    const words = this.getWords(content);
    return words.filter(word => 
      transitionWords.includes(word.toLowerCase())
    ).length;
  }

  private getTargetGradeLevel(audience: string, contentType: ContentType): number {
    const audienceGradeLevels: { [key: string]: number } = {
      'general_public': 8,
      'retail_investors': 10,
      'institutional_investors': 14,
      'financial_advisors': 12,
      'industry_professionals': 14,
      'regulators': 16,
      'media': 10,
      'analysts': 14,
    };

    const contentTypeAdjustments: { [key in ContentType]: number } = {
      [ContentType.EDUCATIONAL]: -2,
      [ContentType.SOCIAL_MEDIA]: -3,
      [ContentType.NEWSLETTER]: -1,
      [ContentType.RESEARCH_REPORT]: +2,
      [ContentType.REGULATORY_FILING]: +3,
      [ContentType.MARKET_ANALYSIS]: +1,
      [ContentType.INVESTMENT_MEMO]: +1,
      [ContentType.BLOG_POST]: -1,
      [ContentType.PRESS_RELEASE]: 0,
      [ContentType.EMAIL_CAMPAIGN]: -1,
    };

    const baseLevel = audienceGradeLevels[audience] || 10;
    const adjustment = contentTypeAdjustments[contentType] || 0;
    
    return Math.max(6, Math.min(18, baseLevel + adjustment));
  }
}

interface ReadabilityAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  avgSentencesPerParagraph: number;
  fleschScore: number;
  gradeLevel: number;
  complexWordCount: number;
  complexWordRatio: number;
  longSentenceCount: number;
  veryLongSentenceCount: number;
  hasHeadings: boolean;
  hasBulletPoints: boolean;
  hasShortParagraphs: boolean;
  passiveVoiceCount: number;
  transitionWordCount: number;
}