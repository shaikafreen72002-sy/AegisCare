import { NextResponse } from 'next/server';
import { TelegramService } from '@/lib/services/telegramService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await TelegramService.sendMedicationReminder({
      chatId: body.chat_id,
      medication: body.medication || 'Donepezil',
      dosage: body.dosage || '10 mg',
      time: body.time || '8:00 PM',
      doseId: body.dose_id || 'dose_evening_03',
      patientName: body.patient_name || 'Afreen'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
