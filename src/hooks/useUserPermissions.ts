import { IUser } from '@/common/types';
import { canManageUser } from '@/utils/majorGroups';
import { useCan } from '@refinedev/core';
import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const useUserPermissions = (user: IUser | undefined) => {
  const { user: identity } = useAuth();

  const defaultPermissions = {
    canEdit: false,
    canToggleStatus: false,
    canDelete: false,
    canManage: false,
    isViewOnly: true,
  };

  const { data: canEdit } = useCan({
    resource: 'users',
    action: 'edit',
    params: { id: user?.id, data: user, identity },
    queryOptions: {
      enabled: !!user,
    },
  });

  const { data: canToggleStatus } = useCan({
    resource: 'users',
    action: 'toggle-status',
    params: { id: user?.id, data: user, identity },
    queryOptions: {
      enabled: !!user,
    },
  });

  const { data: canDelete } = useCan({
    resource: 'users',
    action: 'delete',
    params: { id: user?.id, data: user, identity },
    queryOptions: {
      enabled: !!user,
    },
  });

  const canManageTarget = useMemo(() => {
    if (!user || !identity) return false;

    return canManageUser(
      identity.role,
      // identity.major,
      user?.role,
      user?.major,
      // identity?.id,
      user?.id,
    );
  }, [identity, user]);

  const isViewOnly = useMemo(() => {
    if (!user || !identity) return true;

    return !canManageTarget && identity?.id !== user?.id;
  }, [canManageTarget, identity?.id, user?.id, identity, user]);

  if (!user) {
    return defaultPermissions;
  }

  return {
    canEdit: canEdit?.can || false,
    canToggleStatus: canToggleStatus?.can || false,
    canDelete: canDelete?.can || false,
    canManage: canManageTarget,
    isViewOnly,
  };
};
