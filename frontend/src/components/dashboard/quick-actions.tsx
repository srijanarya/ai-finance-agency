'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  PlusCircle, 
  Search, 
  BookOpen, 
  Bell,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  const quickActions = [
    {
      title: 'Place Order',
      description: 'Buy or sell securities',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/trading',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Add to Watchlist',
      description: 'Track new symbols',
      icon: <PlusCircle className="h-5 w-5" />,
      href: '/market?action=add-watchlist',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Market Research',
      description: 'Analyze market data',
      icon: <Search className="h-5 w-5" />,
      href: '/market',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Educational Content',
      description: 'Learn trading strategies',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/education',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Trading Signals',
      description: 'AI-powered insights',
      icon: <Zap className="h-5 w-5" />,
      href: '/signals',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      title: 'Risk Analysis',
      description: 'Portfolio risk assessment',
      icon: <Target className="h-5 w-5" />,
      href: '/risk',
      color: 'bg-red-500 hover:bg-red-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 text-left"
              >
                <div className={`p-2 rounded-md text-white mr-3 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Market Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium text-sm">Market Summary</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">S&P 500</span>
              <span className="text-green-600">+0.45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NASDAQ</span>
              <span className="text-green-600">+0.62%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIX</span>
              <span className="text-red-600">-2.1%</span>
            </div>
          </div>
        </div>

        {/* News Headlines */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4" />
            <span className="font-medium text-sm">Latest News</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <div className="font-medium">Fed Signals Rate Cut</div>
              <div className="text-muted-foreground text-xs">2 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Tech Earnings Beat</div>
              <div className="text-muted-foreground text-xs">4 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Oil Prices Surge</div>
              <div className="text-muted-foreground text-xs">6 hours ago</div>
            </div>
          </div>
          <Link href="/news">
            <Button variant="link" className="p-0 h-auto text-xs mt-2">
              View all news →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}