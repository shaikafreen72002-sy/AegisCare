import { NextResponse } from 'next/server';
import { TelegramService } from '@/lib/services/telegramService';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const result = await TelegramService.handleUpdate(update);
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
