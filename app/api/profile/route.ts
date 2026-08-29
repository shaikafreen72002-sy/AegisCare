import { NextResponse } from 'next/server';
import {
  getUserProfile,
  updateUserProfile,
  getUserAdherence,
  getActiveUserId,
  GLOBAL_ADHERENCE_STATE,
  GLOBAL_PATIENT_PROFILE
} from '@/lib/stateStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();
  const profile = getUserProfile(userId);
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();
    const body = await req.json();
    const updated = updateUserProfile(userId, body);

    // Sync global patient profile
    Object.assign(GLOBAL_PATIENT_PROFILE, updated);

    // Sync primary medication to adherence schedule
    if (body.primary_medication) {
      const adh = getUserAdherence(userId);
      adh.schedule.forEach((dose) => {
        if (body.primary_medication.name) dose.medication_name = body.primary_medication.name;
        if (body.primary_medication.dosage) dose.dosage = body.primary_medication.dosage;
      });
      GLOBAL_ADHERENCE_STATE.schedule.forEach((dose) => {
        if (body.primary_medication.name) dose.medication_name = body.primary_medication.name;
        if (body.primary_medication.dosage) dose.dosage = body.primary_medication.dosage;
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Profile error' }, { status: 500 });
  }
}
