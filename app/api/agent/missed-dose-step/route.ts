import { NextResponse } from 'next/server';
import { adherenceEscalationAgent } from '@/lib/ai/adherenceAgent';
import { sendEscalationAlert, getActiveUserId, getUserProfile } from '@/lib/stateStore';

export async function POST() {
  try {
    const userId = getActiveUserId();
    const profile = getUserProfile(userId);
    const patientName = profile.preferred_name || profile.name || 'Afreen';

    const stepResult = adherenceEscalationAgent.recordMissedDoseOrUnanswered();
    let escalationDetails = null;

    if (stepResult.requires_caregiver_alert || stepResult.requires_doctor_alert) {
      const recipientType = stepResult.requires_doctor_alert ? 'doctor_and_caregiver' : 'caregiver';
      const urgency = stepResult.requires_doctor_alert ? 'CRITICAL' : 'HIGH';
      const trigger = stepResult.requires_doctor_alert ? 'DAY_3_CONSECUTIVE_MISSED_DOSE_DOCTOR_ALERT' : 'DAY_2_CONSECUTIVE_MISSED_DOSE_CAREGIVER_ALERT';
      const summary = stepResult.requires_doctor_alert
        ? `CLINICAL ESCALATION: ${patientName} has not taken medication for 3+ consecutive days. No response after caregiver check-in. Telemetry forwarded to Dr. Aarav Mehta.`
        : `URGENT CAREGIVER ALERT: ${patientName} has not logged prescribed medication for 2 consecutive days. Immediate caregiver assistance recommended.`;

      escalationDetails = sendEscalationAlert(
        patientName,
        urgency,
        trigger,
        summary,
        recipientType,
        profile.caregiver?.phone || '@BversityCareBot',
        'TELEGRAM_BOT',
        userId
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
