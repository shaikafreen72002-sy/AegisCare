import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile, getActiveUserId } from '@/lib/stateStore';

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
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Profile error' }, { status: 500 });
  }
}
