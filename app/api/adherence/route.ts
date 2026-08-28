import { NextResponse } from 'next/server';
import { getUserAdherence, getActiveUserId } from '@/lib/stateStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();
  const adherence = getUserAdherence(userId);
  return NextResponse.json(adherence);
}
