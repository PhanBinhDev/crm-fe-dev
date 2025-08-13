import { UserRole } from '@/common/enum/user';

export interface UserFilters {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
}

// Backend API expects these fields for user creation
// Based on validation errors: username, dateOfBirth, avatar are required
export interface CreateUserDto {
  name: string;        // Required: Full name
  email: string;       // Required: Email address
  username: string;    // Required: Username for login
  role: string;        // Required: User role (GV, CNBM, TM)
  phone?: string;      // Optional: Phone number (with validation)
  isActive?: boolean;  // Optional: User status (default: true)
  dateOfBirth?: string; // Optional: Date of birth
  avatar?: string;     // Optional: Avatar URL
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}
