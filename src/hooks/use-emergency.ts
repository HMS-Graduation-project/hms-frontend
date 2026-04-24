import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export type TriageLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE';

export type EmergencyStatus =
  | 'ARRIVED'
  | 'IN_TRIAGE'
  | 'IN_TREATMENT'
  | 'DISCHARGED'
  | 'ADMITTED'
  | 'TRANSFERRED'
  | 'LEFT_WITHOUT_BEING_SEEN';

export type Disposition =
  | 'DISCHARGED'
  | 'ADMITTED'
  | 'TRANSFERRED'
  | 'LEFT_WITHOUT_BEING_SEEN';

export interface EmergencyNationalPatient {
  id: string;
  syrianNationalId: string | null;
  firstName: string;
  lastName: string;
  firstNameAr: string | null;
  lastNameAr: string | null;
  dateOfBirth: string;
  gender: string;
  bloodType: string | null;
  allergies: string | null;
  criticalAlerts: string | null;
}

export interface EmergencyVisit {
  id: string;
  hospitalId: string;
  displayName: string;
  chiefComplaint: string;
  arrivedAt: string;
  triageLevel: TriageLevel | null;
  triagedById: string | null;
  triagedAt: string | null;
  triageNotes: string | null;
  claimedAt: string | null;
  attendingDoctorId: string | null;
  status: EmergencyStatus;
  dispositionNotes: string | null;
  closedAt: string | null;
  nationalPatientId: string | null;
  nationalPatient: EmergencyNationalPatient | null;
  patientProfileId: string | null;
  patientProfile: { id: string; hospitalId: string } | null;
  triagedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  } | null;
  attendingDoctor: {
    id: string;
    specialization: string;
    user: { id: string; firstName: string | null; lastName: string | null };
  } | null;
  medicalRecord: { id: string } | null;
}

export interface UseEmergencyVisitsParams {
  status?: string;
  triageLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateEmergencyVisitPayload {
  displayName: string;
  chiefComplaint: string;
  nationalPatientId?: string;
  patientProfileId?: string;
}

export interface TriageEmergencyVisitPayload {
  triageLevel: TriageLevel;
  triageNotes?: string;
}

export interface DispositionEmergencyVisitPayload {
  disposition: Disposition;
  dispositionNotes?: string;
}

export interface LinkEmergencyPatientPayload {
  nationalPatientId?: string;
  patientProfileId?: string;
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

export function useEmergencyVisits(params: UseEmergencyVisitsParams = {}) {
  const { status, triageLevel, page, limit, sortBy, sortOrder } = params;

  return useQuery<PaginatedResponse<EmergencyVisit>>({
    queryKey: [
      'emergency',
      'visits',
      { status, triageLevel, page, limit, sortBy, sortOrder },
    ],
    queryFn: () =>
      api.get<PaginatedResponse<EmergencyVisit>>(
        `/v1/emergency/visits${buildQueryString({
          status,
          triageLevel,
          page,
          limit,
          sortBy,
          sortOrder,
        })}`,
      ),
    refetchInterval: 15000,
  });
}

export function useEmergencyVisit(id: string | undefined) {
  return useQuery<EmergencyVisit>({
    queryKey: ['emergency', 'visits', id],
    queryFn: () => api.get<EmergencyVisit>(`/v1/emergency/visits/${id}`),
    enabled: !!id,
  });
}

export function useCreateEmergencyVisit() {
  const queryClient = useQueryClient();

  return useMutation<EmergencyVisit, Error, CreateEmergencyVisitPayload>({
    mutationFn: (payload) =>
      api.post<EmergencyVisit>('/v1/emergency/visits', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency'] });
    },
  });
}

export function useTriageEmergencyVisit() {
  const queryClient = useQueryClient();

  return useMutation<
    EmergencyVisit,
    Error,
    { id: string; data: TriageEmergencyVisitPayload }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<EmergencyVisit>(`/v1/emergency/visits/${id}/triage`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency'] });
    },
  });
}

export function useClaimEmergencyVisit() {
  const queryClient = useQueryClient();

  return useMutation<EmergencyVisit, Error, { id: string }>({
    mutationFn: ({ id }) =>
      api.patch<EmergencyVisit>(`/v1/emergency/visits/${id}/claim`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency'] });
    },
  });
}

export function useDispositionEmergencyVisit() {
  const queryClient = useQueryClient();

  return useMutation<
    EmergencyVisit,
    Error,
    { id: string; data: DispositionEmergencyVisitPayload }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<EmergencyVisit>(
        `/v1/emergency/visits/${id}/disposition`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency'] });
    },
  });
}

export function useLinkEmergencyPatient() {
  const queryClient = useQueryClient();

  return useMutation<
    EmergencyVisit,
    Error,
    { id: string; data: LinkEmergencyPatientPayload }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<EmergencyVisit>(
        `/v1/emergency/visits/${id}/link-patient`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency'] });
    },
  });
}
