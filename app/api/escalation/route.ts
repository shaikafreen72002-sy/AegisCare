import { NextResponse } from 'next/server';
import { sendEscalationAlert, getActiveUserId } from '@/lib/stateStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = body.user_id || searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();

    const {
      patient_name = 'Patient',
      urgency = 'HIGH',
      trigger = 'MANUAL_PORTAL_ALERT',
      summary = 'Manual Care Team notification dispatched.',
      recipient_type = 'caregiver',
      recipient_contact = '@BversityCareBot',
      channel = 'TELEGRAM_BOT'
    } = body;

    const result = sendEscalationAlert(patient_name, urgency, trigger, summary, recipient_type, recipient_contact, channel, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Escalation error' }, { status: 500 });
  }
}
