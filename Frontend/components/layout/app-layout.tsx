'use client';

import { List } from '@phosphor-icons/react';
import { Compass } from '@phosphor-icons/react';
import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ToastContainer } from '@/components/ui/toast-container';
import { useUIStore } from '@/store/ui';

interface AppLayoutProps {
  children: React.ReactNode;
}

function MobileTopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sand-200 bg-cream px-4 py-3 md:hidden">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-1.5 text-charcoal-600 transition-colors hover:bg-sand-100"
        aria-label="Toggle sidebar"
      >
        <List size={24} />
      </button>
      <div className="flex items-center gap-2">
        <Compass size={22} weight="duotone" className="text-ember-500" />
        <span className="font-display text-lg font-bold text-charcoal-800">
          Traveloop
        </span>
      </div>
    </header>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-cream flex flex-col">
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 md:ml-[240px] overflow-x-hidden">
          <MobileTopBar />

          <main className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-80px)] md:min-h-screen">
            <PageWrapper>{children}</PageWrapper>
          </main>
        </div>

        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
