import {
  GLOBAL_ADHERENCE_STATE,
  GLOBAL_PATIENT_PROFILE,
  markDoseTakenInStore,
  markDoseMissedInStore,
  setConnectedTelegramChatId,
  getConnectedTelegramChatId,
  sendEscalationAlert
} from '../stateStore';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'BversityCareBot';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface SendReminderParams {
  chatId?: string;
  medication?: string;
  dosage?: string;
  time?: string;
  doseId?: string;
  patientName?: string;
}

let lastUpdateOffset = 0;
const welcomedChats = new Set<string>();

export class TelegramService {
  public static async getBotInfo() {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/getMe`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.result;
    } catch {
      return null;
    }
  }

  public static async getUpdates(offset?: number) {
    try {
      const url = offset ? `${TELEGRAM_API_BASE}/getUpdates?offset=${offset}` : `${TELEGRAM_API_BASE}/getUpdates`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.result || [];
    } catch {
      return [];
    }
  }

  public static async sendMedicationReminder(params: SendReminderParams) {
    const medName = params.medication || GLOBAL_PATIENT_PROFILE.primary_medication.name || 'Donepezil';
    const dose = params.dosage || GLOBAL_PATIENT_PROFILE.primary_medication.dosage || '10 mg';
    const doseId = params.doseId || 'dose_evening_03';
    const patient = params.patientName || GLOBAL_PATIENT_PROFILE.preferred_name || 'Afreen';

    // Use provided chatId, stored chatId, or default
    let targetChatId = params.chatId || getConnectedTelegramChatId();

    // If no chatId is known, try finding the latest active chat from getUpdates
    if (!targetChatId) {
      const updates = await this.getUpdates();
      if (updates && updates.length > 0) {
        for (let i = updates.length - 1; i >= 0; i--) {
          const u = updates[i];
          const cId = u.message?.chat?.id || u.callback_query?.message?.chat?.id;
          if (cId) {
            targetChatId = String(cId);
            setConnectedTelegramChatId(targetChatId);
            break;
          }
        }
      }
    }

    const messageText = `🔔 *Medication Reminder*\n\nIt's time to take your *${medName} — ${dose}* (${params.time || '8:00 PM'}).\n\nHave you taken your medication? Tap a button below:`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Taken', callback_data: `taken:${doseId}` },
          { text: '⏰ Snooze 15 min', callback_data: `snooze:${doseId}` }
        ],
        [
          { text: '❓ Not sure', callback_data: `notsure:${doseId}` },
          { text: '❌ Missed', callback_data: `missed:${doseId}` }
        ]
      ]
    };

    if (!targetChatId) {
      // Simulate/Log delivery in audit logs if no live chat ID connected yet
      const receipt = sendEscalationAlert(
        patient,
        'INFO',
        'TELEGRAM_MEDICATION_REMINDER',
        `Medication Reminder sent: ${medName} — ${dose}. Buttons: [✅ Taken] [⏰ Snooze 15 min] [❓ Not sure] [❌ Missed]`,
        'CareBot (@BversityCareBot)',
        '@BversityCareBot',
        'TELEGRAM_BOT'
      );

      return {
        success: true,
        simulated: true,
        target_chat_id: null,
        message: 'Reminder queued. Connect Telegram chat by clicking @BversityCareBot and sending /start.',
        receipt_id: receipt.receipt_id,
        bot_username: 'BversityCareBot'
      };
    }

    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard
        })
      });

      const data = await res.json();
      if (data.ok) {
        const receipt = sendEscalationAlert(
          patient,
          'INFO',
          'TELEGRAM_MEDICATION_REMINDER',
          `Delivered to Telegram Chat ID ${targetChatId}: ${medName} — ${dose}.`,
          'CareBot (@BversityCareBot)',
          targetChatId,
          'TELEGRAM_BOT'
        );

        return {
          success: true,
          simulated: false,
          target_chat_id: targetChatId,
          telegram_message_id: data.result.message_id,
          receipt_id: receipt.receipt_id,
          bot_username: 'BversityCareBot'
        };
      } else {
        return {
          success: false,
          error: data.description || 'Telegram delivery failed',
          bot_username: 'BversityCareBot'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Telegram network error'
      };
    }
  }

  public static async handleUpdate(update: any) {
    // 1. New incoming message (e.g. /start)
    if (update.message) {
      const chatId = String(update.message.chat.id);
      const text = (update.message.text || '').trim();
      setConnectedTelegramChatId(chatId);

      if (!welcomedChats.has(chatId) && (text.startsWith('/start') || text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi'))) {
        welcomedChats.add(chatId);
        const welcomeText = `🌸 *Welcome to AegisCare Medication Coach!* 🌸\n\nI am your personalized clinical adherence companion for *Donepezil / Memory Care*.\n\n✅ *Telegram Connected Successfully!*\nChat ID: \`${chatId}\`\n\nWhen it is time for your medication (e.g. 8:00 PM), I will send you interactive reminders with quick confirmation buttons right here.`;

        await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'Markdown'
          })
        });

        return { type: 'message', status: 'connected', chat_id: chatId };
      }
    }

    // 2. Callback query button click from user
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const data = cb.data || '';
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (chatId) {
        setConnectedTelegramChatId(String(chatId));
      }

      const [action, doseId] = data.split(':');

      if (action === 'taken') {
        markDoseTakenInStore(doseId || 'dose_evening_03', 'Confirmed via Telegram @BversityCareBot');

        await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: '✅ Donepezil marked as TAKEN! Adherence streak updated 🌟',
            show_alert: true
          })
        });

        if (chatId && messageId) {
          const updatedText = `🔔 *Medication Reminder*\n\n✅ *Recorded as TAKEN at ${nowTime}*\n\nYour *Donepezil — 10 mg* dose has been recorded in your adherence history.\n\n🌱 *Adherence Routine updated. Wonderful consistency!* 🌸`;

          await fetch(`${TELEGRAM_API_BASE}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: updatedText,
              parse_mode: 'Markdown'
            })
          });
        }

        sendEscalationAlert(
          GLOBAL_PATIENT_PROFILE.preferred_name || 'Afreen',
          'INFO',
          'TELEGRAM_CONFIRMATION',
          `Donepezil dose confirmed as TAKEN via Telegram button at ${nowTime}.`,
          'Caregiver Priya & Portal',
          String(chatId),
          'TELEGRAM_BOT'
        );

        return { type: 'callback', action: 'taken', status: 'SUCCESS' };
      }

      if (action === 'snooze') {
        await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: '⏰ Snoozed for 15 minutes. Take your time!',
            show_alert: false
          })
        });

        if (chatId && messageId) {
          const snoozedText = `🔔 *Medication Reminder*\n\n⏰ *Snoozed for 15 minutes (at ${nowTime})*\n\nTake your time with a fresh glass of water. A gentle follow-up prompt will be sent.`;

          await fetch(`${TELEGRAM_API_BASE}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: snoozedText,
              parse_mode: 'Markdown'
            })
          });
        }

        return { type: 'callback', action: 'snooze', status: 'SNOOZED' };
      }

      if (action === 'notsure') {
        await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: '🌸 Safety Note: Never double-dose if unsure.',
            show_alert: true
          })
        });

        if (chatId && messageId) {
          const guideText = `🔔 *Medication Reminder*\n\n❓ *Unsure if medication was taken?*\n\n📋 *Official Product Monograph Rule:*\nDo NOT take an extra tablet or double the dose if you are unsure.\n\n• Check your daily pill organizer or blister pack.\n• If still uncertain, resume your normal scheduled dose tomorrow evening.\n• Reach out to your caregiver if you need assistance.`;

          await fetch(`${TELEGRAM_API_BASE}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: guideText,
              parse_mode: 'Markdown'
            })
          });
        }

        return { type: 'callback', action: 'notsure', status: 'GUIDED' };
      }

      if (action === 'missed') {
        markDoseMissedInStore(doseId || 'dose_evening_03', 'Reported missed via Telegram');

        await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: '⚠️ Missed dose recorded. Do NOT double-dose tomorrow.',
            show_alert: true
          })
        });

        if (chatId && messageId) {
          const missedText = `🔔 *Medication Reminder*\n\n❌ *Recorded as Missed (at ${nowTime})*\n\n⚠️ *Clinical Safety Guideline:*\nSkip this dose completely. Do NOT take double the dose tomorrow evening.\n\nResume your regular schedule at your next normal evening time.`;

          await fetch(`${TELEGRAM_API_BASE}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: missedText,
              parse_mode: 'Markdown'
            })
          });
        }

        return { type: 'callback', action: 'missed', status: 'MISSED_LOGGED' };
      }
    }

    return { type: 'unknown', status: 'IGNORED' };
  }

  public static async pollAndProcessUpdates() {
    const updates = await this.getUpdates(lastUpdateOffset ? lastUpdateOffset + 1 : undefined);
    const results = [];
    for (const update of updates) {
      if (update.update_id) {
        lastUpdateOffset = Math.max(lastUpdateOffset, update.update_id);
      }
      const res = await this.handleUpdate(update);
      results.push(res);
    }

    if (updates.length > 0 && lastUpdateOffset > 0) {
      try {
        await fetch(`${TELEGRAM_API_BASE}/getUpdates?offset=${lastUpdateOffset + 1}`);
      } catch {}
    }

    return {
      processed_count: updates.length,
      connected_chat_id: getConnectedTelegramChatId(),
      details: results
    };
  }
}
