import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export type ReferralStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENT';

export interface HospitalBrief {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  city: { id: string; name: string };
}

export interface DoctorBrief {
  id: string;
  specialization: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ReferralNationalPatient {
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
  chronicConditions: string | null;
  criticalAlerts: string | null;
}

export interface Referral {
  id: string;
  nationalPatientId: string;
  fromHospitalId: string;
  toHospitalId: string;
  fromDoctorId: string;
  toDoctorId: string | null;
  reason: string;
  clinicalSummary: string | null;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  respondedAt: string | null;
  responseNote: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  nationalPatient: ReferralNationalPatient;
  fromHospital: HospitalBrief;
  toHospital: HospitalBrief;
  fromDoctor: DoctorBrief;
  toDoctor: DoctorBrief | null;
}

export interface ReferralQueryParams {
  status?: ReferralStatus;
  urgency?: ReferralUrgency;
  page?: number;
  limit?: number;
}

export interface CreateReferralPayload {
  nationalPatientId: string;
  toHospitalId: string;
  reason: string;
  clinicalSummary?: string;
  urgency?: ReferralUrgency;
}

export interface AcceptReferralPayload {
  toDoctorId?: string;
  responseNote?: string;
}

export interface NotePayload {
  responseNote?: string;
}

export interface CrossHospitalProfile {
  hospital: HospitalBrief;
  profileId: string;
  medicalRecords: Array<{
    id: string;
    diagnosis: string | null;
    chiefComplaint: string | null;
    icdCodes: string | null;
    treatmentPlan: string | null;
    createdAt: string;
    doctor: {
      id: string;
      specialization: string;
      user: { firstName: string | null; lastName: string | null };
    };
  }>;
  prescriptions: Array<{
    id: string;
    status: string;
    createdAt: string;
    items: Array<{
      id: string;
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
  }>;
  labOrders: Array<{
    id: string;
    testName: string;
    status: string;
    orderedAt: string;
    result: { id: string; result: string; isAbnormal: boolean } | null;
  }>;
}

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useIncomingReferrals(params: ReferralQueryParams = {}) {
  return useQuery<PaginatedResponse<Referral>>({
    queryKey: ['referrals', 'incoming', params],
    queryFn: () =>
      api.get<PaginatedResponse<Referral>>(
        `/v1/referrals/incoming${qs(params as Record<string, string | number | undefined>)}`,
      ),
    refetchInterval: 30000,
  });
}

export function useOutgoingReferrals(params: ReferralQueryParams = {}) {
  return useQuery<PaginatedResponse<Referral>>({
    queryKey: ['referrals', 'outgoing', params],
    queryFn: () =>
      api.get<PaginatedResponse<Referral>>(
        `/v1/referrals/outgoing${qs(params as Record<string, string | number | undefined>)}`,
      ),
    refetchInterval: 30000,
  });
}

export function useReferral(id: string | undefined) {
  return useQuery<Referral>({
    queryKey: ['referrals', id],
    queryFn: () => api.get<Referral>(`/v1/referrals/${id}`),
    enabled: !!id,
  });
}

export function usePatientReferrals(nhid: string | undefined) {
  return useQuery<Referral[]>({
    queryKey: ['referrals', 'patient', nhid],
    queryFn: () =>
      api.get<Referral[]>(`/v1/referrals/patients/${nhid}`),
    enabled: !!nhid,
  });
}

export function useCrossHospitalRecords(nhid: string | undefined) {
  return useQuery<CrossHospitalProfile[]>({
    queryKey: ['referrals', 'cross-hospital', nhid],
    queryFn: () =>
      api.get<CrossHospitalProfile[]>(
        `/v1/referrals/patients/${nhid}/cross-hospital-records`,
      ),
    enabled: !!nhid,
    retry: (failureCount, error) => {
      // Don't retry on 403 (no grant) — tell the user immediately
      const e = error as { status?: number; message?: string };
      if (e?.message?.includes('No active referral')) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation<Referral, Error, CreateReferralPayload>({
    mutationFn: (payload) =>
      api.post<Referral>('/v1/referrals', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useAcceptReferral() {
  const qc = useQueryClient();
  return useMutation<Referral, Error, { id: string; data: AcceptReferralPayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Referral>(`/v1/referrals/${id}/accept`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useRejectReferral() {
  const qc = useQueryClient();
  return useMutation<Referral, Error, { id: string; data: NotePayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Referral>(`/v1/referrals/${id}/reject`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useCompleteReferral() {
  const qc = useQueryClient();
  return useMutation<Referral, Error, { id: string; data: NotePayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Referral>(`/v1/referrals/${id}/complete`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useCancelReferral() {
  const qc = useQueryClient();
  return useMutation<Referral, Error, { id: string; data: NotePayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<Referral>(`/v1/referrals/${id}/cancel`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}
