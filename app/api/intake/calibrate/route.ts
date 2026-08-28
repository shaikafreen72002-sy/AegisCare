import { NextResponse } from 'next/server';
import { intakeCalibrationAgent } from '@/lib/ai/intakeAgent';
import {
  getUserProfile,
  updateUserProfile,
  getUserAdherence,
  updateUserAdherence,
  getActiveUserId,
  REGISTERED_USERS
} from '@/lib/stateStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = body.user_id || searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();

    const result = await intakeCalibrationAgent.calibrateIntakeProfile(body);

    const medName = body.current_medication_name || body.primary_medication?.name || 'Donepezil';
    const medDosage = body.dosage || body.primary_medication?.dosage || '10 mg';
    const eveningTime = body.preferred_evening_time || '20:00';

    // 1. Update user profile
    const updatedProfile = updateUserProfile(userId, {
      name: body.name || body.preferred_name || 'Patient',
      preferred_name: body.preferred_name || body.name || 'Patient',
      age: Number(body.age) || 0,
      gender: body.gender || 'Not specified',
      height_cm: Number(body.height_cm) || 0,
      weight_kg: Number(body.weight_kg) || 0,
      bmi: result.bmi,
      condition: body.diagnosed_condition || "Mild Cognitive Impairment",
      condition_severity: body.condition_severity || 'Early Stage Support',
      diagnosis_date: body.diagnosis_date || 'Recently Assessed',
      primary_medication: {
        name: medName,
        brand: body.brand || 'Aricept',
        dosage: medDosage,
        schedule_time: eveningTime,
        instructions: `Take orally once daily at ${eveningTime} with a glass of water.`
      },
      caregiver: {
        name: body.caregiver_name || '',
        relation: body.caregiver_relation || 'Primary Caregiver',
        phone: body.caregiver_phone || '',
        email: body.caregiver_email || '',
        preferred_channel: 'TELEGRAM_BOT'
      },
      physician: {
        name: body.physician_name || 'Dr. Aarav Mehta, MD',
        clinic: body.physician_clinic || 'Apollo Geriatric Neurology Clinic',
        phone: body.physician_phone || '+1 (555) 890-1234',
        email: body.physician_email || 'dr.mehta@apollogeriatrics.org'
      },
      emergency_protocol: 'If severe confusion or dizziness occurs, sit safely and notify caregiver or emergency team.'
    });

    // 2. Build personalized adherence schedule for this user
    const prefName = body.preferred_name || body.name || 'Patient';
    updateUserAdherence(userId, {
      growth_stage: 2,
      garden_name: `${prefName}'s Routine Care`,
      routine_message: `🌱 Personalized routine calibrated for ${prefName} with ${medName} ${medDosage}.`,
      schedule: [
        {
          id: `dose_morning_${userId}`,
          time_slot: 'Morning (8:00 AM)',
          scheduled_time: '08:00',
          medication_name: 'Morning Hydration & Wellness',
          dosage: '1 glass',
          status: 'TAKEN',
          taken_at: '08:00 AM',
          instructions: 'Gentle start to the day with warm water or tea.',
          color: 'emerald'
        },
        {
          id: `dose_evening_${userId}`,
          time_slot: `Evening (${eveningTime})`,
          scheduled_time: eveningTime,
          medication_name: medName,
          dosage: medDosage,
          status: 'DUE',
          taken_at: null,
          instructions: `Take orally with water or an evening snack.`,
          color: 'indigo'
        }
      ],
      history: [
        { date: new Date().toISOString().split('T')[0], status: 'IN_PROGRESS', doses_taken: 1, total_doses: 2 }
      ]
    });

    // 3. Mark user intake completed
    const user = REGISTERED_USERS.find((u) => u.user_id === userId);
    if (user) {
      user.intake_completed = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Intake profile calibrated successfully and saved to user account.',
      profile: updatedProfile,
      calibration: result
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Intake calibration error' }, { status: 500 });
  }
}
