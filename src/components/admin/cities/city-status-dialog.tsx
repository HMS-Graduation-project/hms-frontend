import { useTranslation } from 'react-i18next';
import { ArrowRight, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { City } from '@/hooks/use-cities';

interface CityStatusDialogProps {
  city: City | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

/**
 * Confirmation modal for activating / deactivating a city. It spells out the
 * current status, the resulting status, and what the change actually does — so
 * the action is never ambiguous the way a bare power icon was.
 */
export function CityStatusDialog({
  city,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CityStatusDialogProps) {
  const { t } = useTranslation('cities');
  const { t: tCommon } = useTranslation('common');

  if (!city) return null;

  const willDeactivate = city.isActive;
  const hospitals = city._count?.hospitals ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {willDeactivate
              ? t('confirm.deactivateTitle', { name: city.name })
              : t('confirm.activateTitle', { name: city.name })}
          </DialogTitle>
          <DialogDescription>
            {willDeactivate
              ? t('confirm.deactivateDesc')
              : t('confirm.activateDesc')}
          </DialogDescription>
        </DialogHeader>

        {/* Current status → next status, made explicit. */}
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/40 p-4">
          <div className="text-center">
            <p className="mb-1 text-xs text-muted-foreground">
              {t('confirm.currentStatus')}
            </p>
            <Badge variant={city.isActive ? 'success' : 'secondary'}>
              {city.isActive ? t('active') : t('inactive')}
            </Badge>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
          <div className="text-center">
            <p className="mb-1 text-xs text-muted-foreground">
              {t('confirm.newStatus')}
            </p>
            <Badge variant={willDeactivate ? 'secondary' : 'success'}>
              {willDeactivate ? t('inactive') : t('active')}
            </Badge>
          </div>
        </div>

        {/* Warn if a deactivation affects existing hospitals. */}
        {willDeactivate && hospitals > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-warning-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm">{t('confirm.hospitalWarning', { count: hospitals })}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant={willDeactivate ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isPending}
          >
            {willDeactivate ? (
              <PowerOff className="me-2 h-4 w-4" />
            ) : (
              <Power className="me-2 h-4 w-4" />
            )}
            {isPending
              ? tCommon('loading')
              : willDeactivate
                ? t('deactivate')
                : t('activate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
