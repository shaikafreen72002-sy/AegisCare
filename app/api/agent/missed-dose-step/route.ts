import { NextResponse } from 'next/server';
import { adherenceEscalationAgent } from '@/lib/ai/adherenceAgent';
import { sendEscalationAlert } from '@/lib/stateStore';

export async function POST() {
  try {
    const stepResult = adherenceEscalationAgent.recordMissedDoseOrUnanswered();
    let escalationDetails = null;

    if (stepResult.requires_caregiver_alert || stepResult.requires_doctor_alert) {
      const recipientType = stepResult.requires_doctor_alert ? 'doctor_and_caregiver' : 'caregiver';
      const urgency = stepResult.requires_doctor_alert ? 'CRITICAL' : 'HIGH';

      escalationDetails = sendEscalationAlert(
        'Lakshmi Amma',
        urgency,
        `STEP_${stepResult.acknowledgement_count}_UNANSWERED_REMINDER`,
        `Patient has missed ${stepResult.acknowledgement_count} consecutive medication reminders for evening dose.`,
        recipientType
      );
    }

    return NextResponse.json({
      success: true,
      step: stepResult.acknowledgement_count,
      decision: stepResult,
      escalation_details: escalationDetails
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Missed dose step error' }, { status: 500 });
  }
}
