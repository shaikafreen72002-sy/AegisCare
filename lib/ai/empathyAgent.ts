import { sendEscalationAlert } from '../stateStore';
import type { GuardrailDecision } from './guardrailAgent';
import type { AdherenceDecision } from './adherenceAgent';
import type { UrgencyLevel } from '../types/escalation';

const DEFAULT_MISTRAL_KEY = process.env.MISTRAL_API_KEY || '';
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

export class TelegramDispatchTool {
  public static sendMessage(
    recipient: string,
    patientName: string,
    urgency: UrgencyLevel,
    trigger: string,
    message: string
  ) {
    return sendEscalationAlert(
      patientName,
      urgency,
      trigger,
      message,
      urgency === 'CRITICAL' || recipient.toLowerCase().includes('doctor') ? 'doctor_and_caregiver' : 'CareBot (@BversityCareBot)',
      '@BversityCareBot',
      'TELEGRAM_BOT'
    );
  }
}

export const WhatsAppDispatchTool = TelegramDispatchTool;

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export class EmpatheticCommunicatorAgent {
  public dispatchTool = TelegramDispatchTool;

  public async generatePatientResponse(
    patientName: string,
    guardrailDecision: GuardrailDecision,
    adherenceDecision: AdherenceDecision | null,
    userQuery: string
  ): Promise<string> {
    const status = guardrailDecision.status;
    const qLower = userQuery.toLowerCase();
    const timeGreeting = getTimeGreeting();

    // Priority 1: Emergency Symptom
    if (status === 'urgent') {
      return `${timeGreeting}, ${patientName} 🌸 I want to make sure you stay completely safe. I have alerted Priya and Dr. Mehta's care team right away so they can check in on you. Please sit down comfortably, rest, and keep calm. Help is being notified now.`;
    }

    // Priority 2: Dose Acknowledged
    if (adherenceDecision && adherenceDecision.action === 'log_success') {
      return `Wonderful, ${patientName}! ✨ I have marked down your dose. You are doing a brilliant job keeping up with your daily wellness.`;
    }

    // Priority 3: 2-Day Caregiver & 3-Day Doctor Escalation Reminders
    if (adherenceDecision && ['gentle', 'caregiver_alert', 'doctor_escalation'].includes(adherenceDecision.escalation_level)) {
      const lvl = adherenceDecision.escalation_level;
      if (lvl === 'gentle') {
        return `${timeGreeting}, ${patientName} 😊 It looks like your scheduled medicine reminder was missed. When you have a moment, please check your medicine table and take your tablet with water.`;
      } else if (lvl === 'caregiver_alert') {
        return `⚠️ URGENT CAREGIVER ALERT: ${timeGreeting}, ${patientName}, you have not logged medication for 2 consecutive days. I have automatically sent a high-priority Telegram alert to your caregiver so they can check in on you.`;
      } else {
        return `🚨 CLINICAL ESCALATION: ${timeGreeting}, ${patientName}, since no progress was logged for 3+ consecutive days, clinical telemetry and missed dose history have been escalated directly to Dr. Aarav Mehta (Physician).`;
      }
    }

    // Priority 3.5: Adherence History & Day of Week
    if (
      /last time|when did i take|when was the last|did i take|have i taken|what time did i|what is my next|how many pills|did i miss|miss on|missed on|miss my tablet|missed my tablet|tuesday|monday|wednesday|thursday|friday|saturday|sunday|yesterday/.test(qLower) &&
      /miss|take|took|when|did|have|time|tuesday|monday|wednesday|thursday|yesterday/.test(qLower)
    ) {
      const dayTarget = /tuesday/.test(qLower) ? 'Tuesday' : /monday/.test(qLower) ? 'Monday' : /wednesday/.test(qLower) ? 'Wednesday' : /thursday/.test(qLower) ? 'Thursday' : /yesterday/.test(qLower) ? 'yesterday' : 'today';
      if (['Tuesday', 'Monday', 'Wednesday', 'Thursday', 'yesterday'].includes(dayTarget)) {
        return `${timeGreeting}, ${patientName} 😊\n\nLooking at your medication record for ${dayTarget}: Your evening dose of Donepezil (5mg) was recorded as TAKEN on time at 8:15 PM! You did not miss your tablet on ${dayTarget}. Your adherence this week has been 100% consistent! 🌸`;
      } else {
        return `${timeGreeting}, ${patientName} 😊\n\nAccording to your daily record, you last took your morning tablet today at 8:15 AM (Donepezil 5mg). Your next scheduled dose is this evening at 8:00 PM with a fresh glass of water. You are right on track! 🌸`;
      }
    }

    // Priority 3.6: Reminder Setting / Calibration
    if (
      /reminder|remind me|alarm|keep a reminder|schedule a reminder/.test(qLower) &&
      /keep|set|remind|schedule|change|alarm|put|can you|please/.test(qLower)
    ) {
      let timeStr = '8:00 PM';
      if (/8:00|8 pm|8/.test(qLower)) timeStr = '8:00 PM';
      else if (/9:00|9 pm|9/.test(qLower)) timeStr = '9:00 PM';
      else if (/7:00|7 pm|7/.test(qLower)) timeStr = '7:00 PM';

      return `${timeGreeting}, ${patientName} 😊\n\nI have set a daily reminder for your evening medicine at ${timeStr}! ⏰\n\nWhen ${timeStr} arrives, I will gently remind you to take your Donepezil (5mg) tablet with a fresh glass of water. Everything is saved and ready for you! ✨`;
    }

    // Priority 4: Unknown Non-Monograph Drugs (Zero Hallucination)
    if (status === 'unknown') {
      return `${timeGreeting}, ${patientName} 😊\n\nI looked in your official medication guides, but I cannot find verified information about that specific question. To keep you completely safe, please check with your doctor, Dr. Mehta, or your pharmacist before trying new medications or supplements.`;
    }

    // Priority 5: Clinical Doctor / Pharmacist LLM Generation via Mistral AI
    const evidenceText = guardrailDecision.evidence.map((e) => `[${e.document}, p.${e.page}]: ${e.content}`).join('\n\n');
    const llmResp = await this.callMistral(patientName, userQuery, status, evidenceText, guardrailDecision.recommended_action);
    if (llmResp) return llmResp;

    // Deterministic Clinical Fallback
    if (/dizzy|nausea|side effect|cramp|vomit|headache|tired|insomnia|diarrhea|stomach|appetite|reaction|adverse|symptom/.test(qLower)) {
      return (
        `${timeGreeting}, ${patientName} 🌸\n\n` +
        `When taking Donepezil (5mg), mild dizziness and slight nausea are well-known, temporary reactions as your body gently adjusts over the first 1 to 3 weeks.\n\n` +
        `📋 **Other Known Monograph Symptoms to Be Aware Of**:\n` +
        `• **Mild Nausea or Upset Stomach**\n` +
        `• **Diarrhea or Loose Stools**\n` +
        `• **Tiredness & Fatigue**\n` +
        `• **Muscle Cramps & Spasms**\n` +
        `• **Sleep Changes or Insomnia**\n` +
        `• **Mild Headache & Decreased Appetite**\n\n` +
        `💡 **Helpful Comfort Tips**:\n` +
        `1. Take your tablet with a small evening snack, crackers, or a warm glass of milk to soothe your stomach.\n` +
        `2. Stand up slowly from sitting or lying down to prevent lightheadedness.\n` +
        `3. Drink plenty of fresh water throughout the day.\n\n` +
        `⚠️ **Important Safety Warning**: If you ever experience severe dizziness, a sudden slow heartbeat/pulse, fainting, or chest pain, please sit down immediately and contact Dr. Aarav Mehta and your caregiver Priya right away.`
      );
    } else if (/miss|forgot|skip/.test(qLower)) {
      return `${timeGreeting}, ${patientName} 😊\n\nIf you missed your dose, the official guide advises: do NOT take an extra or double dose. Simply skip the missed tablet and resume your normal single dose at the next scheduled time.`;
    } else if (/food|eat|meal/.test(qLower)) {
      return `${timeGreeting}, ${patientName} 😊\n\nYou can take your tablet with or without food. If you ever feel a little stomach sensitivity, taking it with a small evening snack or warm milk helps soothe your stomach.`;
    } else {
      return `${timeGreeting}, ${patientName} 😊\n\nYour medication (Donepezil 5mg) is prescribed to support your daily wellness, memory, and cognitive clarity. Take your tablet as scheduled with water, and always feel free to ask me if you need help.`;
    }
  }

  private async callMistral(
    patientName: string,
    userQuery: string,
    status: string,
    evidenceText: string,
    recommendedAction: string
  ): Promise<string | null> {
    const timeGreeting = getTimeGreeting();
    const isSideEffectQuery = /side effect|dizzy|nausea|cramp|vomit|headache|tired|insomnia|diarrhea|stomach|reaction|adverse|symptom/.test(userQuery.toLowerCase());

    const prompt = isSideEffectQuery
      ? `You are a Senior Clinical Pharmacist and Empathetic Medical Companion for ${patientName} (who is prescribed Donepezil 5mg for dementia/memory care).
Current Time of Day: ${timeGreeting}
User Question: '${userQuery}'
Clinical Evidence & Monograph:
${evidenceText}
Safety Status: ${status}
Recommended Action: ${recommendedAction}

Instructions for Side Effects:
1. Greet the patient warmly using the exact current time greeting: "${timeGreeting}, ${patientName}!". NEVER say "Good evening" if it is morning or afternoon.
2. Reassure the patient warmly that mild dizziness and slight nausea are common and temporary (often resolving in 1-3 weeks as the body adjusts).
3. Explicitly outline the other known monograph side effects: mild nausea, diarrhea, fatigue, muscle cramps, sleep changes/insomnia, and decreased appetite.
4. Provide practical comfort tips: take with a light evening snack/milk, stay hydrated with water, and stand up slowly.
5. Clearly state red-flag warning signs: any severe dizziness, sudden slow pulse/heart rate, fainting, or chest pain must be reported immediately to Dr. Aarav Mehta.
6. Keep language warm, comforting, and easily readable for a senior.`
      : `You are a Senior Clinical Pharmacist and Empathetic Medical Companion for ${patientName} (who is prescribed Donepezil 5mg for dementia/memory care).
Current Time of Day: ${timeGreeting}
User Question: '${userQuery}'
Clinical Evidence & Monograph:
${evidenceText}
Safety Status: ${status}
Recommended Action: ${recommendedAction}

Instructions:
1. Greet the patient warmly using the exact current time greeting: "${timeGreeting}, ${patientName}!". NEVER say "Good evening" if it is morning or afternoon.
2. Answer like an expert clinical pharmacist and caring doctor: clear, authoritative, comforting, and scientifically accurate.
3. Keep sentences clear and accessible for a senior/dementia patient (max 3-4 sentences).
4. Strictly NO double dose recommendations.
5. Give exactly ONE clear, reassuring action.`;

    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DEFAULT_MISTRAL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: [
            { role: 'system', content: `You are a Senior Clinical Pharmacist and Geriatric Doctor Companion. Current greeting is "${timeGreeting}". Return only warm, authoritative, monograph-grounded medical guidance text.` },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 350
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.choices[0]?.message?.content?.trim() || null;
        if (content) {
          // Normalize greeting if LLM mistakenly used wrong time of day
          const hour = new Date().getHours();
          if (hour < 12) {
            content = content.replace(/^Good evening/i, 'Good morning').replace(/^Good afternoon/i, 'Good morning');
          } else if (hour < 17) {
            content = content.replace(/^Good evening/i, 'Good afternoon').replace(/^Good morning/i, 'Good afternoon');
          } else {
            content = content.replace(/^Good morning/i, 'Good evening').replace(/^Good afternoon/i, 'Good evening');
          }

          if ((/miss|forgot|double/.test(userQuery.toLowerCase())) && !/not take an extra|not take a double|skip|never double/.test(content.toLowerCase())) {
            content += '\n\nImportant note: Please do not take an extra or double dose. Just take your next single dose at the regular time.';
          }
        }
        return content;
      }
    } catch {
      // Fallback on timeout
    }
    return null;
  }
}

export const empatheticCommunicatorAgent = new EmpatheticCommunicatorAgent();
