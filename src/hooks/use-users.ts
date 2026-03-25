import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  role?: string;
}

interface CreateUserPayload {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UpdateUserPayload {
  id: string;
  data: {
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

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

export function useUsers(params: UseUsersParams = {}) {
  const { page = 1, limit = 10, sortBy, sortOrder, search, role } = params;

  return useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { page, limit, sortBy, sortOrder, search, role }],
    queryFn: () =>
      api.get<PaginatedResponse<User>>(
        `/v1/users${buildQueryString({ page, limit, sortBy, sortOrder, search, role })}`
      ),
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => api.get<User>(`/v1/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: (payload) => api.post<User>('/v1/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: ({ id, data }) => api.patch<User>(`/v1/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, string>({
    mutationFn: (id) => api.patch<User>(`/v1/users/${id}/deactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
