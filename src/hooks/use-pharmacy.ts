import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Medication {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  manufacturer: string | null;
  dosageForm: string | null;
  strength: string | null;
  unit: string | null;
  price: number;
  stock: number;
  reorderLevel: number;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMedicationPayload {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  price: number;
  stock?: number;
  reorderLevel?: number;
  expiryDate?: string;
}

export interface UpdateMedicationPayload {
  id: string;
  data: Partial<CreateMedicationPayload>;
}

export interface DispensePayload {
  prescriptionId: string;
  medicationId: string;
  quantity: number;
}

interface UseMedicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
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

export function useMedications(params: UseMedicationsParams = {}) {
  const { page = 1, limit = 10, search, category, lowStockOnly } = params;

  return useQuery<PaginatedResponse<Medication>>({
    queryKey: ['medications', { page, limit, search, category, lowStockOnly }],
    queryFn: () =>
      api.get<PaginatedResponse<Medication>>(
        `/v1/medications${buildQueryString({
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          lowStockOnly: lowStockOnly || undefined,
        })}`
      ),
  });
}

export function useMedication(id: string | undefined) {
  return useQuery<Medication>({
    queryKey: ['medications', id],
    queryFn: () => api.get<Medication>(`/v1/medications/${id}`),
    enabled: !!id,
  });
}

export function useLowStockMedications() {
  return useQuery<Medication[]>({
    queryKey: ['medications', 'low-stock'],
    queryFn: () => api.get<Medication[]>('/v1/medications/low-stock'),
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation<Medication, Error, CreateMedicationPayload>({
    mutationFn: (payload) =>
      api.post<Medication>('/v1/medications', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation<Medication, Error, UpdateMedicationPayload>({
    mutationFn: ({ id, data }) =>
      api.patch<Medication>(`/v1/medications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useDispense() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, DispensePayload>({
    mutationFn: (payload) => api.post('/v1/dispensing', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}
