import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/ai/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, medication = 'donepezil', patient_name = 'Lakshmi' } = body;

    if (!message) {
      return NextResponse.json({ detail: 'Message content is required.' }, { status: 400 });
    }

    const response = await orchestrator.processMessage(message, medication, patient_name);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ detail: `AI Orchestration error: ${error?.message || error}` }, { status: 500 });
  }
}
