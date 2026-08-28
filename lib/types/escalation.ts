export type UrgencyLevel = 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CaregiverContact {
  name: string;
  relation: string;
  phone: string;
  email: string;
  preferred_channel: 'TELEGRAM' | 'TELEGRAM_BOT' | 'PHONE' | 'SMS';
}

export interface PhysicianContact {
  name: string;
  clinic: string;
  phone: string;
  email: string;
}

export interface MedicationInfo {
  name: string;
  brand: string;
  dosage: string;
  schedule_time: string;
  instructions: string;
}

export interface PatientProfile {
  patient_id: string;
  name: string;
  preferred_name?: string;
  age: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  diagnosis_date?: string;
  condition_severity?: string;
  condition: string;
  primary_medication: MedicationInfo;
  caregiver: CaregiverContact;
  physician: PhysicianContact;
  emergency_protocol: string;
}

export interface NotificationAuditRecord {
  notification_id: string;
  timestamp: string;
  channel: 'TELEGRAM_BOT' | 'TELEGRAM' | 'CLINICAL_PORTAL' | 'SMS';
  recipient_name: string;
  recipient_contact: string;
  urgency: UrgencyLevel;
  trigger: string;
  message: string;
  delivery_status: 'SENT' | 'DELIVERED' | 'QUEUED';
  receipt_id: string;
  delivered_at: string;
}
