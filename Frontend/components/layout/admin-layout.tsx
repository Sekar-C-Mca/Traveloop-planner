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

function AdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="flex h-full flex-col bg-cream border-r border-sand-200">
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
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
            pathname === '/admin'
              ? 'bg-ember-50 text-ember-600 border-l-[3px] border-ember-500'
              : 'text-charcoal-600 hover:bg-sand-50 border-l-[3px] border-transparent'
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
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
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

      <div className="flex flex-1">
        {/* Desktop sidebar — always visible */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] md:block">
          <AdminSidebarContent />
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
                <AdminSidebarContent onClose={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 md:ml-[240px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
