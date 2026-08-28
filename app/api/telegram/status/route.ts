import { NextResponse } from 'next/server';
import { TelegramService } from '@/lib/services/telegramService';
import { getConnectedTelegramChatId, setConnectedTelegramChatId } from '@/lib/stateStore';

export async function GET() {
  try {
    const botInfo = await TelegramService.getBotInfo();
    const chatId = getConnectedTelegramChatId();

    return NextResponse.json({
      ok: true,
      bot_configured: !!botInfo,
      bot_username: botInfo?.username || 'BversityCareBot',
      bot_name: botInfo?.first_name || 'CareBot',
      telegram_link: `https://t.me/${botInfo?.username || 'BversityCareBot'}`,
      connected_chat_id: chatId,
      status: chatId ? 'CONNECTED' : 'WAITING_FOR_USER_START'
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.chat_id) {
      setConnectedTelegramChatId(String(body.chat_id));
    }
    return NextResponse.json({ ok: true, connected_chat_id: getConnectedTelegramChatId() });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
