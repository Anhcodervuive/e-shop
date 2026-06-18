'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

type CurrentUser = {
  userId: string;
  email: string;
  name: string;
};

type CurrentUserResponse = {
  user: CurrentUser | null;
};

export const currentUserQueryKey = ['current-user'];

export const useCurrentUser = () => {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const response = await apiClient.get<CurrentUserResponse>('/api/auth/me');
      return response.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export type { CurrentUser };
