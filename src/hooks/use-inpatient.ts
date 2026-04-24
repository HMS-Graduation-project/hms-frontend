import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export type WardType =
  | 'GENERAL'
  | 'ICU'
  | 'NICU'
  | 'POST_OP'
  | 'ISOLATION'
  | 'MATERNITY'
  | 'PEDIATRIC';

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export type AdmissionStatus =
  | 'ADMITTED'
  | 'TRANSFERRED'
  | 'DISCHARGED'
  | 'DECEASED';

export interface WardListItem {
  id: string;
  hospitalId: string;
  name: string;
  type: WardType;
  floor: string | null;
  description: string | null;
  isActive: boolean;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  _count: { beds: number };
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  hospitalId: string;
  wardId: string;
  number: string;
  status: BedStatus;
  notes: string | null;
  ward?: { id: string; name: string; type: WardType };
  admissions?: Array<{
    id: string;
    patientProfile: {
      id: string;
      nationalPatient: { id: string; firstName: string; lastName: string };
    };
  }>;
}

export interface WardDetail extends WardListItem {
  beds: Bed[];
}

export interface AdmissionPatient {
  id: string;
  hospitalId: string;
  nationalPatientId: string;
  bloodType: string | null;
  allergies: string | null;
  nationalPatient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string | null;
    allergies: string | null;
    criticalAlerts: string | null;
  };
}

export interface AdmissionDoctor {
  id: string;
  specialization: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface AdmissionBed {
  id: string;
  number: string;
  status: BedStatus;
  ward: { id: string; name: string; type: WardType };
}

export interface BedTransferEntry {
  id: string;
  admissionId: string;
  fromBedId: string | null;
  toBedId: string;
  transferredAt: string;
  reason: string | null;
  performedById: string | null;
  fromBed: {
    id: string;
    number: string;
    ward: { id: string; name: string };
  } | null;
  toBed: {
    id: string;
    number: string;
    ward: { id: string; name: string };
  };
}

export interface AdmissionMedicalRecordRef {
  id: string;
  diagnosis: string | null;
  chiefComplaint: string | null;
  createdAt: string;
  doctor: {
    id: string;
    user: { firstName: string | null; lastName: string | null };
  };
}

export interface Admission {
  id: string;
  hospitalId: string;
  patientProfileId: string;
  admittingDoctorId: string;
  bedId: string | null;
  admissionDate: string;
  dischargeDate: string | null;
  diagnosis: string | null;
  reason: string | null;
  status: AdmissionStatus;
  dischargeSummary: string | null;
  createdAt: string;
  updatedAt: string;
  patientProfile: AdmissionPatient;
  admittingDoctor: AdmissionDoctor;
  bed: AdmissionBed | null;
  transfers: BedTransferEntry[];
  medicalRecords: AdmissionMedicalRecordRef[];
}

export interface AdmissionQueryParams {
  status?: AdmissionStatus;
  wardId?: string;
  patientProfileId?: string;
  page?: number;
  limit?: number;
}

export interface CreateWardPayload {
  name: string;
  type: WardType;
  departmentId?: string;
  floor?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateBedPayload {
  wardId: string;
  number: string;
  status?: BedStatus;
  notes?: string;
}

export interface UpdateBedPayload {
  status?: BedStatus;
  notes?: string;
}

export interface CreateAdmissionPayload {
  patientProfileId: string;
  admittingDoctorId: string;
  bedId?: string;
  diagnosis?: string;
  reason?: string;
}

export interface TransferBedPayload {
  toBedId: string;
  reason?: string;
}

export interface DischargeAdmissionPayload {
  status: 'DISCHARGED' | 'DECEASED';
  dischargeSummary?: string;
}

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ─── Wards ──────────────────────────────────────────────────────────

export function useWards() {
  return useQuery<WardListItem[]>({
    queryKey: ['inpatient', 'wards'],
    queryFn: () => api.get<WardListItem[]>('/v1/inpatient/wards'),
  });
}

export function useWard(id: string | undefined) {
  return useQuery<WardDetail>({
    queryKey: ['inpatient', 'wards', id],
    queryFn: () => api.get<WardDetail>(`/v1/inpatient/wards/${id}`),
    enabled: !!id,
    refetchInterval: 15000,
  });
}

export function useCreateWard() {
  const qc = useQueryClient();
  return useMutation<WardListItem, Error, CreateWardPayload>({
    mutationFn: (payload) =>
      api.post<WardListItem>('/v1/inpatient/wards', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}

// ─── Beds ───────────────────────────────────────────────────────────

export function useBeds(params: { wardId?: string; status?: BedStatus } = {}) {
  return useQuery<Bed[]>({
    queryKey: ['inpatient', 'beds', params],
    queryFn: () =>
      api.get<Bed[]>(`/v1/inpatient/beds${qs(params as Record<string, string | undefined>)}`),
    refetchInterval: 15000,
  });
}

export function useCreateBed() {
  const qc = useQueryClient();
  return useMutation<Bed, Error, CreateBedPayload>({
    mutationFn: (payload) => api.post<Bed>('/v1/inpatient/beds', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}

export function useUpdateBed() {
  const qc = useQueryClient();
  return useMutation<Bed, Error, { id: string; data: UpdateBedPayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Bed>(`/v1/inpatient/beds/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}

// ─── Admissions ─────────────────────────────────────────────────────

export function useAdmissions(params: AdmissionQueryParams = {}) {
  return useQuery<PaginatedResponse<Admission>>({
    queryKey: ['inpatient', 'admissions', params],
    queryFn: () =>
      api.get<PaginatedResponse<Admission>>(
        `/v1/inpatient/admissions${qs(params as Record<string, string | number | undefined>)}`,
      ),
    refetchInterval: 15000,
  });
}

export function useAdmission(id: string | undefined) {
  return useQuery<Admission>({
    queryKey: ['inpatient', 'admissions', id],
    queryFn: () => api.get<Admission>(`/v1/inpatient/admissions/${id}`),
    enabled: !!id,
  });
}

export function useAdmit() {
  const qc = useQueryClient();
  return useMutation<Admission, Error, CreateAdmissionPayload>({
    mutationFn: (payload) =>
      api.post<Admission>('/v1/inpatient/admissions', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}

export function useTransferBed() {
  const qc = useQueryClient();
  return useMutation<Admission, Error, { id: string; data: TransferBedPayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Admission>(`/v1/inpatient/admissions/${id}/transfer-bed`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}

export function useDischarge() {
  const qc = useQueryClient();
  return useMutation<
    Admission,
    Error,
    { id: string; data: DischargeAdmissionPayload }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<Admission>(`/v1/inpatient/admissions/${id}/discharge`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inpatient'] }),
  });
}
