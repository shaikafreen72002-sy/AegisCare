export type UserRole = 'PATIENT' | 'CAREGIVER' | 'CLINICIAN';

export interface AuthUser {
  user_id: string;
  identifier: string; // Email or phone
  name: string;
  preferred_name?: string;
  role: UserRole;
  intake_completed: boolean;
  token?: string;
}

export interface IntakeSubmission {
  name: string;
  preferred_name?: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  condition_severity?: string;
  diagnosed_condition?: string;
  diagnosis_date?: string;
  daily_medications?: string[];
  caregiver_name?: string;
  caregiver_phone?: string;
  caregiver_relation?: string;
  physician_name?: string;
  physician_phone?: string;
}

export interface RegisterRequest {
  name: string;
  identifier: string;
  password?: string;
  role?: UserRole;
}
