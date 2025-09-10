'use client';

import { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={toggleSidebar}
        isMobileMenuOpen={isSidebarOpen}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />
        
        <main className={cn(
          "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300",
          "md:ml-0" // Always show content on desktop since sidebar is relative positioned
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}