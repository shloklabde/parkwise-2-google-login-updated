import React, { useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  MapPin,
  CalendarDays,
  Gauge,
  UserRound,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { FloatingDock, type FloatingDockItem } from '@/components/ui/floating-dock';
import { useApp } from '@/contexts/AppContext';

export function ParkwiseFloatingDock() {
  const [location] = useLocation();
  const { user, unreadCount } = useApp();

  // Hide floating dock on auth screens so it never interferes with login/registration forms
  const isAuthScreen =
    location === '/login' ||
    location === '/register' ||
    location === '/forgot-password' ||
    location === '/admin/login';

  const items = useMemo<FloatingDockItem[]>(() => {
    const list: FloatingDockItem[] = [
      {
        title: 'Home',
        icon: <Home size={20} strokeWidth={2.2} />,
        href: '/',
        isActive: location === '/',
      },
      {
        title: 'Parking',
        icon: <MapPin size={20} strokeWidth={2.2} />,
        href: '/parking',
        isActive: location.startsWith('/parking'),
      },
      {
        title: 'My Bookings',
        icon: <CalendarDays size={20} strokeWidth={2.2} />,
        href: '/bookings',
        isActive: location.startsWith('/bookings'),
      },
      {
        title: 'Dashboard',
        icon: <Gauge size={20} strokeWidth={2.2} />,
        href: user?.role === 'admin' ? '/admin/dashboard' : '/history',
        isActive: location === '/history' || (user?.role === 'admin' && location.startsWith('/admin')),
      },
      {
        title: user ? 'Profile' : 'Sign in',
        icon: <UserRound size={20} strokeWidth={2.2} />,
        href: user ? '/profile' : '/login',
        isActive: location === '/profile',
      },
    ];

    // Notification item if there are unread notifications or user is logged in
    if (user && unreadCount > 0) {
      list.push({
        title: 'Alerts',
        icon: <Bell size={20} strokeWidth={2.2} />,
        href: '/notifications',
        isActive: location === '/notifications',
        badge: unreadCount > 9 ? '9+' : unreadCount,
      });
    }

    // Role-based Admin item: Only shown for admin users
    if (user?.role === 'admin') {
      list.push({
        title: 'Admin Portal',
        icon: <ShieldCheck size={20} strokeWidth={2.2} />,
        href: '/admin/dashboard',
        isActive: location.startsWith('/admin'),
      });
    }

    return list;
  }, [location, user, unreadCount]);

  if (isAuthScreen) {
    return null;
  }

  return (
    <div
      data-testid="floating-dock-wrapper"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex items-center justify-center px-4 md:bottom-7"
    >
      <div className="relative flex w-full max-w-[1240px] items-center justify-end md:justify-center">
        <FloatingDock
          items={items}
          dockId="bottom-nav"
          tooltipSide="top"
          renderLink={(item, children, className) => (
            <Link
              href={item.href}
              className={className}
              data-testid={`dock-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {children}
            </Link>
          )}
        />
      </div>
    </div>
  );
}
