import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/ai/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message = 'Hello', medication = 'donepezil', patient_name = 'Lakshmi' } = body;
    const response = await orchestrator.processMessage(message, medication, patient_name);
    return NextResponse.json({
      success: true,
      result: response
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Agent run error' }, { status: 500 });
  }
}
