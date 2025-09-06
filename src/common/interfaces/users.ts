import { UserRole } from '@/common/enum/user';

export interface UserFilters {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  phone: string;
  major?: string;
  dateOfBirth?: string;
  role: string;
  isActive?: boolean;
  avatar?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}
