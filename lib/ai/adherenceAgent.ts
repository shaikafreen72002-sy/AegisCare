export interface AdherenceDecision {
  acknowledgement_count: number;
  previous_count?: number;
  adherence_status: string;
  escalation_level: 'none' | 'gentle' | 'caregiver_alert' | 'doctor_escalation';
  action: string;
  reason: string;
  requires_caregiver_alert?: boolean;
  requires_doctor_alert?: boolean;
}

export class AdherenceEscalationAgent {
  private counter: number = 0;
  private maxCounter: number = 3;

  public resetCounter() {
    this.counter = 0;
  }

  public getCounter(): number {
    return this.counter;
  }

  public recordAcknowledgment(_doseId: string = 'current_dose', taken: boolean = true): AdherenceDecision {
    const prev = this.counter;
    if (taken) this.counter = 0;

    return {
      acknowledgement_count: this.counter,
      previous_count: prev,
      adherence_status: 'on_track',
      escalation_level: 'none',
      action: 'log_success',
      reason: 'Dose successfully marked as taken by patient.'
    };
  }

  public recordMissedDoseOrUnanswered(): AdherenceDecision {
    this.counter = Math.min(this.maxCounter, this.counter + 1);
    const c = this.counter;

    if (c === 1) {
      return {
        acknowledgement_count: 1,
        adherence_status: 'day_1_missed',
        escalation_level: 'gentle',
        action: 'send_patient_reminder',
        reason: 'Day 1: Medication reminder unanswered. Gentle in-app prompt and Telegram reminder sent to patient.',
        requires_caregiver_alert: false,
        requires_doctor_alert: false
      };
    } else if (c === 2) {
      return {
        acknowledgement_count: 2,
        adherence_status: 'day_2_caregiver_alert',
        escalation_level: 'caregiver_alert',
        action: 'dispatch_caregiver_alert',
        reason: 'Day 2: Patient has not taken medication for 2 consecutive days. High-priority Telegram alert dispatched to caregiver.',
        requires_caregiver_alert: true,
        requires_doctor_alert: false
      };
    } else {
      return {
        acknowledgement_count: 3,
        adherence_status: 'day_3_doctor_escalation',
        escalation_level: 'doctor_escalation',
        action: 'dispatch_doctor_escalation',
        reason: 'Day 3+: No progress after caregiver notification. Clinical telemetry and missed dose escalation sent to Dr. Aarav Mehta (Physician).',
        requires_caregiver_alert: true,
        requires_doctor_alert: true
      };
    }
  }
}

export const adherenceEscalationAgent = new AdherenceEscalationAgent();
