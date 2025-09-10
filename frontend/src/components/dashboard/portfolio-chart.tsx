'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tradingApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { CHART_CONFIG } from '@/lib/config';

const timeframes = CHART_CONFIG.TIMEFRAMES;

export function PortfolioChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['portfolio-chart', selectedTimeframe],
    queryFn: async () => {
      // This would call a specific API endpoint for portfolio historical data
      // For now, we'll mock some data
      const mockData = generateMockPortfolioData(selectedTimeframe);
      return mockData;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    switch (selectedTimeframe) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1W':
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {new Date(label).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-lg font-semibold">
            {formatCurrency(data.value)}
          </p>
          <p className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? '+' : ''}{formatCurrency(data.change)} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>
              Track your portfolio value over time
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe.value}
                variant={selectedTimeframe === timeframe.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe.value)}
              >
                {timeframe.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxisLabel}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US').replace('$', '$')}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data generator for portfolio chart
function generateMockPortfolioData(timeframe: string) {
  const now = new Date();
  const data = [];
  let intervals = 0;
  let intervalMs = 0;

  switch (timeframe) {
    case '1D':
      intervals = 24 * 4; // Every 15 minutes
      intervalMs = 15 * 60 * 1000;
      break;
    case '1W':
      intervals = 7 * 24; // Every hour
      intervalMs = 60 * 60 * 1000;
      break;
    case '1M':
      intervals = 30; // Daily
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '3M':
      intervals = 90; // Daily
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '6M':
      intervals = 180; // Daily
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '1Y':
      intervals = 365; // Daily
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    default:
      intervals = 365 * 2; // Daily for 2 years
      intervalMs = 24 * 60 * 60 * 1000;
  }

  let baseValue = 100000; // Starting portfolio value
  let previousValue = baseValue;

  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMs)).toISOString();
    
    // Generate some realistic portfolio movement
    const randomChange = (Math.random() - 0.5) * 0.02; // ±1% daily volatility
    const trendFactor = 0.0001; // Slight upward trend
    const value = Math.round(previousValue * (1 + randomChange + trendFactor));
    
    const change = value - baseValue;
    const changePercent = (change / baseValue) * 100;

    data.push({
      timestamp,
      value,
      change,
      changePercent,
    });

    previousValue = value;
  }

  return data;
}