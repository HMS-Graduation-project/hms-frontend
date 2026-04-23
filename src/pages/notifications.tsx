import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  type Notification,
} from '@/hooks/use-notifications';

function formatTimeAgo(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('justNow');
  if (diffMins < 60) return t('minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('hoursAgo', { count: diffHours });
  return t('daysAgo', { count: diffDays });
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const { t } = useTranslation('notifications');

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        !notification.isRead && 'border-primary/30 bg-primary/5',
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={cn(
            'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            notification.isRead
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm leading-tight',
                !notification.isRead && 'font-semibold',
              )}
            >
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(notification.createdAt, t)}
          </p>
        </div>
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="mr-1 h-4 w-4" />
            {t('markAsRead')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationsList({ filter }: { filter: 'ALL' | 'UNREAD' }) {
  const { t } = useTranslation('notifications');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const markAsRead = useMarkAsRead();

  const notifications = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const filtered =
    filter === 'UNREAD'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground">
        <Bell className="mb-3 h-10 w-10 opacity-50" />
        <p className="text-lg font-medium">{t('noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={(id) => markAsRead.mutate(id)}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            &laquo;
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            &raquo;
          </Button>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('title')}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          {t('markAllRead')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ALL">
        <TabsList>
          <TabsTrigger value="ALL">{t('all')}</TabsTrigger>
          <TabsTrigger value="UNREAD">{t('unread')}</TabsTrigger>
        </TabsList>
        <TabsContent value="ALL" className="mt-4">
          <NotificationsList filter="ALL" />
        </TabsContent>
        <TabsContent value="UNREAD" className="mt-4">
          <NotificationsList filter="UNREAD" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
