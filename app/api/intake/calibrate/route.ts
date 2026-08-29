import { NextResponse } from 'next/server';
import { intakeCalibrationAgent } from '@/lib/ai/intakeAgent';
import {
  getUserProfile,
  updateUserProfile,
  getUserAdherence,
  updateUserAdherence,
  getActiveUserId,
  REGISTERED_USERS,
  GLOBAL_ADHERENCE_STATE,
  GLOBAL_PATIENT_PROFILE
} from '@/lib/stateStore';
import { DoseScheduleItem } from '@/lib/types/adherence';

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
        instructions: `Take orally once daily with a glass of water.`
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

    // Sync global patient profile
    Object.assign(GLOBAL_PATIENT_PROFILE, updatedProfile);

    // 2. Build personalized adherence schedule for this user with ONLY their inputted timings
    const prefName = body.preferred_name || body.name || 'Patient';
    const colors = ['emerald', 'sky', 'indigo', 'purple', 'amber', 'rose'];

    // Sort timings chronologically by time
    const rawTimings = (body.medication_timings && Array.isArray(body.medication_timings) && body.medication_timings.length > 0)
      ? [...body.medication_timings].sort((a, b) => (a.time || '20:00').localeCompare(b.time || '20:00'))
      : [
          { id: 't_evening', label: 'Evening Dose', time: eveningTime, instructions: 'Take after dinner or before retiring with water.' }
        ];

    const scheduleItems: DoseScheduleItem[] = rawTimings.map((slot: any, idx: number) => {
      const slotTime = slot.time || '20:00';
      const [h, m] = slotTime.split(':');
      const hourNum = parseInt(h, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      const formattedTime = `${displayHour}:${m || '00'} ${period} IST`;

      let defaultInstruction = `Take orally at ${formattedTime} with water.`;
      if (hourNum < 12) {
        defaultInstruction = `☕ Take with or after breakfast / morning tea with water.`;
      } else if (hourNum < 17) {
        defaultInstruction = `🍽️ Take 30 mins after midday lunch with a glass of water.`;
      } else {
        defaultInstruction = `🌙 Take after dinner or before retiring with a glass of water.`;
      }

      return {
        id: `dose_${slot.id || idx}_${userId}`,
        time_slot: `${slot.label || `Dose ${idx + 1}`} (${formattedTime})`,
        scheduled_time: slotTime,
        medication_name: medName,
        dosage: medDosage,
        status: 'DUE' as const,
        taken_at: null,
        instructions: slot.instructions || defaultInstruction,
        color: colors[idx % colors.length]
      };
    });

    const updatedAdherence = updateUserAdherence(userId, {
      growth_stage: 1,
      garden_name: `${prefName}'s Routine Care`,
      routine_message: `🌱 Daily routine active for ${prefName} with ${medName} ${medDosage} across ${scheduleItems.length} scheduled dose(s).`,
      schedule: scheduleItems,
      history: [
        { date: new Date().toISOString().split('T')[0], status: 'IN_PROGRESS', doses_taken: 0, total_doses: scheduleItems.length }
      ]
    });

    // Sync global adherence state
    GLOBAL_ADHERENCE_STATE.schedule = [...scheduleItems];
    GLOBAL_ADHERENCE_STATE.growth_stage = 1;
    GLOBAL_ADHERENCE_STATE.routine_message = `🌱 Daily routine active for ${prefName} with ${medName} ${medDosage} across ${scheduleItems.length} scheduled dose(s).`;
    GLOBAL_ADHERENCE_STATE.history = [
      { date: new Date().toISOString().split('T')[0], status: 'IN_PROGRESS', doses_taken: 0, total_doses: scheduleItems.length }
    ];

    // 3. Mark user intake completed
    const user = REGISTERED_USERS.find((u) => u.user_id === userId);
    if (user) {
      user.intake_completed = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Intake profile calibrated successfully and saved to user account.',
      profile: updatedProfile,
      adherence: updatedAdherence,
      calibration: result
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Intake calibration error' }, { status: 500 });
  }
}
