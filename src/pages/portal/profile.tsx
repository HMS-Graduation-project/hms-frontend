import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon } from 'lucide-react';
import {
  usePortalProfile,
  useUpdatePortalProfile,
} from '@/hooks/use-portal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function PortalProfilePage() {
  const { t } = useTranslation('portal');
  const { toast } = useToast();
  const { data, isLoading } = usePortalProfile();
  const update = useUpdatePortalProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  useEffect(() => {
    if (data) {
      const np = data.nationalPatient;
      setFirstName(np.firstName ?? '');
      setLastName(np.lastName ?? '');
      setPhone(np.phone ?? '');
      setAddress(np.address ?? '');
      setBloodType(np.bloodType ?? '');
      setAllergies(np.allergies ?? '');
      setChronicConditions(np.chronicConditions ?? '');
    }
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        firstName,
        lastName,
        phone,
        address,
        bloodType,
        allergies,
        chronicConditions,
      });
      toast({ title: t('profile.saved') });
    } catch (err: unknown) {
      toast({
        title: t('profile.saveFailed'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4" /> {t('profile.demographics')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('profile.nhid')}: <code>{data.nationalPatient.id}</code>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bloodType">{t('profile.bloodType')}</Label>
                <Input
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  placeholder="A+ / O- / ..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">{t('profile.address')}</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="allergies">{t('profile.allergies')}</Label>
              <Textarea
                id="allergies"
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="chronic">{t('profile.chronic')}</Label>
              <Textarea
                id="chronic"
                rows={2}
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? t('profile.saving') : t('profile.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
