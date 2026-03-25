import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  floor: string | null;
  phone: string | null;
  isActive: boolean;
  headDoctorId: string | null;
  headDoctor?: { id: string; firstName: string | null; lastName: string | null };
  _count?: { doctors: number };
  createdAt: string;
  updatedAt: string;
}

interface UseDepartmentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

interface CreateDepartmentPayload {
  name: string;
  description?: string;
  floor?: string;
  phone?: string;
  headDoctorId?: string;
}

interface UpdateDepartmentPayload {
  id: string;
  data: {
    name?: string;
    description?: string;
    floor?: string;
    phone?: string;
    headDoctorId?: string | null;
  };
}

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

export function useDepartments(params: UseDepartmentsParams = {}) {
  const { page = 1, limit = 10, sortBy, sortOrder, search } = params;

  return useQuery<PaginatedResponse<Department>>({
    queryKey: ['departments', { page, limit, sortBy, sortOrder, search }],
    queryFn: () =>
      api.get<PaginatedResponse<Department>>(
        `/v1/departments${buildQueryString({ page, limit, sortBy, sortOrder, search })}`
      ),
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery<Department>({
    queryKey: ['departments', id],
    queryFn: () => api.get<Department>(`/v1/departments/${id}`),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<Department, Error, CreateDepartmentPayload>({
    mutationFn: (payload) => api.post<Department>('/v1/departments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<Department, Error, UpdateDepartmentPayload>({
    mutationFn: ({ id, data }) => api.patch<Department>(`/v1/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation<Department, Error, string>({
    mutationFn: (id) => api.delete<Department>(`/v1/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
