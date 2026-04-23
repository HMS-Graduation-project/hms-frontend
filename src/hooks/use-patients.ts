import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';
import type {
  NationalPatient,
  NationalPatientProfileLink,
} from '@/hooks/use-national-registry';

export interface PatientProfile {
  id: string;
  userId: string | null;
  bloodType: string | null;
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  medicalNotes: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    address: string | null;
  };
  nationalPatient: NationalPatient & { profiles?: NationalPatientProfileLink[] };
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

/**
 * Create-patient payload. Caller sends EITHER `nationalPatientId` (link mode)
 * OR full demographic fields (new-registry mode). `email`+`password` are
 * optional and create a login account for the patient.
 */
interface CreatePatientPayload {
  // Link mode
  nationalPatientId?: string;
  // New-registry mode (required if no nationalPatientId)
  syrianNationalId?: string;
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth?: string;
  gender?: string;
  // Optional login
  email?: string;
  password?: string;
  // Contact / address (go to NationalPatient when creating new)
  phone?: string;
  address?: string;
  // Hospital-local fields
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  medicalNotes?: string;
}

interface UpdatePatientPayload {
  id: string;
  data: {
    // Hospital-local fields only. Demographic fields are silently dropped by
    // the backend — use /v1/national-registry/patients/:nhid for those.
    bloodType?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    medicalNotes?: string;
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
      queryClient.invalidateQueries({ queryKey: ['national-registry'] });
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
