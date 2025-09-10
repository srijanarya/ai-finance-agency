export interface ConfigurationInterface {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  marketData: {
    alphaVantageApiKey: string;
    finnhubApiKey: string;
    polygonApiKey: string;
    iexApiKey: string;
    updateIntervals: {
      realtime: number; // milliseconds
      intraday: number; // minutes
      daily: number; // hours
    };
  };
  signals: {
    confidenceThreshold: number;
    maxSignalsPerHour: number;
    backtestPeriodDays: number;
    mlModelUpdateIntervalHours: number;
  };
  trading: {
    enablePaperTrading: boolean;
    maxPositionSize: number;
    riskManagement: {
      maxDailyLoss: number;
      maxDrawdown: number;
      positionSizing: string; // 'fixed' | 'kelly' | 'volatility'
    };
  };
}

export default (): ConfigurationInterface => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'treum_user',
    password: process.env.DATABASE_PASSWORD || 'securepassword123',
    database: process.env.DATABASE_NAME || 'treum_signals',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  marketData: {
    alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    finnhubApiKey: process.env.FINNHUB_API_KEY || '',
    polygonApiKey: process.env.POLYGON_API_KEY || '',
    iexApiKey: process.env.IEX_API_KEY || '',
    updateIntervals: {
      realtime: parseInt(process.env.REALTIME_UPDATE_MS, 10) || 1000,
      intraday: parseInt(process.env.INTRADAY_UPDATE_MIN, 10) || 5,
      daily: parseInt(process.env.DAILY_UPDATE_HOURS, 10) || 6,
    },
  },
  signals: {
    confidenceThreshold:
      parseFloat(process.env.SIGNAL_CONFIDENCE_THRESHOLD) || 0.65,
    maxSignalsPerHour: parseInt(process.env.MAX_SIGNALS_PER_HOUR, 10) || 5,
    backtestPeriodDays: parseInt(process.env.BACKTEST_PERIOD_DAYS, 10) || 30,
    mlModelUpdateIntervalHours:
      parseInt(process.env.ML_MODEL_UPDATE_HOURS, 10) || 24,
  },
  trading: {
    enablePaperTrading: process.env.ENABLE_PAPER_TRADING === 'true',
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE) || 0.05, // 5% of portfolio
    riskManagement: {
      maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || 0.02, // 2%
      maxDrawdown: parseFloat(process.env.MAX_DRAWDOWN) || 0.1, // 10%
      positionSizing: process.env.POSITION_SIZING_METHOD || 'volatility',
    },
  },
});
