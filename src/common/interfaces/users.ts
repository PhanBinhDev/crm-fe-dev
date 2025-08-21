import { UserRole } from '@/common/enum/user';

export interface UserFilters {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserDto {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}
