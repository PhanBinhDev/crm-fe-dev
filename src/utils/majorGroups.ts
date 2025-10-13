import { UserRole } from '@/common/enum/user';

export const userMajorOptions = [
  {
    label: 'Lập trình máy tính',
    value: [
      'Lập trình Web',
      'Phát triển phần mềm',
      'Lập trình Mobile',
      'Lập trình Game',
      'Xử lý dữ liệu',
      'Lập trình ứng dụng trí tuệ nhân tạo (AI)',
    ],
  },
  { label: 'CNTT Ứng dụng phần mềm', value: ['Ứng dụng phần mềm'] },
];

export const broadMajors = userMajorOptions.map(group => group.label);

export const getCreatableMajorOptions = (
  creatorRole: UserRole | undefined,
  creatorMajor: string | undefined,
  targetRole: UserRole | undefined,
) => {
  if (!creatorRole || !targetRole) return [];

  if (creatorRole === UserRole.SUPERADMIN) {
    return getMajorOptionsForRole(targetRole);
  }

  if (creatorRole === UserRole.TM) {
    if (isBroadMajor(creatorMajor)) {
      const narrowMajors = getNarrowMajorsFromBroad(creatorMajor);

      if (targetRole === UserRole.TM) {
        return [{ label: creatorMajor!, value: creatorMajor! }];
      }

      return narrowMajors.map(major => ({
        label: `${creatorMajor} - ${major}`,
        value: major,
      }));
    }

    return [{ label: getMajorDisplayName(creatorMajor), value: creatorMajor! }];
  }

  if (creatorRole === UserRole.CNBM && targetRole === UserRole.GV) {
    return [{ label: getMajorDisplayName(creatorMajor), value: creatorMajor! }];
  }

  return [];
};

export const getMajorOptionsForRole = (role: UserRole) => {
  if (role === UserRole.SUPERADMIN || role === UserRole.TM) {
    return userMajorOptions.map(group => ({
      label: group.label,
      value: group.label,
    }));
  }

  return userMajorOptions.flatMap(group =>
    group.value.map(sub => ({
      label: `${group.label} - ${sub}`,
      value: sub,
    })),
  );
};

export const majorSelectOptions = userMajorOptions.flatMap(group =>
  group.value.map(sub => ({
    label: `${group.label} - ${sub}`,
    value: sub,
  })),
);

export const isBroadMajor = (major: string | undefined): boolean => {
  if (!major) return false;
  return broadMajors.includes(major);
};

export const getBroadMajorFromNarrow = (narrowMajor: string | undefined): string | null => {
  if (!narrowMajor) return null;
  for (const group of userMajorOptions) {
    if (group.value.includes(narrowMajor)) {
      return group.label;
    }
  }
  return null;
};

export const getNarrowMajorsFromBroad = (broadMajor: string | undefined): string[] => {
  if (!broadMajor) return [];
  const group = userMajorOptions.find(g => g.label === broadMajor);
  return group ? group.value : [];
};

export const isSameMajorGroup = (
  major1: string | undefined,
  major2: string | undefined,
): boolean => {
  if (!major1 || !major2) return false;
  if (major1 === major2) return true;

  if (isBroadMajor(major1)) {
    const narrowMajors = getNarrowMajorsFromBroad(major1);
    return narrowMajors.includes(major2);
  }

  if (isBroadMajor(major2)) {
    const narrowMajors = getNarrowMajorsFromBroad(major2);
    return narrowMajors.includes(major1);
  }

  const broad1 = getBroadMajorFromNarrow(major1);
  const broad2 = getBroadMajorFromNarrow(major2);
  return broad1 === broad2 && broad1 !== null;
};

export const canManageUser = (
  userRole: UserRole | undefined,
  userMajor: string | undefined,
  targetRole: UserRole | undefined,
  targetMajor: string | undefined,
  userId?: string,
  targetUserId?: string,
  action?: 'edit' | 'delete' | 'toggle-status' | 'view',
): boolean => {
  if (!userRole || !targetRole) return false;

  const isManagingSelf = userId === targetUserId;

  if (isManagingSelf && (action === 'edit' || action === 'toggle-status' || action === 'delete')) {
    return action !== 'delete' && action !== 'toggle-status';
  }

  if (isManagingSelf && action === 'view') return true;

  if (userRole === UserRole.SUPERADMIN) return true;

  if (userRole === UserRole.TM) {
    if (targetRole === UserRole.SUPERADMIN) return false;
    if (targetRole === UserRole.TM && !isManagingSelf) return false;
    return isSameMajorGroup(userMajor, targetMajor);
  }

  if (userRole === UserRole.CNBM) {
    if (targetRole !== UserRole.GV && !isManagingSelf) return false;
    return userMajor === targetMajor || isManagingSelf;
  }

  if (userRole === UserRole.GV) {
    return isManagingSelf && action === 'view';
  }

  return false;
};

export const getCreatableRoles = (userRole: UserRole | undefined): UserRole[] => {
  if (!userRole) return [];

  switch (userRole) {
    case UserRole.SUPERADMIN:
      return [UserRole.TM, UserRole.CNBM, UserRole.GV];
    case UserRole.TM:
      return [UserRole.CNBM, UserRole.GV];
    case UserRole.CNBM:
      return [UserRole.GV];
    default:
      return [];
  }
};

export const getEditableRoles = (
  editorRole: UserRole | undefined,
  currentRole: UserRole | undefined,
  isEditingSelf: boolean,
): UserRole[] => {
  if (!editorRole || !currentRole) return [];

  if (isEditingSelf) return [];

  if (editorRole === UserRole.SUPERADMIN) {
    return [UserRole.SUPERADMIN, UserRole.TM, UserRole.CNBM, UserRole.GV];
  }

  if (editorRole === UserRole.TM) {
    if (currentRole === UserRole.SUPERADMIN || currentRole === UserRole.TM) {
      return [];
    }
    return [UserRole.CNBM, UserRole.GV];
  }

  if (editorRole === UserRole.CNBM) {
    if (currentRole === UserRole.GV) {
      return [UserRole.GV];
    }
    return [];
  }

  return [];
};

export const canCreateRole = (userRole: UserRole | undefined, targetRole: UserRole): boolean => {
  const creatableRoles = getCreatableRoles(userRole);
  return creatableRoles.includes(targetRole);
};

export const getMajorDisplayName = (major: string | undefined): string => {
  if (!major) return '';

  if (isBroadMajor(major)) {
    return major;
  }

  const broadMajor = getBroadMajorFromNarrow(major);
  return broadMajor ? `${broadMajor} - ${major}` : major;
};
