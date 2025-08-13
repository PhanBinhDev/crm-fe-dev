import { useGetIdentity } from '@refinedev/core';
import { IUser } from '@/common/types';

export const useAuth = () => {
  const { data: identity, isLoading } = useGetIdentity<IUser>({
    queryOptions: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  });

  return {
    user: identity,
    isLoading,
    isAuthenticated: !!identity,
  };
};
