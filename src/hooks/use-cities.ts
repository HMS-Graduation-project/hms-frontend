import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface City {
  id: string;
  name: string;
  nameAr: string | null;
  governorate: string | null;
  country: string;
  isActive: boolean;
  createdAt: string;
  _count?: { hospitals: number; users: number };
}

export interface CityDetail extends City {
  hospitals: Array<{
    id: string;
    code: string;
    name: string;
    nameAr: string | null;
    isActive: boolean;
  }>;
}

interface CreateCityPayload {
  name: string;
  nameAr?: string;
  governorate?: string;
  country?: string;
}

interface UpdateCityPayload {
  id: string;
  data: {
    name?: string;
    nameAr?: string;
    governorate?: string;
    country?: string;
    isActive?: boolean;
  };
}

export function useCities() {
  return useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => api.get<City[]>('/v1/cities'),
  });
}

export function useCity(id: string | undefined) {
  return useQuery<CityDetail>({
    queryKey: ['cities', id],
    queryFn: () => api.get<CityDetail>(`/v1/cities/${id}`),
    enabled: !!id,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation<City, Error, CreateCityPayload>({
    mutationFn: (payload) => api.post<City>('/v1/cities', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  return useMutation<City, Error, UpdateCityPayload>({
    mutationFn: ({ id, data }) => api.patch<City>(`/v1/cities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}
