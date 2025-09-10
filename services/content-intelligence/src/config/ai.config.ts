import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) || 2000,
  },
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION || 'us-central1',
    model: process.env.GOOGLE_MODEL || 'gemini-pro',
  },
  defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'openai',
  qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD) || 8.0,
  complianceThreshold: parseFloat(process.env.COMPLIANCE_THRESHOLD) || 9.0,
}));