import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

interface MarketStatus {
  isOpen: boolean;
  nextOpen?: string;
  nextClose?: string;
  timezone: string;
}

interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  createdAt: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXECUTED' | 'EXPIRED' | 'CANCELLED';
}

interface MarketState {
  quotes: Record<string, Quote>;
  watchlist: string[];
  marketStatus: MarketStatus | null;
  signals: Signal[];
  isConnected: boolean;
  lastUpdate: number | null;
  
  // Actions
  updateQuote: (quote: Quote) => void;
  updateQuotes: (quotes: Quote[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setMarketStatus: (status: MarketStatus) => void;
  addSignal: (signal: Signal) => void;
  updateSignal: (signalId: string, updates: Partial<Signal>) => void;
  removeSignal: (signalId: string) => void;
  setConnected: (connected: boolean) => void;
  clearMarketData: () => void;
}

export const useMarketStore = create<MarketState>()(
  subscribeWithSelector((set, get) => ({
    quotes: {},
    watchlist: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'], // Default watchlist
    marketStatus: null,
    signals: [],
    isConnected: false,
    lastUpdate: null,

    updateQuote: (quote) => {
      set((state) => ({
        quotes: {
          ...state.quotes,
          [quote.symbol]: quote,
        },
        lastUpdate: Date.now(),
      }));
    },

    updateQuotes: (quotes) => {
      const quotesMap = quotes.reduce((acc, quote) => {
        acc[quote.symbol] = quote;
        return acc;
      }, {} as Record<string, Quote>);
      
      set((state) => ({
        quotes: {
          ...state.quotes,
          ...quotesMap,
        },
        lastUpdate: Date.now(),
      }));
    },

    addToWatchlist: (symbol) => {
      set((state) => ({
        watchlist: state.watchlist.includes(symbol)
          ? state.watchlist
          : [...state.watchlist, symbol],
      }));
    },

    removeFromWatchlist: (symbol) => {
      set((state) => ({
        watchlist: state.watchlist.filter((s) => s !== symbol),
      }));
    },

    setMarketStatus: (status) => {
      set({ marketStatus: status });
    },

    addSignal: (signal) => {
      set((state) => ({
        signals: [signal, ...state.signals].slice(0, 50), // Keep only latest 50 signals
      }));
    },

    updateSignal: (signalId, updates) => {
      set((state) => ({
        signals: state.signals.map((signal) =>
          signal.id === signalId ? { ...signal, ...updates } : signal
        ),
      }));
    },

    removeSignal: (signalId) => {
      set((state) => ({
        signals: state.signals.filter((signal) => signal.id !== signalId),
      }));
    },

    setConnected: (connected) => {
      set({ isConnected: connected });
    },

    clearMarketData: () => {
      set({
        quotes: {},
        signals: [],
        lastUpdate: null,
      });
    },
  }))
);