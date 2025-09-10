import { registerAs } from '@nestjs/config';

export const publishingConfig = registerAs('publishing', () => ({
  platforms: {
    linkedin: {
      enabled: process.env.LINKEDIN_ENABLED === 'true',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI,
      characterLimit: 3000,
    },
    twitter: {
      enabled: process.env.TWITTER_ENABLED === 'true',
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      characterLimit: 280,
    },
    facebook: {
      enabled: process.env.FACEBOOK_ENABLED === 'true',
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      characterLimit: 63206,
    },
    instagram: {
      enabled: process.env.INSTAGRAM_ENABLED === 'true',
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      characterLimit: 2200,
    },
    youtube: {
      enabled: process.env.YOUTUBE_ENABLED === 'true',
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    },
    tiktok: {
      enabled: process.env.TIKTOK_ENABLED === 'true',
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
    },
  },
  scheduling: {
    defaultTimezone: process.env.DEFAULT_TIMEZONE || 'America/New_York',
    maxScheduleAhead: parseInt(process.env.MAX_SCHEDULE_AHEAD, 10) || 30, // days
    retryAttempts: parseInt(process.env.PUBLISHING_RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.PUBLISHING_RETRY_DELAY, 10) || 60000, // 1 minute
  },
  compliance: {
    enableValidation: process.env.COMPLIANCE_VALIDATION === 'true',
    strictMode: process.env.COMPLIANCE_STRICT_MODE === 'true',
    autoDisclaimers: process.env.AUTO_DISCLAIMERS === 'true',
  },
}));