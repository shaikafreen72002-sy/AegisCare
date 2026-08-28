export type UrgencyLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NotificationAuditRecord {
  notification_id: string;
  timestamp: string;
  channel: 'WHATSAPP' | 'SMS' | 'WHATSAPP_AND_SMS';
  recipient_name: string;
  recipient_contact: string;
  urgency: UrgencyLevel;
  trigger: string;
  message: string;
  delivery_status: 'SENT' | 'FAILED' | 'PENDING';
  receipt_id: string;
  delivered_at: string;
}

export interface PatientProfile {
  patient_id: string;
  name: string;
  preferred_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi?: number;
  condition: string;
  condition_severity?: string;
  diagnosis_date: string;
  intake_completed?: boolean;
  primary_medication: {
    name: string;
    brand: string;
    dosage: string;
    frequency: string;
    instructions: string;
  };
  caregiver: {
    name: string;
    relation: string;
    phone: string;
    email: string;
    preferred_channel: string;
    alert_on_missed_dose: boolean;
    alert_on_symptoms: boolean;
  };
  physician: {
    name: string;
    specialty: string;
    clinic: string;
    phone: string;
  };
  accessibility_settings: {
    high_contrast: boolean;
    large_text: boolean;
    voice_auto_speak: boolean;
    reduced_motion: boolean;
  };
}
