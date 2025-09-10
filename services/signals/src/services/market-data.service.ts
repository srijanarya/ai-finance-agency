import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as WebSocket from 'ws';
import { MarketData, MarketNews, EconomicIndicator } from '../entities/market-data.entity';
import { TechnicalAnalysisService } from './technical-analysis.service';

interface PriceData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface NewsItem {
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  symbol?: string;
  sentimentScore?: number;
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private wsConnections: Map<string, WebSocket> = new Map();
  private subscribedSymbols: Set<string> = new Set();

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    @InjectRepository(MarketNews)
    private marketNewsRepository: Repository<MarketNews>,
    @InjectRepository(EconomicIndicator)
    private economicIndicatorRepository: Repository<EconomicIndicator>,
    private configService: ConfigService,
    private technicalAnalysisService: TechnicalAnalysisService,
  ) {
    this.initializeWebSocketConnections();
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (this.subscribedSymbols.has(symbol)) {
      return;
    }

    this.subscribedSymbols.add(symbol);
    await this.setupRealtimeData(symbol);
    this.logger.log(`Subscribed to real-time data for ${symbol}`);
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    this.subscribedSymbols.delete(symbol);
    const ws = this.wsConnections.get(symbol);
    if (ws) {
      ws.close();
      this.wsConnections.delete(symbol);
    }
    this.logger.log(`Unsubscribed from ${symbol}`);
  }

  private async initializeWebSocketConnections(): Promise<void> {
    // Initialize WebSocket connections for major data providers
    await this.setupFinnhubWebSocket();
    await this.setupPolygonWebSocket();
  }

  private async setupFinnhubWebSocket(): Promise<void> {
    const apiKey = this.configService.get('marketData.finnhubApiKey');
    if (!apiKey) return;

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
    
    ws.on('open', () => {
      this.logger.log('Finnhub WebSocket connected');
      // Subscribe to major indices and popular stocks
      ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].forEach(symbol => {
        ws.send(JSON.stringify({'type': 'subscribe', 'symbol': symbol}));
      });
    });

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'trade') {
          await this.processRealtimeTrade(message);
        }
      } catch (error) {
        this.logger.error('Error processing Finnhub WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      this.logger.error('Finnhub WebSocket error:', error);
    });

    this.wsConnections.set('finnhub', ws);
  }

  private async setupPolygonWebSocket(): Promise<void> {
    const apiKey = this.configService.get('marketData.polygonApiKey');
    if (!apiKey) return;

    const ws = new WebSocket(`wss://socket.polygon.io/stocks`);
    
    ws.on('open', () => {
      this.logger.log('Polygon WebSocket connected');
      ws.send(JSON.stringify({"action": "auth", "params": apiKey}));
    });

    ws.on('message', async (data: string) => {
      try {
        const messages = JSON.parse(data);
        for (const message of messages) {
          if (message.ev === 'T') { // Trade event
            await this.processPolygonTrade(message);
          }
        }
      } catch (error) {
        this.logger.error('Error processing Polygon WebSocket message:', error);
      }
    });

    this.wsConnections.set('polygon', ws);
  }

  private async setupRealtimeData(symbol: string): Promise<void> {
    const finnhubWs = this.wsConnections.get('finnhub');
    if (finnhubWs && finnhubWs.readyState === WebSocket.OPEN) {
      finnhubWs.send(JSON.stringify({'type': 'subscribe', 'symbol': symbol}));
    }

    const polygonWs = this.wsConnections.get('polygon');
    if (polygonWs && polygonWs.readyState === WebSocket.OPEN) {
      polygonWs.send(JSON.stringify({"action": "subscribe", "params": `T.${symbol}`}));
    }
  }

  private async processRealtimeTrade(trade: any): Promise<void> {
    // Process real-time trade data and create 1-minute candles
    const symbol = trade.s;
    const price = trade.p;
    const volume = trade.v;
    const timestamp = new Date(trade.t);

    // Aggregate into 1-minute candles
    await this.aggregateTradeData({
      symbol,
      price,
      volume,
      timestamp,
      open: price,
      high: price,
      low: price,
      close: price,
    });
  }

  private async processPolygonTrade(trade: any): Promise<void> {
    const symbol = trade.sym;
    const price = trade.p;
    const volume = trade.s;
    const timestamp = new Date(trade.t);

    await this.aggregateTradeData({
      symbol,
      price,
      volume,
      timestamp,
      open: price,
      high: price,
      low: price,
      close: price,
    });
  }

  private async aggregateTradeData(priceData: PriceData): Promise<void> {
    const { symbol, timestamp } = priceData;
    
    // Round to nearest minute
    const minuteTimestamp = new Date(timestamp);
    minuteTimestamp.setSeconds(0, 0);

    // Check if we already have data for this minute
    let marketData = await this.marketDataRepository.findOne({
      where: {
        symbol,
        timestamp: minuteTimestamp,
        timeFrame: '1min',
      },
    });

    if (!marketData) {
      marketData = new MarketData();
      marketData.symbol = symbol;
      marketData.timestamp = minuteTimestamp;
      marketData.timeFrame = '1min';
      marketData.open = priceData.price;
      marketData.high = priceData.price;
      marketData.low = priceData.price;
      marketData.close = priceData.price;
      marketData.volume = priceData.volume;
    } else {
      // Update OHLCV data
      marketData.high = Math.max(marketData.high, priceData.price);
      marketData.low = Math.min(marketData.low, priceData.price);
      marketData.close = priceData.price;
      marketData.volume += priceData.volume;
    }

    await this.marketDataRepository.save(marketData);
  }

  @Cron('0 */5 * * * *') // Every 5 minutes
  async fetchHistoricalData(): Promise<void> {
    this.logger.log('Fetching historical market data...');
    
    const symbols = Array.from(this.subscribedSymbols);
    for (const symbol of symbols) {
      try {
        await this.fetchSymbolHistoricalData(symbol);
      } catch (error) {
        this.logger.error(`Error fetching historical data for ${symbol}:`, error);
      }
    }
  }

  private async fetchSymbolHistoricalData(symbol: string): Promise<void> {
    const alphaVantageKey = this.configService.get('marketData.alphaVantageApiKey');
    if (!alphaVantageKey) return;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${alphaVantageKey}`
      );

      const timeSeries = response.data['Time Series (5min)'];
      if (!timeSeries) return;

      for (const [timestamp, data] of Object.entries(timeSeries)) {
        const marketData = new MarketData();
        marketData.symbol = symbol;
        marketData.timestamp = new Date(timestamp);
        marketData.timeFrame = '5min';
        marketData.open = parseFloat(data['1. open']);
        marketData.high = parseFloat(data['2. high']);
        marketData.low = parseFloat(data['3. low']);
        marketData.close = parseFloat(data['4. close']);
        marketData.volume = parseInt(data['5. volume']);

        // Calculate technical indicators
        marketData.technicalIndicators = await this.technicalAnalysisService
          .calculateIndicators(symbol, marketData.timestamp, '5min');

        await this.marketDataRepository.save(marketData);
      }
    } catch (error) {
      this.logger.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
    }
  }

  @Cron('0 0 */6 * * *') // Every 6 hours
  async fetchMarketNews(): Promise<void> {
    this.logger.log('Fetching market news...');
    await this.fetchNewsFromSources();
  }

  private async fetchNewsFromSources(): Promise<void> {
    // Fetch from multiple news sources
    await Promise.all([
      this.fetchAlphaVantageNews(),
      this.fetchFinnhubNews(),
      this.fetchPolygonNews(),
    ]);
  }

  private async fetchAlphaVantageNews(): Promise<void> {
    const apiKey = this.configService.get('marketData.alphaVantageApiKey');
    if (!apiKey) return;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${apiKey}&limit=50`
      );

      const newsItems = response.data.feed || [];
      for (const item of newsItems) {
        await this.saveNewsItem({
          title: item.title,
          content: item.summary,
          source: 'Alpha Vantage',
          url: item.url,
          publishedAt: new Date(item.time_published),
          sentimentScore: parseFloat(item.overall_sentiment_score) || null,
        });
      }
    } catch (error) {
      this.logger.error('Error fetching Alpha Vantage news:', error);
    }
  }

  private async fetchFinnhubNews(): Promise<void> {
    const apiKey = this.configService.get('marketData.finnhubApiKey');
    if (!apiKey) return;

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
      );

      for (const item of response.data) {
        await this.saveNewsItem({
          title: item.headline,
          content: item.summary,
          source: 'Finnhub',
          url: item.url,
          publishedAt: new Date(item.datetime * 1000),
        });
      }
    } catch (error) {
      this.logger.error('Error fetching Finnhub news:', error);
    }
  }

  private async fetchPolygonNews(): Promise<void> {
    const apiKey = this.configService.get('marketData.polygonApiKey');
    if (!apiKey) return;

    try {
      const response = await axios.get(
        `https://api.polygon.io/v2/reference/news?apikey=${apiKey}&limit=50`
      );

      for (const item of response.data.results || []) {
        await this.saveNewsItem({
          title: item.title,
          content: item.description,
          source: 'Polygon',
          url: item.article_url,
          publishedAt: new Date(item.published_utc),
        });
      }
    } catch (error) {
      this.logger.error('Error fetching Polygon news:', error);
    }
  }

  private async saveNewsItem(newsItem: NewsItem): Promise<void> {
    // Check if news item already exists
    const existingNews = await this.marketNewsRepository.findOne({
      where: {
        title: newsItem.title,
        source: newsItem.source,
      },
    });

    if (existingNews) return;

    const marketNews = new MarketNews();
    marketNews.title = newsItem.title;
    marketNews.content = newsItem.content;
    marketNews.source = newsItem.source;
    marketNews.url = newsItem.url;
    marketNews.publishedAt = newsItem.publishedAt;
    marketNews.sentimentScore = newsItem.sentimentScore;

    await this.marketNewsRepository.save(marketNews);
  }

  @Cron('0 0 9 * * *') // Daily at 9 AM
  async fetchEconomicIndicators(): Promise<void> {
    this.logger.log('Fetching economic indicators...');
    await this.fetchEconomicData();
  }

  private async fetchEconomicData(): Promise<void> {
    const apiKey = this.configService.get('marketData.alphaVantageApiKey');
    if (!apiKey) return;

    const indicators = ['REAL_GDP', 'CPI', 'INFLATION', 'RETAIL_SALES', 'DURABLES', 'UNEMPLOYMENT'];
    
    for (const indicator of indicators) {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=${indicator}&apikey=${apiKey}`
        );

        const data = response.data.data;
        if (!data || !data.length) continue;

        const latest = data[0];
        const economicIndicator = new EconomicIndicator();
        economicIndicator.indicator = indicator;
        economicIndicator.value = parseFloat(latest.value);
        economicIndicator.releaseDate = new Date(latest.date);
        economicIndicator.country = 'US';
        economicIndicator.frequency = 'quarterly';
        economicIndicator.unit = '%';

        await this.economicIndicatorRepository.save(economicIndicator);
      } catch (error) {
        this.logger.error(`Error fetching ${indicator}:`, error);
      }
    }
  }

  async getLatestMarketData(symbol: string, timeFrame: string = '1min', limit: number = 100): Promise<MarketData[]> {
    return this.marketDataRepository.find({
      where: { symbol, timeFrame },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    timeFrame: string = '1d'
  ): Promise<MarketData[]> {
    return this.marketDataRepository.find({
      where: {
        symbol,
        timeFrame,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: { timestamp: 'ASC' },
    });
  }

  async getLatestNews(symbol?: string, limit: number = 20): Promise<MarketNews[]> {
    const where = symbol ? { symbol } : {};
    
    return this.marketNewsRepository.find({
      where,
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }
}