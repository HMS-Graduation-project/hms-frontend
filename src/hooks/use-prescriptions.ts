import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | null;
  instructions: string | null;
}

export type PrescriptionStatus =
  | 'PENDING'
  | 'DISPENSED'
  | 'PARTIALLY_DISPENSED'
  | 'CANCELLED';

export interface Prescription {
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  status: PrescriptionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: PrescriptionItem[];
  patient?: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  doctor?: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  _count?: { items: number };
}

interface UsePrescriptionsParams {
  page?: number;
  limit?: number;
  status?: PrescriptionStatus | '';
}

interface CreatePrescriptionPayload {
  medicalRecordId: string;
  notes?: string;
  items: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity?: number;
    instructions?: string;
  }[];
}

interface UpdatePrescriptionStatusPayload {
  id: string;
  status: PrescriptionStatus;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePrescriptions(params: UsePrescriptionsParams = {}) {
  const { page = 1, limit = 10, status } = params;

  return useQuery<PaginatedResponse<Prescription>>({
    queryKey: ['prescriptions', { page, limit, status }],
    queryFn: () =>
      api.get<PaginatedResponse<Prescription>>(
        `/v1/prescriptions${buildQueryString({ page, limit, status: status || undefined })}`
      ),
  });
}

export function usePrescription(id: string | undefined) {
  return useQuery<Prescription>({
    queryKey: ['prescriptions', id],
    queryFn: () => api.get<Prescription>(`/v1/prescriptions/${id}`),
    enabled: !!id,
  });
}

export function usePatientPrescriptions(
  patientId: string | undefined,
  params: UsePrescriptionsParams = {}
) {
  const { page = 1, limit = 10, status } = params;

  return useQuery<PaginatedResponse<Prescription>>({
    queryKey: ['prescriptions', 'patient', patientId, { page, limit, status }],
    queryFn: () =>
      api.get<PaginatedResponse<Prescription>>(
        `/v1/patients/${patientId}/prescriptions${buildQueryString({
          page,
          limit,
          status: status || undefined,
        })}`
      ),
    enabled: !!patientId,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation<Prescription, Error, CreatePrescriptionPayload>({
    mutationFn: (payload) =>
      api.post<Prescription>('/v1/prescriptions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
}

export function useUpdatePrescriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation<Prescription, Error, UpdatePrescriptionStatusPayload>({
    mutationFn: ({ id, status }) =>
      api.patch<Prescription>(`/v1/prescriptions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}
