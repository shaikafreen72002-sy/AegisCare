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
  private maxCounter: number = 5;

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
        adherence_status: 'day_2_missed',
        escalation_level: 'gentle',
        action: 'send_patient_reminder',
        reason: 'Day 2: Second consecutive missed dose. Gentle reassurance and safety guideline sent to patient.',
        requires_caregiver_alert: false,
        requires_doctor_alert: false
      };
    } else if (c === 3 || c === 4) {
      return {
        acknowledgement_count: c,
        adherence_status: `day_${c}_caregiver_alert`,
        escalation_level: 'caregiver_alert',
        action: 'dispatch_caregiver_alert',
        reason: `Day ${c}: Patient has not taken medication for ${c} consecutive days. Urgent Telegram alert dispatched to Caregiver Priya to check in on patient.`,
        requires_caregiver_alert: true,
        requires_doctor_alert: false
      };
    } else {
      return {
        acknowledgement_count: 5,
        adherence_status: 'day_5_doctor_escalation',
        escalation_level: 'doctor_escalation',
        action: 'dispatch_doctor_escalation',
        reason: 'Day 5: Patient has missed medication for 5 consecutive days. Critical clinical escalation dispatched to Dr. Aarav Mehta (Physician) and Apollo Clinical Hub.',
        requires_caregiver_alert: true,
        requires_doctor_alert: true
      };
    }
  }
}

export const adherenceEscalationAgent = new AdherenceEscalationAgent();
