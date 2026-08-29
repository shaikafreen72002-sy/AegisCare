import { NextResponse } from 'next/server';
import { getUserAdherence, updateUserAdherence, getActiveUserId } from '@/lib/stateStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();
  const adherence = getUserAdherence(userId);
  return NextResponse.json(adherence);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = body.user_id || searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();

    if (body.schedule && Array.isArray(body.schedule)) {
      const updated = updateUserAdherence(userId, {
        schedule: body.schedule
      });
      return NextResponse.json({ success: true, adherence: updated });
    }

    const current = getUserAdherence(userId);
    return NextResponse.json({ success: true, adherence: current });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Failed to update schedule' }, { status: 500 });
  }
}
