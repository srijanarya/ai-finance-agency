'use client';

import { useEffect, useState } from 'react';

const POPULAR_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: Date;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
}

function MarketDataCard({ symbol, loading }: { symbol: string; loading: boolean }) {
  // Mock data for demo
  const mockData: MarketData = {
    symbol,
    price: 150 + Math.random() * 100,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 1000000),
    high: 160 + Math.random() * 100,
    low: 140 + Math.random() * 100,
    timestamp: new Date(),
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{mockData.symbol}</h3>
      
      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(mockData.price)}
          </span>
          <span className={`text-sm font-medium ${getChangeColor(mockData.change)}`}>
            {mockData.change >= 0 ? '+' : ''}{formatCurrency(mockData.change)}
          </span>
        </div>
        
        <div className={`text-sm font-medium ${getChangeColor(mockData.changePercent)}`}>
          {formatPercent(mockData.changePercent)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="block">High</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(mockData.high)}
            </span>
          </div>
          <div>
            <span className="block">Low</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(mockData.low)}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span className="block">Volume</span>
          <span className="font-medium text-gray-900">
            {mockData.volume.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">TREUM</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">AI Finance Platform</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3">
                Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <a href="/dashboard" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700">
                🏠 Dashboard
              </a>
              <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                💼 Portfolio
              </a>
              <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                📊 Market Data
              </a>
              <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                📈 Reports
              </a>
              <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                🔔 Alerts
              </a>
              <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                ⚙️ Settings
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your portfolio overview.</p>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">$125,000</p>
                  </div>
                  <div className="text-blue-600">💰</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">+$8,500</p>
                    <p className="text-sm font-medium text-green-600">+7.25%</p>
                  </div>
                  <div className="text-green-600">📈</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Gainer</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">TSLA</p>
                    <p className="text-sm font-medium text-green-600">+12.5%</p>
                  </div>
                  <div className="text-green-600">🚀</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Most Active</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">AAPL</p>
                    <p className="text-sm font-medium text-purple-600">2.1M vol</p>
                  </div>
                  <div className="text-purple-600">⚡</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Chart will render here with real market data</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">S&P 500</span>
                    <span className="font-medium text-green-600">+1.25%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">NASDAQ</span>
                    <span className="font-medium text-green-600">+2.10%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">DOW</span>
                    <span className="font-medium text-red-600">-0.45%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">Connected to Market Data Service</p>
                    <p className="text-xs text-green-500">● Live WebSocket Connection Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Stocks */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Stocks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {POPULAR_SYMBOLS.map((symbol) => (
                  <MarketDataCard
                    key={symbol}
                    symbol={symbol}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}