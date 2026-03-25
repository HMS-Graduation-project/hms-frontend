import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  bio: string | null;
  yearsExperience: number | null;
  consultationFee: string | null;
  isAvailable: boolean;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

interface UseDoctorsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  departmentId?: string;
  specialization?: string;
}

interface CreateDoctorPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization: string;
  licenseNumber: string;
  departmentId?: string;
  bio?: string;
  yearsExperience?: number;
  consultationFee?: number;
}

interface UpdateDoctorPayload {
  id: string;
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    specialization?: string;
    licenseNumber?: string;
    departmentId?: string | null;
    bio?: string;
    yearsExperience?: number;
    consultationFee?: number;
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

export function useDoctors(params: UseDoctorsParams = {}) {
  const { page = 1, limit = 10, sortBy, sortOrder, search, departmentId, specialization } = params;

  return useQuery<PaginatedResponse<DoctorProfile>>({
    queryKey: ['doctors', { page, limit, sortBy, sortOrder, search, departmentId, specialization }],
    queryFn: () =>
      api.get<PaginatedResponse<DoctorProfile>>(
        `/v1/doctors${buildQueryString({ page, limit, sortBy, sortOrder, search, departmentId, specialization })}`
      ),
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery<DoctorProfile>({
    queryKey: ['doctors', id],
    queryFn: () => api.get<DoctorProfile>(`/v1/doctors/${id}`),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation<DoctorProfile, Error, CreateDoctorPayload>({
    mutationFn: (payload) => api.post<DoctorProfile>('/v1/doctors', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation<DoctorProfile, Error, UpdateDoctorPayload>({
    mutationFn: ({ id, data }) => api.patch<DoctorProfile>(`/v1/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useDepartmentsList() {
  return useQuery<PaginatedResponse<Department>>({
    queryKey: ['departments', 'list'],
    queryFn: () =>
      api.get<PaginatedResponse<Department>>('/v1/departments?limit=100'),
  });
}
