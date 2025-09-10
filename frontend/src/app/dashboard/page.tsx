'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuthStore } from '@/store/auth';
import { useWebSocket } from '@/lib/websocket';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { connect } = useWebSocket();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Connect to WebSocket for real-time data
    connect();
  }, [isAuthenticated, router, connect]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your portfolio and market activity
            </p>
          </div>
        </div>

        <DashboardOverview />
      </div>
    </DashboardLayout>
  );
}