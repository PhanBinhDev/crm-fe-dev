import { useGetIdentity } from '@refinedev/core';
import { IUser } from '@/common/types';

export const useUser = () => {
  const { data: user, isLoading: loading, error } = useGetIdentity<IUser>();

  return {
    user: user || null,
    loading,
    error: error ? (error instanceof Error ? error : new Error('Failed to fetch user')) : null,
  };
};
