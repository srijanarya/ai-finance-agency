'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketStore } from '@/store/market';
import { formatCurrency, formatPercentage } from '@/lib/utils';

const majorIndices = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
];

export function MarketOverview() {
  const { quotes, isConnected, marketStatus } = useMarketStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Market Overview
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
        <CardDescription>
          Major market indices and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Market Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Market Status</span>
            <span className={`text-sm font-semibold ${
              marketStatus?.isOpen ? 'text-green-600' : 'text-red-600'
            }`}>
              {marketStatus?.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          {/* Major Indices */}
          <div className="space-y-3">
            {majorIndices.map((index) => {
              const quote = quotes[index.symbol];
              
              if (!quote) {
                return (
                  <div key={index.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{index.name}</div>
                      <div className="text-sm text-muted-foreground">{index.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    </div>
                  </div>
                );
              }

              const isPositive = quote.change >= 0;

              return (
                <div key={index.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium">{index.name}</div>
                    <div className="text-sm text-muted-foreground">{index.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(quote.price)}</div>
                    <div className={`text-sm flex items-center justify-end gap-1 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(Math.abs(quote.change))} ({formatPercentage(Math.abs(quote.changePercent))})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Market Sentiment Indicator */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Market Sentiment</span>
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: '65%' }}
                />
              </div>
              <span className="text-sm font-medium text-green-600">Bullish</span>
            </div>
          </div>

          {/* Economic Events (Mock) */}
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Today's Events</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">10:00 AM</span>
                <span>Consumer Price Index</span>
                <span className="text-yellow-600">Medium Impact</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">2:00 PM</span>
                <span>Federal Reserve Speech</span>
                <span className="text-red-600">High Impact</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">4:00 PM</span>
                <span>Earnings: AAPL</span>
                <span className="text-red-600">High Impact</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}