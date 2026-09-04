import React from 'react';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
  Home,
  MapPin,
  CalendarDays,
  LayoutDashboard,
  UserRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function FloatingDockDemo() {
  const links = [
    {
      title: 'Home',
      icon: <Home className="h-full w-full" />,
      href: '/',
    },
    {
      title: 'Parking',
      icon: <MapPin className="h-full w-full" />,
      href: '/parking',
    },
    {
      title: 'Bookings',
      icon: <CalendarDays className="h-full w-full" />,
      href: '/bookings',
    },
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-full w-full" />,
      href: '/history',
    },
    {
      title: 'Devices',
      icon: <Zap className="h-full w-full" />,
      href: '/admin/devices',
    },
    {
      title: 'Profile',
      icon: <UserRound className="h-full w-full" />,
      href: '/profile',
    },
    {
      title: 'Admin',
      icon: <ShieldCheck className="h-full w-full" />,
      href: '/admin/dashboard',
    },
  ];

  return (
    <div className="flex h-[35rem] w-full items-center justify-center">
      <FloatingDock items={links} />
    </div>
  );
}
