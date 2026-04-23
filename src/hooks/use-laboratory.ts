import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LabOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type LabOrderPriority = 'NORMAL' | 'URGENT' | 'STAT';

export interface LabResult {
  id: string;
  result: string;
  normalRange: string | null;
  unit: string | null;
  isAbnormal: boolean | null;
  technicianId: string | null;
  notes: string | null;
  reportedAt: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId: string | null;
  testName: string;
  testCategory: string | null;
  status: LabOrderStatus;
  priority: LabOrderPriority;
  notes: string | null;
  result?: LabResult;
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
  orderedAt: string;
  completedAt: string | null;
}

interface UseLabOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}

interface CreateLabOrderPayload {
  patientId: string;
  doctorId: string;
  medicalRecordId?: string;
  testName: string;
  testCategory?: string;
  priority?: LabOrderPriority;
  notes?: string;
}

interface UpdateLabOrderStatusPayload {
  id: string;
  status: LabOrderStatus;
}

interface EnterLabResultPayload {
  id: string;
  result: string;
  normalRange?: string;
  unit?: string;
  isAbnormal?: boolean;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQueryString(
  params: Record<string, string | number | undefined>
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

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useLabOrders(params: UseLabOrdersParams = {}) {
  const { page = 1, limit = 10, status, priority, search } = params;

  return useQuery<PaginatedResponse<LabOrder>>({
    queryKey: ['lab-orders', { page, limit, status, priority, search }],
    queryFn: () =>
      api.get<PaginatedResponse<LabOrder>>(
        `/v1/lab-orders${buildQueryString({
          page,
          limit,
          status: status || undefined,
          priority: priority || undefined,
          search: search || undefined,
        })}`
      ),
  });
}

export function useLabOrder(id: string | undefined) {
  return useQuery<LabOrder>({
    queryKey: ['lab-orders', id],
    queryFn: () => api.get<LabOrder>(`/v1/lab-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateLabOrder() {
  const queryClient = useQueryClient();

  return useMutation<LabOrder, Error, CreateLabOrderPayload>({
    mutationFn: (payload) =>
      api.post<LabOrder>('/v1/lab-orders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    },
  });
}

export function useUpdateLabOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<LabOrder, Error, UpdateLabOrderStatusPayload>({
    mutationFn: ({ id, status }) =>
      api.patch<LabOrder>(`/v1/lab-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    },
  });
}

export function useEnterLabResult() {
  const queryClient = useQueryClient();

  return useMutation<LabResult, Error, EnterLabResultPayload>({
    mutationFn: ({ id, ...payload }) =>
      api.post<LabResult>(`/v1/lab-orders/${id}/results`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    },
  });
}
