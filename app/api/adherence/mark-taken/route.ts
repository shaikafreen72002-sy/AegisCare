import { NextResponse } from 'next/server';
import { getUserAdherence, markDoseTakenInStore, getActiveUserId } from '@/lib/stateStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dose_id } = body;
    const { searchParams } = new URL(req.url);
    const userId = body.user_id || searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();

    const success = markDoseTakenInStore(dose_id, 'Marked taken by user', userId);
    const adherence = getUserAdherence(userId);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return NextResponse.json({
      success,
      message: `Dose marked as taken at ${nowTime}`,
      adherence
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Mark taken error' }, { status: 500 });
  }
}
