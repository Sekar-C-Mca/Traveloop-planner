'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  House,
  MapTrifold,
  PlusCircle,
  Backpack,
  BookOpen,
  Gear,
  SignOut,
  ShieldCheck,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',       icon: House       },
  { label: 'My Trips',      href: '/trips',            icon: MapTrifold  },
  { label: 'New Trip',      href: '/trips/new',        icon: PlusCircle  },
  { label: 'Explore Cities',href: '/explore',          icon: Compass     },
  { label: 'Packing Lists', href: '/packing',          icon: Backpack    },
  { label: 'Trip Journal',  href: '/journal',          icon: BookOpen    },
  { label: 'Settings',      href: '/settings',         icon: Gear        },
  { label: 'Admin',         href: '/admin',            icon: ShieldCheck },
];

function isActivePath(pathname: string, href: string): boolean {
  // Dashboard: exact or root
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  // Admin: exact or sub-paths
  if (href === '/admin') return pathname === '/admin' || pathname.startsWith('/admin/');
  // New Trip: exact only (so /trips doesn't also activate this)
  if (href === '/trips/new') return pathname === '/trips/new';
  // My Trips: only the /trips root (not /trips/new or /trips/:id detail)
  if (href === '/trips') return pathname === '/trips';
  // All others: exact or direct child
  return pathname === href || pathname.startsWith(href + '/');
}


function SidebarContent() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="flex h-full flex-col bg-cream border-r border-sand-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Compass size={28} weight="duotone" className="text-ember-500" />
        <span className="font-display text-xl font-bold text-charcoal-800">
          Traveloop
        </span>
      </div>

      {/* User section */}
      <div className="mx-4 mb-6 flex items-center gap-3 rounded-lg bg-sand-50 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-500 text-sm font-semibold text-white">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-charcoal-800">
            {user?.name ?? 'Traveler'}
          </p>
          <span className="inline-block rounded bg-sand-200 px-2 py-0.5 text-xs text-charcoal-600">
            Free Explorer
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-[3px] border-ember-500 bg-sand-100 text-ember-500'
                  : 'border-l-[3px] border-transparent text-charcoal-600 hover:bg-sand-50 hover:text-charcoal-800'
              )}
            >
              <Icon
                size={20}
                weight={isActive ? 'fill' : 'regular'}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive
                    ? 'text-ember-500'
                    : 'text-charcoal-400 group-hover:text-charcoal-600'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sand-200 p-3">
        <button
          onClick={clearAuth}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal-600 transition-colors hover:bg-sand-50 hover:text-charcoal-800"
        >
          <SignOut size={20} className="shrink-0 text-charcoal-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] md:block">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-charcoal-900/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
