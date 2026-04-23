import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Holiday {
  id: string;
  name: string;
  date: string;
  createdAt?: string;
}

interface CreateHolidayPayload {
  name: string;
  date: string;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => api.get<Record<string, string>>('/v1/settings'),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { key: string; value: string }>({
    mutationFn: (payload) => api.put<void>('/v1/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useHolidays() {
  return useQuery<Holiday[]>({
    queryKey: ['settings', 'holidays'],
    queryFn: () => api.get<Holiday[]>('/v1/settings/holidays'),
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation<Holiday, Error, CreateHolidayPayload>({
    mutationFn: (payload) =>
      api.post<Holiday>('/v1/settings/holidays', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'holidays'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/v1/settings/holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'holidays'] });
    },
  });
}
