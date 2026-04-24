import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Hospital {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  cityId: string;
  city: { id: string; name: string; nameAr: string | null };
}

export function useReferralTargets() {
  return useQuery<Hospital[]>({
    queryKey: ['hospitals', 'referral-targets'],
    queryFn: () => api.get<Hospital[]>('/v1/hospitals/referral-targets'),
    staleTime: 5 * 60 * 1000,
  });
}
