'use client';

import { List, SignOut, ShieldCheck } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sand-200 bg-cream px-4 py-3 md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-charcoal-600 transition-colors hover:bg-sand-100"
          aria-label="Toggle sidebar"
        >
          <List size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} weight="duotone" className="text-ember-500" />
          <span className="font-display text-lg font-bold text-charcoal-800">
            Admin
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-sand-200 bg-cream pt-0 md:static md:z-0 md:animate-none"
            >
              {/* Sidebar Content */}
              <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-sand-200 px-6 py-6">
                  <ShieldCheck size={28} weight="duotone" className="text-ember-500" />
                  <span className="font-display text-xl font-bold text-charcoal-800">
                    Admin
                  </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-4 py-6">
                  <Link
                    href="/admin"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      pathname === '/admin'
                        ? 'bg-ember-50 text-ember-600'
                        : 'text-charcoal-600 hover:bg-sand-50'
                    )}
                  >
                    Dashboard
                  </Link>
                </nav>

                {/* Logout */}
                <div className="border-t border-sand-200 px-4 py-4">
                  <button
                    onClick={() => {
                      clearAuth();
                      window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-charcoal-600 transition-colors hover:bg-sand-50"
                  >
                    <SignOut size={20} />
                    Logout
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 md:ml-0">{children}</main>
      </div>
    </div>
  );
}
