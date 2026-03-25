import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AvailableSlot } from '@/hooks/use-appointments';

interface TimeSlotPickerProps {
  slots: AvailableSlot[] | undefined;
  isLoading: boolean;
  selectedSlot: AvailableSlot | null;
  onSelect: (slot: AvailableSlot) => void;
}

function formatTime(time: string): string {
  // Handle HH:mm or HH:mm:ss formats
  return time.slice(0, 5);
}

export function TimeSlotPicker({
  slots,
  isLoading,
  selectedSlot,
  onSelect,
}: TimeSlotPickerProps) {
  const { t } = useTranslation('appointments');

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t('noSlotsAvailable')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot) => {
        const isSelected =
          selectedSlot?.startTime === slot.startTime &&
          selectedSlot?.endTime === slot.endTime;

        return (
          <Button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            disabled={!slot.isAvailable}
            onClick={() => onSelect(slot)}
            className={cn(
              'h-10 text-xs font-medium',
              !slot.isAvailable && 'cursor-not-allowed opacity-50',
              isSelected && 'ring-2 ring-ring ring-offset-2',
            )}
          >
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </Button>
        );
      })}
    </div>
  );
}
