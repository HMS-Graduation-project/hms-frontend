import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingLabOrders: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  patientsTrend?: number;
  doctorsTrend?: number;
  appointmentsTrend?: number;
}

export interface AppointmentStatPoint {
  date: string;
  count: number;
}

export interface RevenueStatPoint {
  category: string;
  amount: number;
}

export interface DepartmentStat {
  department: string;
  patients: number;
  doctors: number;
  appointments: number;
  revenue: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/v1/analytics/dashboard-stats'),
  });
}

export function useAppointmentStats(period: string = 'month') {
  return useQuery<AppointmentStatPoint[]>({
    queryKey: ['analytics', 'appointment-stats', period],
    queryFn: () =>
      api.get<AppointmentStatPoint[]>(
        `/v1/analytics/appointment-stats?period=${period}`,
      ),
  });
}

export function useRevenueStats(period: string = 'month') {
  return useQuery<RevenueStatPoint[]>({
    queryKey: ['analytics', 'revenue-stats', period],
    queryFn: () =>
      api.get<RevenueStatPoint[]>(
        `/v1/analytics/revenue-stats?period=${period}`,
      ),
  });
}

export function useDepartmentStats() {
  return useQuery<DepartmentStat[]>({
    queryKey: ['analytics', 'department-stats'],
    queryFn: () => api.get<DepartmentStat[]>('/v1/analytics/department-stats'),
  });
}
