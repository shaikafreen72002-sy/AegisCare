export interface AdherenceDecision {
  acknowledgement_count: number;
  previous_count?: number;
  adherence_status: string;
  escalation_level: 'none' | 'gentle' | 'reminder' | 'caregiver_consideration' | 'caregiver' | 'doctor';
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
        acknowledgement_count: c,
        adherence_status: 'mild_delay',
        escalation_level: 'gentle',
        action: 'send_gentle_reminder',
        reason: '1st reminder unanswered. Gentle follow-up prompt required.',
        requires_caregiver_alert: false,
        requires_doctor_alert: false
      };
    } else if (c === 2) {
      return {
        acknowledgement_count: c,
        adherence_status: 'delayed',
        escalation_level: 'reminder',
        action: 'send_clear_reminder',
        reason: '2nd reminder unanswered. Clear single-action reminder required.',
        requires_caregiver_alert: false,
        requires_doctor_alert: false
      };
    } else if (c === 3) {
      return {
        acknowledgement_count: c,
        adherence_status: 'at_risk',
        escalation_level: 'caregiver_consideration',
        action: 'flag_caregiver_consideration',
        reason: '3rd reminder unanswered. Flagging potential adherence barrier for caregiver support.',
        requires_caregiver_alert: false,
        requires_doctor_alert: false
      };
    } else if (c === 4) {
      return {
        acknowledgement_count: c,
        adherence_status: 'escalated_caregiver',
        escalation_level: 'caregiver',
        action: 'dispatch_caregiver_alert',
        reason: '4th reminder unanswered. Direct Caregiver Telegram notification triggered.',
        requires_caregiver_alert: true,
        requires_doctor_alert: false
      };
    } else {
      return {
        acknowledgement_count: c,
        adherence_status: 'escalated_doctor',
        escalation_level: 'doctor',
        action: 'dispatch_doctor_escalation',
        reason: '5th reminder unanswered. High clinical risk. Direct Physician escalation triggered.',
        requires_caregiver_alert: true,
        requires_doctor_alert: true
      };
    }
  }
}

export const adherenceEscalationAgent = new AdherenceEscalationAgent();
