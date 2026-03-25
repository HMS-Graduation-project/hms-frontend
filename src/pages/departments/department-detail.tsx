import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { useDepartment } from '@/hooks/use-departments';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('departments');
  const { t: tCommon } = useTranslation('common');

  const { data: department, isLoading } = useDepartment(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t('noDepartments')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/departments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToList')}
        </Button>
      </div>
    );
  }

  const headDoctorName = department.headDoctor
    ? [department.headDoctor.firstName, department.headDoctor.lastName]
        .filter(Boolean)
        .join(' ') || '-'
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/departments')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{department.name}</h1>
            <p className="text-muted-foreground">{t('details')}</p>
          </div>
        </div>
        <Badge variant={department.isActive ? 'success' : 'destructive'}>
          {department.isActive ? tCommon('active') : tCommon('inactive')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {t('details')}
            </CardTitle>
            <CardDescription>
              {department.description || t('noDepartments')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('name')}</p>
                <p className="text-sm">{department.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('floor')}</p>
                <p className="text-sm">{department.floor || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
                <p className="text-sm">{department.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('headDoctor')}</p>
                <p className="text-sm">{headDoctorName || t('noHeadDoctor')}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tCommon('status')}</p>
                <Badge variant={department.isActive ? 'success' : 'destructive'}>
                  {department.isActive ? tCommon('active') : tCommon('inactive')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              {t('doctors')}
            </CardTitle>
            <CardDescription>
              {t('doctorCount')}: {department._count?.doctors ?? 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {department._count?.doctors === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noDepartments')}</p>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {department._count?.doctors ?? 0} {t('doctors')}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
