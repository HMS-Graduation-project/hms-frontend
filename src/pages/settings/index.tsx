import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Clock,
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';
import {
  useSettings,
  useUpdateSetting,
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from '@/hooks/use-settings';
import type { Holiday } from '@/hooks/use-settings';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const GENERAL_FIELDS = [
  'hospitalName',
  'hospitalAddress',
  'hospitalPhone',
  'hospitalEmail',
  'hospitalWebsite',
] as const;

type GeneralField = (typeof GENERAL_FIELDS)[number];

// Map field names to setting keys stored in the backend
const FIELD_TO_KEY: Record<GeneralField, string> = {
  hospitalName: 'hospital.name',
  hospitalAddress: 'hospital.address',
  hospitalPhone: 'hospital.phone',
  hospitalEmail: 'hospital.email',
  hospitalWebsite: 'hospital.website',
};

// ---------------------------------------------------------------------------
// General Tab
// ---------------------------------------------------------------------------

function GeneralTab() {
  const { t } = useTranslation('settings');
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();

  const [form, setForm] = useState<Record<GeneralField, string>>({
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    hospitalEmail: '',
    hospitalWebsite: '',
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setForm({
        hospitalName: settings['hospital.name'] ?? '',
        hospitalAddress: settings['hospital.address'] ?? '',
        hospitalPhone: settings['hospital.phone'] ?? '',
        hospitalEmail: settings['hospital.email'] ?? '',
        hospitalWebsite: settings['hospital.website'] ?? '',
      });
    }
  }, [settings]);

  const [saving, setSaving] = useState(false);

  const handleChange = (field: GeneralField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const field of GENERAL_FIELDS) {
        await updateSetting.mutateAsync({
          key: FIELD_TO_KEY[field],
          value: form[field],
        });
      }
      toast({
        title: t('settingsSaved'),
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('general')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {GENERAL_FIELDS.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{t(field)}</Label>
              <Input
                id={field}
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={t(field)}
              />
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('saveSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Working Hours Tab
// ---------------------------------------------------------------------------

function WorkingHoursTab() {
  const { t } = useTranslation('settings');
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();

  const [hours, setHours] = useState<
    Record<Weekday, { start: string; end: string }>
  >(() => {
    const initial: Record<Weekday, { start: string; end: string }> =
      {} as Record<Weekday, { start: string; end: string }>;
    for (const day of WEEKDAYS) {
      initial[day] = { start: '09:00', end: '17:00' };
    }
    return initial;
  });

  useEffect(() => {
    if (settings) {
      setHours((prev) => {
        const next = { ...prev };
        for (const day of WEEKDAYS) {
          next[day] = {
            start:
              settings[`workingHours.${day}.start`] ?? prev[day].start,
            end: settings[`workingHours.${day}.end`] ?? prev[day].end,
          };
        }
        return next;
      });
    }
  }, [settings]);

  const [saving, setSaving] = useState(false);

  const handleChange = (
    day: Weekday,
    field: 'start' | 'end',
    value: string
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const day of WEEKDAYS) {
        await updateSetting.mutateAsync({
          key: `workingHours.${day}.start`,
          value: hours[day].start,
        });
        await updateSetting.mutateAsync({
          key: `workingHours.${day}.end`,
          value: hours[day].end,
        });
      }
      toast({
        title: t('settingsSaved'),
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save working hours',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('workingHours')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden sm:block">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('weekday')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('startTime')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('endTime')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map((day) => (
                  <tr key={day} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{t(day)}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={hours[day].start}
                        onChange={(e) =>
                          handleChange(day, 'start', e.target.value)
                        }
                        className="w-[140px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={hours[day].end}
                        onChange={(e) =>
                          handleChange(day, 'end', e.target.value)
                        }
                        className="w-[140px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 sm:hidden">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="rounded-md border p-4 space-y-3"
            >
              <p className="font-medium">{t(day)}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t('startTime')}
                  </Label>
                  <Input
                    type="time"
                    value={hours[day].start}
                    onChange={(e) =>
                      handleChange(day, 'start', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t('endTime')}
                  </Label>
                  <Input
                    type="time"
                    value={hours[day].end}
                    onChange={(e) =>
                      handleChange(day, 'end', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('saveSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Holidays Tab
// ---------------------------------------------------------------------------

function HolidaysTab() {
  const { t } = useTranslation('settings');
  const { toast } = useToast();
  const { data: holidays, isLoading } = useHolidays();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = async () => {
    if (!newName.trim() || !newDate) return;
    try {
      await createHoliday.mutateAsync({ name: newName.trim(), date: newDate });
      toast({ title: t('holidayCreated'), variant: 'success' });
      setNewName('');
      setNewDate('');
      setAddOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add holiday',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHoliday.mutateAsync(deleteTarget.id);
      toast({ title: t('holidayDeleted'), variant: 'success' });
      setDeleteTarget(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete holiday',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{t('holidays')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </div>

          {/* Add Holiday Dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t('addHoliday')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addHoliday')}</DialogTitle>
                <DialogDescription>{t('subtitle')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="holiday-name">{t('holidayName')}</Label>
                  <Input
                    id="holiday-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('holidayName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-date">{t('holidayDate')}</Label>
                  <Input
                    id="holiday-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  {t('common:cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={
                    createHoliday.isPending || !newName.trim() || !newDate
                  }
                >
                  {createHoliday.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('addHoliday')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {(!holidays || holidays.length === 0) ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('noHolidays')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(holiday)}
                    aria-label={t('deleteHoliday')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteHoliday')}</DialogTitle>
            <DialogDescription>
              {t('deleteHolidayConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common:cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteHoliday.isPending}
            >
              {deleteHoliday.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('deleteHoliday')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t('general')}</span>
          </TabsTrigger>
          <TabsTrigger value="working-hours" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{t('workingHours')}</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{t('holidays')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="working-hours">
          <WorkingHoursTab />
        </TabsContent>

        <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
