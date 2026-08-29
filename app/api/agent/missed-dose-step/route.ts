import { NextResponse } from 'next/server';
import { adherenceEscalationAgent } from '@/lib/ai/adherenceAgent';
import { sendEscalationAlert, getActiveUserId, getUserProfile } from '@/lib/stateStore';
import { TelegramService } from '@/lib/services/telegramService';

export async function POST() {
  try {
    const userId = getActiveUserId();
    const profile = getUserProfile(userId);
    const patientName = profile.preferred_name || profile.name || 'Afreen';

    const stepResult = adherenceEscalationAgent.recordMissedDoseOrUnanswered();
    let escalationDetails = null;

    if (stepResult.requires_doctor_alert) {
      // Day 5: Clinical escalation to Doctor (Dr. Aarav Mehta) and Caregiver
      const docRes = await TelegramService.sendDoctorAlert({
        patientName,
        doctorName: profile.physician?.name || 'Dr. Aarav Mehta, MD',
        caregiverName: profile.caregiver?.name || 'Priya',
        missedDays: 5,
        medication: profile.primary_medication.name || 'Donepezil',
        dosage: profile.primary_medication.dosage || '10 mg'
      });
      escalationDetails = {
        recipient: 'Dr. Aarav Mehta, MD & Caregiver Priya',
        urgency: 'CRITICAL',
        trigger: 'DAY_5_CONSECUTIVE_MISSED_DOSE_DOCTOR_ALERT',
        summary: `CLINICAL ESCALATION: ${patientName} has missed medication for 5 consecutive days without confirmation. Telemetry logs and adherence history forwarded to Dr. Aarav Mehta.`,
        notification_status: 'SENT',
        receipt_id: docRes.receipt_id
      };
    } else if (stepResult.requires_caregiver_alert) {
      // Day 3: Urgent alert to Caregiver (Priya)
      const careRes = await TelegramService.sendCaregiverAlert({
        patientName,
        caregiverName: profile.caregiver?.name || 'Priya',
        missedDays: stepResult.acknowledgement_count,
        medication: profile.primary_medication.name || 'Donepezil',
        dosage: profile.primary_medication.dosage || '10 mg'
      });
      escalationDetails = {
        recipient: `Caregiver (${profile.caregiver?.name || 'Priya'})`,
        urgency: 'HIGH',
        trigger: `DAY_${stepResult.acknowledgement_count}_CONSECUTIVE_MISSED_DOSE_CAREGIVER_ALERT`,
        summary: `URGENT CAREGIVER ALERT: ${patientName} has not logged or confirmed medication for ${stepResult.acknowledgement_count} consecutive days. Please check in on patient immediately.`,
        notification_status: 'SENT',
        receipt_id: careRes.receipt_id
      };
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
