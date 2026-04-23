import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface NationalPatient {
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

export interface NationalPatientProfileLink {
  id: string;
  hospitalId: string;
  hospital: {
    id: string;
    code: string;
    name: string;
    nameAr: string | null;
  };
}

export interface NationalPatientWithProfiles extends NationalPatient {
  profiles: NationalPatientProfileLink[];
}

export interface SearchNationalPatientParams {
  syrianNationalId?: string;
  q?: string;
  dateOfBirth?: string;
}

export interface CreateNationalPatientPayload {
  syrianNationalId?: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  criticalAlerts?: string;
  phone?: string;
  address?: string;
}

export type UpdateNationalPatientPayload = Partial<CreateNationalPatientPayload>;

export interface MergeNationalPatientResponse {
  winnerId: string;
  loserId: string;
  reassignedProfiles: number;
  mergedProfiles: number;
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

/**
 * Search the national registry. The query is enabled only when at least one
 * of `syrianNationalId`, `q`, or `dateOfBirth` is provided and non-empty.
 */
export function useNationalPatientSearch(params: SearchNationalPatientParams) {
  const { syrianNationalId, q, dateOfBirth } = params;
  const hasQuery =
    (!!syrianNationalId && syrianNationalId.trim() !== '') ||
    (!!q && q.trim() !== '') ||
    (!!dateOfBirth && dateOfBirth.trim() !== '');

  return useQuery<NationalPatient[]>({
    queryKey: ['national-registry', 'search', { syrianNationalId, q, dateOfBirth }],
    queryFn: () =>
      api.get<NationalPatient[]>(
        `/v1/national-registry/patients/search${buildQueryString({
          syrianNationalId,
          q,
          dateOfBirth,
        })}`,
      ),
    enabled: hasQuery,
  });
}

export function useNationalPatient(nhid: string | undefined) {
  return useQuery<NationalPatientWithProfiles>({
    queryKey: ['national-registry', nhid],
    queryFn: () =>
      api.get<NationalPatientWithProfiles>(
        `/v1/national-registry/patients/${nhid}`,
      ),
    enabled: !!nhid,
  });
}

export function useCreateNationalPatient() {
  const queryClient = useQueryClient();

  return useMutation<NationalPatient, Error, CreateNationalPatientPayload>({
    mutationFn: (payload) =>
      api.post<NationalPatient>('/v1/national-registry/patients', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['national-registry'] });
    },
  });
}

export function useUpdateNationalPatient() {
  const queryClient = useQueryClient();

  return useMutation<
    NationalPatient,
    Error,
    { nhid: string; data: UpdateNationalPatientPayload }
  >({
    mutationFn: ({ nhid, data }) =>
      api.patch<NationalPatient>(`/v1/national-registry/patients/${nhid}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['national-registry'] });
    },
  });
}

export function useMergeNationalPatient() {
  const queryClient = useQueryClient();

  return useMutation<
    MergeNationalPatientResponse,
    Error,
    { winnerId: string; loserId: string }
  >({
    mutationFn: ({ winnerId, loserId }) =>
      api.post<MergeNationalPatientResponse>(
        `/v1/national-registry/patients/${winnerId}/merge`,
        { loserId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['national-registry'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
