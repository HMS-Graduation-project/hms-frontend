import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { MedicalRecord } from '@/hooks/use-medical-records';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientTimelineProps {
  records: MedicalRecord[];
  isLoading?: boolean;
}

export function PatientTimeline({ records, isLoading }: PatientTimelineProps) {
  const { t } = useTranslation('medical-records');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-3 w-3 shrink-0 rounded-full mt-1.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('noRecords')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

      {records.map((record) => {
        const doctorName = record.doctor
          ? [record.doctor.user.firstName, record.doctor.user.lastName]
              .filter(Boolean)
              .join(' ')
          : '';
        const date = new Date(record.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={record.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Dot */}
            <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-background" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{date}</p>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {doctorName && (
                        <p className="text-sm text-muted-foreground">
                          {t('doctor')}: {doctorName}
                        </p>
                      )}
                      {record.diagnosis && (
                        <p className="mt-1 text-sm font-medium truncate">
                          {t('diagnosis')}: {record.diagnosis}
                        </p>
                      )}
                      {record.chiefComplaint && !record.diagnosis && (
                        <p className="mt-1 text-sm font-medium truncate">
                          {record.chiefComplaint}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => navigate(`/medical-records/${record.id}`)}
                    >
                      <FileText className="mr-1 h-4 w-4" />
                      {t('recordDetail')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}
