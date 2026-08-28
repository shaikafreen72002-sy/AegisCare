/**
 * Authentication and User Session Types.
 */

export type UserRole = 'PATIENT' | 'CAREGIVER' | 'CLINICIAN';

export interface AuthUser {
  user_id: string;
  identifier: string;
  name: string;
  preferred_name: string;
  role: UserRole;
  intake_completed: boolean;
  token: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  role?: UserRole;
}
