import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  variant?: 'skeleton' | 'spinner';
  className?: string;
}

function PageLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-full flex-col gap-6 p-6', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6"
          >
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="rounded-lg border bg-card">
        {/* Table header */}
        <div className="border-b p-4">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {/* Table rows */}
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageLoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[400px] w-full items-center justify-center',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function PageLoading({ variant = 'skeleton', className }: PageLoadingProps) {
  if (variant === 'spinner') {
    return <PageLoadingSpinner className={className} />;
  }

  return <PageLoadingSkeleton className={className} />;
}
