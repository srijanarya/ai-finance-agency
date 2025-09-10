'use client';

import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

interface RecentSignalsProps {
  signals?: Signal[];
}

export function RecentSignals({ signals = [] }: RecentSignalsProps) {
  // Mock signals if none provided
  const mockSignals: Signal[] = [
    {
      id: '1',
      symbol: 'AAPL',
      type: 'BUY',
      confidence: 85,
      price: 175.50,
      targetPrice: 185.00,
      stopLoss: 170.00,
      reasoning: 'Strong technical indicators and upcoming product launch',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
      status: 'ACTIVE',
    },
    {
      id: '2',
      symbol: 'TSLA',
      type: 'SELL',
      confidence: 78,
      price: 245.80,
      targetPrice: 235.00,
      stopLoss: 250.00,
      reasoning: 'Overbought conditions and regulatory concerns',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
      status: 'ACTIVE',
    },
    {
      id: '3',
      symbol: 'GOOGL',
      type: 'BUY',
      confidence: 92,
      price: 142.30,
      targetPrice: 150.00,
      stopLoss: 138.00,
      reasoning: 'AI developments and strong cloud performance',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      status: 'EXECUTED',
    },
  ];

  const displaySignals = signals.length > 0 ? signals : mockSignals;

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'SELL':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const signalTime = new Date(dateString);
    const diffMs = now.getTime() - signalTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Trading Signals</CardTitle>
            <CardDescription>
              Latest signals from our AI analysis
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displaySignals.map((signal) => (
            <div
              key={signal.id}
              className={cn(
                "p-4 border rounded-lg transition-colors hover:bg-muted/50",
                getSignalColor(signal.type)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getSignalIcon(signal.type)}
                  <div>
                    <div className="font-semibold">{signal.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {signal.type} at {formatCurrency(signal.price)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-semibold",
                    getConfidenceColor(signal.confidence)
                  )}>
                    {signal.confidence}% confidence
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(signal.createdAt)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                {signal.reasoning}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-4">
                  {signal.targetPrice && (
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium">{formatCurrency(signal.targetPrice)}</span>
                    </div>
                  )}
                  {signal.stopLoss && (
                    <div>
                      <span className="text-muted-foreground">Stop Loss: </span>
                      <span className="font-medium">{formatCurrency(signal.stopLoss)}</span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  signal.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : signal.status === 'EXECUTED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                )}>
                  {signal.status}
                </div>
              </div>
            </div>
          ))}

          {displaySignals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No trading signals available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}