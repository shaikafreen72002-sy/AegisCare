export type DoseStatus = 'UPCOMING' | 'DUE' | 'TAKEN' | 'MISSED';

export interface DoseScheduleItem {
  id: string;
  time_slot: string;
  scheduled_time: string;
  medication_name: string;
  dosage: string;
  status: DoseStatus;
  taken_at?: string | null;
  instructions: string;
  color?: string;
}

export interface AdherenceDayLog {
  date: string;
  status: 'COMPLETED' | 'MISSED_ASSISTED' | 'IN_PROGRESS';
  doses_taken: number;
  total_doses: number;
}

export interface AdherenceState {
  today: string;
  growth_stage: number; // 1 to 5
  garden_name: string;
  routine_message: string;
  schedule: DoseScheduleItem[];
  history: AdherenceDayLog[];
}
