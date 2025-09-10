import { create } from 'zustand';

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface Order {
  id: string;
  symbol: string;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  value: number;
  fee: number;
  executedAt: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalCash: number;
  totalEquity: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  buyingPower: number;
}

interface RiskMetrics {
  var95: number; // Value at Risk (95%)
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  diversificationScore: number;
  concentrationRisk: number;
}

interface PortfolioState {
  summary: PortfolioSummary | null;
  positions: Position[];
  orders: Order[];
  recentTrades: Trade[];
  riskMetrics: RiskMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;
  
  // Actions
  setSummary: (summary: PortfolioSummary) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (symbol: string, updates: Partial<Position>) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setRecentTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  setRiskMetrics: (metrics: RiskMetrics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  summary: null,
  positions: [],
  orders: [],
  recentTrades: [],
  riskMetrics: null,
  isLoading: false,
  error: null,
  lastUpdate: null,

  setSummary: (summary) => {
    set({ summary, lastUpdate: Date.now() });
  },

  setPositions: (positions) => {
    set({ positions, lastUpdate: Date.now() });
  },

  updatePosition: (symbol, updates) => {
    set((state) => ({
      positions: state.positions.map((position) =>
        position.symbol === symbol ? { ...position, ...updates } : position
      ),
      lastUpdate: Date.now(),
    }));
  },

  setOrders: (orders) => {
    set({ orders, lastUpdate: Date.now() });
  },

  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
      lastUpdate: Date.now(),
    }));
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
      lastUpdate: Date.now(),
    }));
  },

  removeOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
      lastUpdate: Date.now(),
    }));
  },

  setRecentTrades: (trades) => {
    set({ recentTrades: trades, lastUpdate: Date.now() });
  },

  addTrade: (trade) => {
    set((state) => ({
      recentTrades: [trade, ...state.recentTrades].slice(0, 100), // Keep only latest 100 trades
      lastUpdate: Date.now(),
    }));
  },

  setRiskMetrics: (metrics) => {
    set({ riskMetrics: metrics, lastUpdate: Date.now() });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearPortfolio: () => {
    set({
      summary: null,
      positions: [],
      orders: [],
      recentTrades: [],
      riskMetrics: null,
      error: null,
      lastUpdate: null,
    });
  },
}));