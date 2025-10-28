import { UserRole } from '@/common/enum/user';
import { canCreateRole, canManageUser } from '@/utils/majorGroups';
import { AccessControlProvider } from '@refinedev/core';

export const AccessControlProviderCustom: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = params?.identity;

    if (!user) {
      return { can: false, reason: 'Bạn cần đăng nhập để thực hiện hành động này.' };
    }

    const userRole = user.role as UserRole;
    const userId = user.id;
    const userMajor = user.major;

    switch (resource) {
      case 'users':
        switch (action) {
          case 'list':
          case 'show':
            return { can: true };

          case 'create':
            // Chỉ SUPERADMIN và CNBM có quyền tạo user
            const canCreate = [UserRole.SUPERADMIN, UserRole.CNBM].includes(userRole);
            return {
              can: canCreate,
              reason: canCreate ? undefined : 'Bạn không có quyền tạo người dùng mới.',
            };

          case 'create-role':
            const targetRoleForCreate = params?.targetRole as UserRole;
            const canCreateThisRole = canCreateRole(userRole, targetRoleForCreate);

            return {
              can: canCreateThisRole,
              reason: canCreateThisRole
                ? undefined
                : `Bạn không có quyền tạo người dùng với vai trò ${targetRoleForCreate}.`,
            };

          case 'edit':
            const targetUserId = params?.id as string;
            const targetUserRole = params?.data?.role as UserRole;
            const targetUserMajor = params?.data?.major;

            // TM và GV chỉ có thể edit bản thân (không bao gồm role, username, status)
            if ([UserRole.TM, UserRole.GV].includes(userRole)) {
              if (userId?.toString() === targetUserId?.toString()) {
                return { can: true };
              }
              return {
                can: false,
                reason: 'Bạn chỉ có quyền chỉnh sửa thông tin của chính mình.',
              };
            }

            const canEditUser = canManageUser(
              userRole,
              userMajor,
              targetUserRole,
              targetUserMajor,
              userId,
              targetUserId,
              'edit',
            );

            if (!canEditUser) {
              return {
                can: false,
                reason: 'Bạn không có quyền chỉnh sửa người dùng này.',
              };
            }

            return { can: true };

          case 'delete':
            const deleteTargetUserId = params?.id || params?.data?.id;
            const deleteTargetRole = params?.data?.role as UserRole;
            const deleteTargetMajor = params?.data?.major;

            // TM và GV không có quyền xóa bất kỳ ai
            if ([UserRole.TM, UserRole.GV].includes(userRole)) {
              return {
                can: false,
                reason: 'Bạn không có quyền xóa người dùng.',
              };
            }

            if (userId?.toString() === deleteTargetUserId?.toString()) {
              return {
                can: false,
                reason: 'Bạn không thể xóa chính mình.',
              };
            }

            if (deleteTargetRole === UserRole.SUPERADMIN && userRole !== UserRole.SUPERADMIN) {
              return {
                can: false,
                reason: 'Bạn không thể xóa Quản trị viên.',
              };
            }

            const canDeleteUser = canManageUser(
              userRole,
              userMajor,
              deleteTargetRole,
              deleteTargetMajor,
              userId,
              deleteTargetUserId,
              'delete',
            );

            if (!canDeleteUser) {
              return {
                can: false,
                reason: 'Bạn không có quyền xóa người dùng này.',
              };
            }

            return { can: true };

          case 'toggle-status':
            const statusTargetUserId = params?.id || params?.data?.id;
            const statusTargetRole = params?.data?.role as UserRole;
            const statusTargetMajor = params?.data?.major;

            // TM và GV không có quyền toggle status bất kỳ ai (kể cả bản thân)
            if ([UserRole.TM, UserRole.GV].includes(userRole)) {
              return {
                can: false,
                reason: 'Bạn không có quyền thay đổi trạng thái người dùng.',
              };
            }

            if (userId?.toString() === statusTargetUserId?.toString()) {
              return {
                can: false,
                reason: 'Bạn không thể thay đổi trạng thái của chính mình.',
              };
            }

            const canToggleStatusUser = canManageUser(
              userRole,
              userMajor,
              statusTargetRole,
              statusTargetMajor,
              userId,
              statusTargetUserId,
              'toggle-status',
            );

            if (!canToggleStatusUser) {
              return {
                can: false,
                reason: 'Bạn không có quyền thay đổi trạng thái người dùng này.',
              };
            }

            return { can: true };

          default:
            return { can: false };
        }

      default:
        return { can: true };
    }
  },
};
