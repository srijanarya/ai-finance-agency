'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tradingApi, marketDataApi, signalsApi, riskApi } from '@/lib/api';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useMarketStore } from '@/store/market';
import { useSymbolQuotes } from '@/lib/websocket';
import { PortfolioChart } from './portfolio-chart';
import { MarketOverview } from './market-overview';
import { RecentSignals } from './recent-signals';
import { QuickActions } from './quick-actions';

export function DashboardOverview() {
  const { watchlist, quotes } = useMarketStore();
  
  // Subscribe to watchlist quotes
  useSymbolQuotes(watchlist);

  // Portfolio data query
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => tradingApi.getPortfolio(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Recent trades query
  const { data: recentTrades } = useQuery({
    queryKey: ['recent-trades'],
    queryFn: () => tradingApi.getTradeHistory(5),
    refetchInterval: 60000,
  });

  // Market status query
  const { data: marketStatus } = useQuery({
    queryKey: ['market-status'],
    queryFn: () => marketDataApi.getMarketStatus(),
    refetchInterval: 60000,
  });

  // Recent signals query
  const { data: signals } = useQuery({
    queryKey: ['signals'],
    queryFn: () => signalsApi.getSignals(5),
    refetchInterval: 30000,
  });

  // Risk metrics query
  const { data: riskMetrics } = useQuery({
    queryKey: ['risk-metrics'],
    queryFn: () => riskApi.getRiskMetrics(),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Calculate portfolio performance
  const portfolioValue = portfolio?.totalValue || 0;
  const portfolioPnL = portfolio?.totalPnL || 0;
  const portfolioPnLPercent = portfolio?.totalPnLPercent || 0;
  const dayPnL = portfolio?.dayPnL || 0;
  const dayPnLPercent = portfolio?.dayPnLPercent || 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioValue)}
            </div>
            <div className={`text-xs flex items-center ${
              portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolioPnL >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatCurrency(Math.abs(portfolioPnL))} ({formatPercentage(Math.abs(portfolioPnLPercent))})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              dayPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(dayPnL)}
            </div>
            <div className={`text-xs flex items-center ${
              dayPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {dayPnL >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(Math.abs(dayPnLPercent))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio?.positions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {portfolio?.sectors?.length || 0} sectors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (riskMetrics?.riskScore || 0) > 70 ? 'text-red-600' :
              (riskMetrics?.riskScore || 0) > 40 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {riskMetrics?.riskScore || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {riskMetrics?.riskLevel || 'Calculating...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Market Overview */}
        <MarketOverview />

        {/* Recent Signals */}
        <RecentSignals signals={signals} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trading Activity</CardTitle>
          <CardDescription>
            Your latest trades and orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades && recentTrades.length > 0 ? (
            <div className="space-y-4">
              {recentTrades.map((trade: any) => (
                <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.side} {trade.quantity} shares
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(trade.value)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.executedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent trading activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}