import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: string | null;
  reason: string | null;
  notes: string | null;
  cancelReason: string | null;
  patient: { user: { firstName: string | null; lastName: string | null } };
  doctor: {
    user: { firstName: string | null; lastName: string | null };
    specialization: string;
  };
  department?: { name: string } | null;
  medicalRecord?: { id: string } | null;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface UseAppointmentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  status?: string;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CreateAppointmentPayload {
  patientId?: string;
  doctorId: string;
  departmentId?: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  reason?: string;
}

interface UpdateStatusPayload {
  id: string;
  data: {
    status: AppointmentStatus;
    notes?: string;
  };
}

interface ReschedulePayload {
  id: string;
  data: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface CancelPayload {
  id: string;
  data: {
    reason?: string;
  };
}

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function useAppointments(params: UseAppointmentsParams = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    search,
    status,
    doctorId,
    patientId,
    dateFrom,
    dateTo,
  } = params;

  return useQuery<PaginatedResponse<Appointment>>({
    queryKey: [
      'appointments',
      { page, limit, sortBy, sortOrder, search, status, doctorId, patientId, dateFrom, dateTo },
    ],
    queryFn: () =>
      api.get<PaginatedResponse<Appointment>>(
        `/v1/appointments${buildQueryString({ page, limit, sortBy, sortOrder, search, status, doctorId, patientId, dateFrom, dateTo })}`,
      ),
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery<Appointment>({
    queryKey: ['appointments', id],
    queryFn: () => api.get<Appointment>(`/v1/appointments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, CreateAppointmentPayload>({
    mutationFn: (payload) =>
      api.post<Appointment>('/v1/appointments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, UpdateStatusPayload>({
    mutationFn: ({ id, data }) =>
      api.patch<Appointment>(`/v1/appointments/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, ReschedulePayload>({
    mutationFn: ({ id, data }) =>
      api.patch<Appointment>(`/v1/appointments/${id}/reschedule`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, CancelPayload>({
    mutationFn: ({ id, data }) =>
      api.post<Appointment>(`/v1/appointments/${id}/cancel`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useAvailableSlots(
  doctorId: string | undefined,
  date: string | undefined,
) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['available-slots', doctorId, date],
    queryFn: () =>
      api.get<AvailableSlot[]>(
        `/v1/doctors/${doctorId}/available-slots?date=${date}`,
      ),
    enabled: !!doctorId && !!date,
  });
}
