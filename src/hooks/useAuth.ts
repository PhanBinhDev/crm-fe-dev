import { useGetIdentity } from '@refinedev/core';
import { IUser } from '@/common/types';

export const useAuth = () => {
  const { data: identity, isLoading } = useGetIdentity<IUser>();

  return {
    user: identity,
    isLoading,
    isAuthenticated: !!identity,
  };
};
