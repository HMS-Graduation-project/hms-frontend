import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ReportingPeriod = '7d' | '30d' | '90d' | '365d';

export interface ReportingQueryParams {
  period?: ReportingPeriod;
  cityId?: string;
  limit?: number;
}

interface CityBrief {
  id: string;
  name: string;
  nameAr?: string | null;
}

interface HospitalBriefWithCity {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  city: CityBrief;
}

export interface HospitalKpiRow {
  hospital: HospitalBriefWithCity;
  totalBeds: number;
  occupiedBeds: number;
  bedOccupancyPct: number;
  openAdmissions: number;
  erVisitsInPeriod: number;
  avgTriageMinutes: number | null;
  incomingReferrals: number;
  outgoingReferrals: number;
  appointmentsInPeriod: number;
  totalPatients: number;
}

export interface RegionalSummary {
  scope: {
    role: string;
    cityId: string | null;
    city: CityBrief | null;
    period: ReportingPeriod;
    periodStart: string;
  };
  totals: {
    totalHospitals: number;
    totalBeds: number;
    occupiedBeds: number;
    openAdmissions: number;
    erVisitsInPeriod: number;
    incomingReferrals: number;
    outgoingReferrals: number;
    appointmentsInPeriod: number;
    totalPatients: number;
    bedOccupancyPct: number;
  };
  hospitals: HospitalKpiRow[];
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  dailyPatientVolume: Array<{ day: string; visits: number }>;
}

export interface CityRollupRow {
  city: CityBrief;
  hospitalCount: number;
  totalBeds: number;
  occupiedBeds: number;
  bedOccupancyPct: number;
  openAdmissions: number;
  erVisitsInPeriod: number;
  totalPatients: number;
  referralsIn: number;
  referralsOut: number;
}

export interface NationalSummary {
  scope: {
    role: string;
    cityId: string | null;
    period: ReportingPeriod;
    periodStart: string;
  };
  national: {
    totalCities: number;
    totalHospitals: number;
    nationalPatients: number;
    activeReferralsInPeriod: number;
  };
  cities: CityRollupRow[];
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  dailyPatientVolume: Array<{ day: string; visits: number }>;
}

export interface ReferralFlowResponse {
  scope: {
    role: string;
    cityId: string | null;
    period: ReportingPeriod;
    periodStart: string;
  };
  flows: Array<{
    fromCity: { id: string; name: string };
    toCity: { id: string; name: string };
    count: number;
  }>;
}

export interface DiseaseTrendsResponse {
  scope: {
    role: string;
    cityId: string | null;
    period: ReportingPeriod;
    periodStart: string;
    bucket: 'day' | 'week';
  };
  diagnoses: Array<{ diagnosis: string; count: number }>;
  series: Array<{ bucket: string; diagnosis: string; count: number }>;
}

function qs(params: ReportingQueryParams): string {
  const sp = new URLSearchParams();
  if (params.period) sp.append('period', params.period);
  if (params.cityId) sp.append('cityId', params.cityId);
  if (params.limit) sp.append('limit', String(params.limit));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useRegionalSummary(params: ReportingQueryParams = {}) {
  return useQuery<RegionalSummary>({
    queryKey: ['reporting', 'regional', params],
    queryFn: () =>
      api.get<RegionalSummary>(`/v1/reporting/regional/summary${qs(params)}`),
  });
}

export function useNationalSummary(params: ReportingQueryParams = {}) {
  return useQuery<NationalSummary>({
    queryKey: ['reporting', 'national', params],
    queryFn: () =>
      api.get<NationalSummary>(`/v1/reporting/national/summary${qs(params)}`),
  });
}

export function useReferralFlow(params: ReportingQueryParams = {}) {
  return useQuery<ReferralFlowResponse>({
    queryKey: ['reporting', 'referral-flow', params],
    queryFn: () =>
      api.get<ReferralFlowResponse>(`/v1/reporting/referral-flow${qs(params)}`),
  });
}

export function useDiseaseTrends(params: ReportingQueryParams = {}) {
  return useQuery<DiseaseTrendsResponse>({
    queryKey: ['reporting', 'disease-trends', params],
    queryFn: () =>
      api.get<DiseaseTrendsResponse>(`/v1/reporting/disease-trends${qs(params)}`),
  });
}
