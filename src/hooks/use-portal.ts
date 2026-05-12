import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export interface PortalNationalPatient {
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
  phone: string | null;
  address: string | null;
}

export interface PortalHospital {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  city: { id: string; name: string; nameAr?: string | null } | null;
}

export interface PortalProfileHospital {
  profileId: string;
  hospital: PortalHospital;
  bloodType?: string | null;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  registeredAt?: string;
}

export interface PortalProfile {
  nationalPatient: PortalNationalPatient;
  primaryProfileId: string;
  hospitals: PortalProfileHospital[];
}

export interface PortalDoctorBrief {
  id: string;
  specialization: string;
  user: { firstName: string | null; lastName: string | null };
}

export interface PortalAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string | null;
  reason: string | null;
  notes: string | null;
  cancelReason: string | null;
  hospitalId: string;
  doctor: PortalDoctorBrief;
  department: { id: string; name: string } | null;
  hospital: { id: string; name: string; nameAr: string | null };
}

export interface PortalPrescription {
  id: string;
  hospitalId: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
  }>;
  doctor?: PortalDoctorBrief;
  hospital: { id: string; name: string; nameAr: string | null };
}

export interface PortalLabOrder {
  id: string;
  hospitalId: string;
  testName: string;
  testCategory?: string | null;
  status: string;
  orderedAt: string;
  result?: {
    id: string;
    result: string;
    normalRange?: string | null;
    unit?: string | null;
    isAbnormal: boolean;
    reportedAt: string;
  } | null;
  doctor?: PortalDoctorBrief;
  hospital: { id: string; name: string; nameAr: string | null };
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  paidAmount: string;
  hospitalId: string;
  createdAt: string;
  items: Array<{
    id: string;
    description: string;
    category: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  hospital: { id: string; name: string; nameAr: string | null };
}

export interface PortalReferral {
  id: string;
  nationalPatientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  reason: string;
  clinicalSummary: string | null;
  createdAt: string;
  respondedAt: string | null;
  completedAt: string | null;
  fromHospital: PortalHospital;
  toHospital: PortalHospital;
}

export interface PortalNationalRecord {
  nationalPatient: PortalNationalPatient;
  hospitals: Array<{ profileId: string; hospital: PortalHospital }>;
  medicalRecords: Array<{
    id: string;
    hospitalId: string;
    diagnosis: string | null;
    chiefComplaint: string | null;
    icdCodes: string | null;
    treatmentPlan: string | null;
    createdAt: string;
    doctor: PortalDoctorBrief;
    hospital: { id: string; name: string; nameAr: string | null };
  }>;
  prescriptions: PortalPrescription[];
  labOrders: PortalLabOrder[];
}

export interface PortalListParams {
  page?: number;
  limit?: number;
  hospitalId?: string;
  status?: string;
}

function toQuery(params: PortalListParams): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.hospitalId) sp.set('hospitalId', params.hospitalId);
  if (params.status) sp.set('status', params.status);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ─── Profile ─────────────────────────────────────────────────────────

export function usePortalProfile() {
  return useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: () => api.get<PortalProfile>('/v1/me/profile'),
  });
}

export function useUpdatePortalProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<PortalNationalPatient>) =>
      api.patch<PortalProfile>('/v1/me/profile', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal'] });
    },
  });
}

export function usePortalNationalRecord() {
  return useQuery({
    queryKey: ['portal', 'national-record'],
    queryFn: () => api.get<PortalNationalRecord>('/v1/me/national-record'),
  });
}

// ─── Appointments ────────────────────────────────────────────────────

export function usePortalAppointments(params: PortalListParams = {}) {
  return useQuery({
    queryKey: ['portal', 'appointments', params],
    queryFn: () =>
      api.get<PaginatedResponse<PortalAppointment>>(
        `/v1/me/appointments${toQuery(params)}`,
      ),
  });
}

export interface BookAppointmentBody {
  hospitalId: string;
  doctorId: string;
  departmentId?: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  reason?: string;
}

export function useBookPortalAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BookAppointmentBody) =>
      api.post<PortalAppointment>('/v1/me/appointments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['portal', 'profile'] });
    },
  });
}

export function useCancelPortalAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; status: string }>(`/v1/me/appointments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'appointments'] });
    },
  });
}

// ─── Prescriptions ───────────────────────────────────────────────────

export function usePortalPrescriptions(params: PortalListParams = {}) {
  return useQuery({
    queryKey: ['portal', 'prescriptions', params],
    queryFn: () =>
      api.get<PaginatedResponse<PortalPrescription>>(
        `/v1/me/prescriptions${toQuery(params)}`,
      ),
  });
}

// ─── Lab results ─────────────────────────────────────────────────────

export function usePortalLabResults(params: PortalListParams = {}) {
  return useQuery({
    queryKey: ['portal', 'lab-results', params],
    queryFn: () =>
      api.get<PaginatedResponse<PortalLabOrder>>(
        `/v1/me/lab-results${toQuery(params)}`,
      ),
  });
}

// ─── Invoices ────────────────────────────────────────────────────────

export function usePortalInvoices(params: PortalListParams = {}) {
  return useQuery({
    queryKey: ['portal', 'invoices', params],
    queryFn: () =>
      api.get<PaginatedResponse<PortalInvoice>>(
        `/v1/me/invoices${toQuery(params)}`,
      ),
  });
}

// ─── Referrals ───────────────────────────────────────────────────────

export function usePortalReferrals() {
  return useQuery({
    queryKey: ['portal', 'referrals'],
    queryFn: () => api.get<PortalReferral[]>('/v1/me/referrals'),
  });
}

// ─── Booking pickers ─────────────────────────────────────────────────

export function usePortalHospitals() {
  return useQuery({
    queryKey: ['portal', 'hospitals'],
    queryFn: () => api.get<PortalHospital[]>('/v1/me/hospitals'),
  });
}

export interface PortalBookingDoctor {
  id: string;
  specialization: string;
  consultationFee: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  department: { id: string; name: string } | null;
}

export function usePortalDoctorsAtHospital(hospitalId: string | undefined) {
  return useQuery({
    queryKey: ['portal', 'hospital-doctors', hospitalId],
    queryFn: () =>
      api.get<PortalBookingDoctor[]>(
        `/v1/me/hospitals/${hospitalId}/doctors`,
      ),
    enabled: !!hospitalId,
  });
}
