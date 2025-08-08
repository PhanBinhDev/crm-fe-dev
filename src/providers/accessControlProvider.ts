import { AccessControlProvider } from '@refinedev/core';
import { UserRole } from '@/common/enum/user';

// Role hierarchy: TM > CNBM > GV
const ROLE_HIERARCHY = {
  [UserRole.TM]: 3, // Trưởng môn - highest authority
  [UserRole.CNBM]: 2, // Chủ nhiệm bộ môn - middle authority
  [UserRole.GV]: 1, // Giáo viên - lowest authority
};

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = params?.identity;

    if (!user) {
      return { can: false, reason: 'User not authenticated' };
    }

    const userRole = user.role as UserRole;
    const userId = user.id;

    // Handle different resources and actions
    switch (resource) {
      case 'users':
        switch (action) {
          case 'list':
          case 'show':
            // All authenticated users can view users
            return { can: true };

          case 'create':
            // Only TM and CNBM can create users
            return {
              can: userRole === UserRole.TM || userRole === UserRole.CNBM,
              reason:
                userRole === UserRole.GV
                  ? 'Chỉ Trưởng môn và Chủ nhiệm bộ môn mới có thể tạo người dùng mới.'
                  : undefined,
            };

          case 'edit':
            const targetUserId = params?.id;

            // User can always edit their own profile
            if (userId === targetUserId) {
              return { can: true };
            }

            // Only TM can edit other users
            return {
              can: userRole === UserRole.TM,
              reason:
                userRole !== UserRole.TM
                  ? 'Bạn chỉ có thể chỉnh sửa thông tin cá nhân của mình. Trưởng môn có thể chỉnh sửa thông tin của tất cả người dùng.'
                  : undefined,
            };

          case 'delete':
            const targetUserData = params?.data;
            const targetRole = targetUserData?.role as UserRole;

            // Only TM can delete users and cannot delete users with equal or higher role
            return {
              can:
                userRole === UserRole.TM &&
                targetRole &&
                ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole],
              reason:
                userRole !== UserRole.TM
                  ? 'Chỉ Trưởng môn mới có thể xóa người dùng.'
                  : 'Bạn không thể xóa người dùng có cấp bậc tương đương hoặc cao hơn.',
            };

          case 'toggle-status':
            const statusTargetUserData = params?.data;
            const statusTargetRole = statusTargetUserData?.role as UserRole;

            // TM can toggle anyone's status
            if (userRole === UserRole.TM) {
              return { can: true };
            }

            // CNBM can toggle GV status only
            if (userRole === UserRole.CNBM && statusTargetRole === UserRole.GV) {
              return { can: true };
            }

            return {
              can: false,
              reason: `Trưởng môn có thể thay đổi trạng thái tất cả người dùng. Chủ nhiệm bộ môn chỉ có thể thay đổi trạng thái của Giáo viên.`,
            };

          default:
            return { can: false };
        }

      default:
        // For other resources, allow access by default
        return { can: true };
    }
  },
};
