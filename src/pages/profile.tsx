import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { t: tAuth } = useTranslation('auth');

  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: () => api.get<UserProfile>('/v1/me'),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{t('failedToLoadProfile')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('profile')}</CardTitle>
            <LanguageSwitcher />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{tAuth('email')}</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('role')}</p>
            <p className="font-medium">{user?.role ? t(`roles.${user.role}`, { defaultValue: user.role }) : '-'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('memberSince')}</p>
            <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            {tAuth('signOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
