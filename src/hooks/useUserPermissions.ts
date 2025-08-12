import { useCan } from '@refinedev/core';
import { IUser } from '@/common/types';
import { useAuth } from './useAuth';

export const useUserPermissions = (user: IUser) => {
  const { user: identity } = useAuth();

  const { data: canEdit } = useCan({
    resource: 'users',
    action: 'edit',
    params: { id: user.id, identity },
  });

  const { data: canToggleStatus } = useCan({
    resource: 'users',
    action: 'toggle-status',
    params: { data: user, identity },
  });

  const { data: canDelete } = useCan({
    resource: 'users',
    action: 'delete',
    params: { data: user, identity },
  });

  return {
    canEdit: canEdit?.can || false,
    canToggleStatus: canToggleStatus?.can || false,
    canDelete: canDelete?.can || false,
  };
};
