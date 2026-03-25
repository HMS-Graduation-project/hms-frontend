import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  status: AppointmentStatus;
}

const statusVariantMap: Record<AppointmentStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

// Placeholder data -- will be replaced with API data in Phase 5
const placeholderAppointments: Appointment[] = [
  { id: '1', patient: 'Ahmed Yilmaz', doctor: 'Dr. Mehmet Oz', time: '09:00', status: 'CONFIRMED' },
  { id: '2', patient: 'Fatma Demir', doctor: 'Dr. Ayse Kaya', time: '09:30', status: 'PENDING' },
  { id: '3', patient: 'Ali Celik', doctor: 'Dr. Mehmet Oz', time: '10:00', status: 'CONFIRMED' },
  { id: '4', patient: 'Zeynep Arslan', doctor: 'Dr. Can Yildiz', time: '10:30', status: 'COMPLETED' },
  { id: '5', patient: 'Emre Koc', doctor: 'Dr. Ayse Kaya', time: '11:00', status: 'PENDING' },
];

export function RecentAppointments() {
  const { t } = useTranslation('dashboard');
  const appointments = placeholderAppointments;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-lg">{t('recentAppointments')}</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('noAppointmentsToday')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">{t('patient')}</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">{t('doctor')}</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">{t('time')}</th>
                  <th className="pb-3 font-medium text-muted-foreground">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{appt.patient}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{appt.doctor}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{appt.time}</td>
                    <td className="py-3">
                      <Badge variant={statusVariantMap[appt.status]}>
                        {appt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
