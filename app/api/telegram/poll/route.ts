import { NextResponse } from 'next/server';
import { TelegramService } from '@/lib/services/telegramService';

export async function GET() {
  try {
    const result = await TelegramService.pollAndProcessUpdates();
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await TelegramService.pollAndProcessUpdates();
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
