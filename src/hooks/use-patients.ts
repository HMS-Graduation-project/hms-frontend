import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export interface PatientProfile {
  id: string;
  userId: string;
  bloodType: string | null;
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  medicalNotes: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    address: string | null;
  };
  createdAt: string;
}

interface UsePatientsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  bloodType?: string;
}

interface CreatePatientPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

interface UpdatePatientPayload {
  id: string;
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    bloodType?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
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

export function usePatients(params: UsePatientsParams = {}) {
  const { page = 1, limit = 10, sortBy, sortOrder, search, bloodType } = params;

  return useQuery<PaginatedResponse<PatientProfile>>({
    queryKey: ['patients', { page, limit, sortBy, sortOrder, search, bloodType }],
    queryFn: () =>
      api.get<PaginatedResponse<PatientProfile>>(
        `/v1/patients${buildQueryString({ page, limit, sortBy, sortOrder, search, bloodType })}`
      ),
  });
}

export function usePatient(id: string | undefined) {
  return useQuery<PatientProfile>({
    queryKey: ['patients', id],
    queryFn: () => api.get<PatientProfile>(`/v1/patients/${id}`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation<PatientProfile, Error, CreatePatientPayload>({
    mutationFn: (payload) => api.post<PatientProfile>('/v1/patients', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation<PatientProfile, Error, UpdatePatientPayload>({
    mutationFn: ({ id, data }) => api.patch<PatientProfile>(`/v1/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
