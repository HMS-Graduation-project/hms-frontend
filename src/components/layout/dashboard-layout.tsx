import { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/providers/auth-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { PageLoading } from '@/components/page-loading';

export function DashboardLayout() {
  const { isOpen, toggle } = useSidebar();
  const { user } = useAuth();

  // Patients live in the portal — bounce them out of the staff layout.
  if (user?.role === 'PATIENT') {
    return <Navigate to="/portal/home" replace />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar isOpen={isOpen} onToggle={toggle} />

      {/* Main content area */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300 ease-in-out',
          isOpen ? 'lg:ms-64' : 'lg:ms-16'
        )}
      >
        <Header />

        <main className="flex-1 p-4 sm:p-6">
          <Suspense fallback={<PageLoading variant="skeleton" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
