import { NextResponse } from 'next/server';
import { getUserAuditLogs, getActiveUserId } from '@/lib/stateStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') || req.headers.get('x-user-id') || getActiveUserId();
  const logs = getUserAuditLogs(userId);

  return NextResponse.json({
    total_notifications: logs.length,
    notifications: logs
  });
}
