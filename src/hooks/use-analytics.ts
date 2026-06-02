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

// ── Appointment Trends ──────────────────────────────────────────────────────

export interface AppointmentStatPoint {
  label: string;
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentStatsResponse {
  period: string;
  data: AppointmentStatPoint[];
}

// ── Revenue ─────────────────────────────────────────────────────────────────

export interface RevenueCategoryPoint {
  category: string;
  amount: number;
}

export interface RevenueStatsResponse {
  period: string;
  totalRevenue: number;
  growthPercentage: number | null;
  categories: RevenueCategoryPoint[];
}

// ── Department ──────────────────────────────────────────────────────────────

export interface DepartmentStat {
  id: string;
  name: string;
  doctorCount: number;
  appointmentCount: number;
  patientCount: number;
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/v1/analytics/dashboard'),
  });
}

export function useAppointmentStats(period: string = 'week') {
  return useQuery<AppointmentStatsResponse>({
    queryKey: ['analytics', 'appointments', period],
    queryFn: () =>
      api.get<AppointmentStatsResponse>(
        `/v1/analytics/appointments?period=${period}`,
      ),
  });
}

export function useRevenueStats(period: string = 'month') {
  return useQuery<RevenueStatsResponse>({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () =>
      api.get<RevenueStatsResponse>(
        `/v1/analytics/revenue?period=${period}`,
      ),
  });
}

export function useDepartmentStats() {
  return useQuery<DepartmentStat[]>({
    queryKey: ['analytics', 'departments'],
    queryFn: () => api.get<DepartmentStat[]>('/v1/analytics/departments'),
  });
}
