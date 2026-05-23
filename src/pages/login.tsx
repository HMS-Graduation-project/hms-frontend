import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation('auth');

  const loginSchema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(1, t('passwordRequired')),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const u = await login(data.email, data.password);
      // Role-aware landing: patients → portal, everyone else → dashboard
      // (which itself redirects MINISTRY/REGIONAL admins to their views).
      navigate(u.role === 'PATIENT' ? '/portal/home' : '/dashboard');
    } catch (err: any) {
      setError(err.message || t('loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t('signIn')}</CardTitle>
            <LanguageSwitcher />
          </div>
          <CardDescription>{t('enterCredentials')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" placeholder={t('emailPlaceholder')} {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pe-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('signingIn') : t('signIn')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-primary underline">{t('signUp')}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
