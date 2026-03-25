import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VitalSigns {
  id: string;
  medicalRecordId: string;
  temperature: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weight: number | null;
  height: number | null;
  recordedAt: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string | null;
  presentIllness: string | null;
  examination: string | null;
  diagnosis: string | null;
  icdCodes: string | null;
  treatmentPlan: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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
  appointment?: {
    id: string;
    scheduledAt: string;
    status: string;
  };
  vitalSigns?: VitalSigns[];
  prescriptions?: {
    id: string;
    status: string;
    createdAt: string;
    _count?: { items: number };
  }[];
}

interface UsePatientMedicalRecordsParams {
  page?: number;
  limit?: number;
}

interface CreateMedicalRecordPayload {
  appointmentId: string;
  chiefComplaint?: string;
  presentIllness?: string;
  examination?: string;
  diagnosis?: string;
  icdCodes?: string;
  treatmentPlan?: string;
  notes?: string;
}

interface UpdateMedicalRecordPayload {
  id: string;
  data: {
    chiefComplaint?: string;
    presentIllness?: string;
    examination?: string;
    diagnosis?: string;
    icdCodes?: string;
    treatmentPlan?: string;
    notes?: string;
  };
}

interface AddVitalSignsPayload {
  medicalRecordId: string;
  data: {
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
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

export function useMedicalRecords(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
} = {}) {
  const qs = buildQueryString(params);
  return useQuery<PaginatedResponse<MedicalRecord>>({
    queryKey: ['medical-records', params],
    queryFn: () => api.get<PaginatedResponse<MedicalRecord>>(`/v1/medical-records${qs}`),
  });
}

export function useMedicalRecord(id: string | undefined) {
  return useQuery<MedicalRecord>({
    queryKey: ['medical-records', id],
    queryFn: () => api.get<MedicalRecord>(`/v1/medical-records/${id}`),
    enabled: !!id,
  });
}

export function usePatientMedicalRecords(
  patientId: string | undefined,
  params: UsePatientMedicalRecordsParams = {}
) {
  const { page = 1, limit = 10 } = params;

  return useQuery<PaginatedResponse<MedicalRecord>>({
    queryKey: ['medical-records', 'patient', patientId, { page, limit }],
    queryFn: () =>
      api.get<PaginatedResponse<MedicalRecord>>(
        `/v1/patients/${patientId}/medical-records${buildQueryString({ page, limit })}`
      ),
    enabled: !!patientId,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, Error, CreateMedicalRecordPayload>({
    mutationFn: (payload) =>
      api.post<MedicalRecord>('/v1/medical-records', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, Error, UpdateMedicalRecordPayload>({
    mutationFn: ({ id, data }) =>
      api.patch<MedicalRecord>(`/v1/medical-records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
}

export function useAddVitalSigns() {
  const queryClient = useQueryClient();

  return useMutation<VitalSigns, Error, AddVitalSignsPayload>({
    mutationFn: ({ medicalRecordId, data }) =>
      api.post<VitalSigns>(`/v1/medical-records/${medicalRecordId}/vitals`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
}
