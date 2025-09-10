export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  previousClose: number;
  dayLow: number;
  dayHigh: number;
  timestamp: Date;
}

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
  getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval?: '1d' | '1h' | '5m' | '1m'
  ): Promise<HistoricalDataPoint[]>;
  isMarketOpen(): Promise<boolean>;
  getMarketStatus(): Promise<MarketStatus>;
  validateSymbol(symbol: string): Promise<boolean>;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: Date;
  nextCloseTime?: Date;
  timezone: string;
  marketHours: {
    regular: {
      start: string;
      end: string;
    };
    extended?: {
      premarket?: {
        start: string;
        end: string;
      };
      afterhours?: {
        start: string;
        end: string;
      };
    };
  };
}

export interface MarketDataCache {
  quote?: MarketQuote;
  historicalData?: HistoricalDataPoint[];
  lastUpdated: Date;
  ttl: number;
}

export enum MarketDataProvider {
  ALPHA_VANTAGE = 'alpha_vantage',
  YAHOO_FINANCE = 'yahoo_finance',
  MOCK = 'mock'
}

export interface MarketDataConfig {
  providers: {
    primary: MarketDataProvider;
    fallback: MarketDataProvider[];
  };
  alphaVantage?: {
    apiKey: string;
    baseUrl: string;
    rateLimit: number;
  };
  yahooFinance?: {
    baseUrl: string;
    rateLimit: number;
  };
  cache: {
    ttl: number; // seconds
    maxSize: number;
  };
  marketHours: {
    timezone: string;
    regular: {
      start: string; // HH:mm format
      end: string;
    };
    holidays: Date[];
  };
}