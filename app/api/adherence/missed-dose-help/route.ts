import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    gentle_prompt: 'Your medicine was not recorded. Would you like some help?',
    options: [
      { id: 'take_now', label: 'I took it just now', action: 'MARK_TAKEN' },
      { id: 'talk_assistant', label: 'Talk with Companion', action: 'OPEN_CHAT' },
      { id: 'remind_later', label: 'Remind me in 30 minutes', action: 'SNOOZE' }
    ]
  });
}
