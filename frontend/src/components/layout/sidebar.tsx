'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  BookOpen,
  Settings,
  CreditCard,
  Shield,
  Bell,
  User,
  ChevronDown,
  Activity,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Main dashboard overview'
      },
      {
        name: 'Portfolio',
        href: '/portfolio',
        icon: PieChart,
        description: 'Portfolio overview and analytics'
      }
    ]
  },
  {
    title: 'Trading',
    items: [
      {
        name: 'Trading Desk',
        href: '/trading',
        icon: TrendingUp,
        description: 'Execute trades and manage orders'
      },
      {
        name: 'Market Data',
        href: '/market',
        icon: BarChart3,
        description: 'Live market data and charts'
      },
      {
        name: 'Signals',
        href: '/signals',
        icon: Activity,
        description: 'AI-generated trading signals'
      },
      {
        name: 'Risk Management',
        href: '/risk',
        icon: Shield,
        description: 'Risk assessment and monitoring'
      }
    ]
  },
  {
    title: 'Learning',
    items: [
      {
        name: 'Education',
        href: '/education',
        icon: BookOpen,
        description: 'Courses and learning materials'
      }
    ]
  },
  {
    title: 'Account',
    items: [
      {
        name: 'Billing',
        href: '/billing',
        icon: CreditCard,
        description: 'Subscription and payments'
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: User,
        description: 'Account settings and profile'
      },
      {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        description: 'Notification preferences'
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Application settings'
      }
    ]
  }
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Trading']);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform bg-background border-r transition-transform duration-300 ease-in-out md:relative md:top-0 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationItems.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedSections.includes(section.title) ? "rotate-180" : ""
                    )}
                  />
                </button>
                
                {expandedSections.includes(section.title) && (
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className={cn(
                              "text-xs",
                              isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Pro Plan</div>
                <div className="text-xs text-muted-foreground">Upgrade for more features</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}