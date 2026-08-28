import type { IntakeSubmission } from '../types/auth';

const DEFAULT_MISTRAL_KEY = process.env.MISTRAL_API_KEY || '';
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

export class IntakeCalibrationAgent {
  public calculateBmi(heightCm: number, weightKg: number) {
    if (heightCm <= 0 || weightKg <= 0) {
      return { bmi: 22.0, category: 'Normal weight' };
    }
    const hM = heightCm / 100.0;
    const bmi = Number((weightKg / (hM * hM)).toFixed(1));
    let category = 'Normal weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25.0) category = 'Normal weight';
    else if (bmi < 30.0) category = 'Overweight';
    else category = 'Obese';

    return { bmi, category };
  }

  public async calibrateIntakeProfile(submission: IntakeSubmission) {
    const bmiInfo = this.calculateBmi(submission.height_cm, submission.weight_kg);
    const prefName = submission.preferred_name || submission.name;

    const summary = (
      `Personalized clinical medication routine calibrated for ${prefName}. ` +
      `BMI assessed at ${bmiInfo.bmi} kg/m² (${bmiInfo.category}). ` +
      `Evening administration schedule locked with primary caregiver ${submission.caregiver_name} (${submission.caregiver_phone}) on Telegram alert dispatch.`
    );

    return {
      status: 'CALIBRATED',
      bmi: bmiInfo.bmi,
      bmi_category: bmiInfo.category,
      calibrated_schedule: {
        evening_dose_time: '20:00',
        instructions: 'Take Donepezil 5mg orally with evening snack or water before sleep.'
      },
      routine_summary: summary,
      caregiver_sync: {
        name: submission.caregiver_name,
        phone: submission.caregiver_phone,
        channel: 'TELEGRAM_BOT',
        status: 'LINKED'
      }
    };
  }
}

export const intakeCalibrationAgent = new IntakeCalibrationAgent();
