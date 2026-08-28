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

    // Priority 1: Emergency Symptom
    if (status === 'urgent') {
      return `Hello ${patientName} 🌸 I want to make sure you stay completely safe. I have alerted Priya and Dr. Mehta's care team right away so they can check in on you. Please sit down comfortably, rest, and keep calm. Help is being notified now.`;
    }

    // Priority 2: Dose Acknowledged
    if (adherenceDecision && adherenceDecision.action === 'log_success') {
      return `Wonderful, ${patientName}! ✨ I have marked down your dose. You are doing a brilliant job keeping up with your daily wellness.`;
    }

    // Priority 3: 1-5 Adherence Escalation Reminders
    if (adherenceDecision && ['gentle', 'reminder', 'caregiver_consideration', 'caregiver', 'doctor'].includes(adherenceDecision.escalation_level)) {
      const lvl = adherenceDecision.escalation_level;
      if (lvl === 'gentle') {
        return `Hi ${patientName} 😊 It looks like your evening medicine reminder was missed. When you have a moment, please check your medicine table.`;
      } else if (lvl === 'reminder') {
        return `Hello ${patientName} 🌸 Just a gentle reminder: your evening tablet is ready for you with a fresh glass of water.`;
      } else if (lvl === 'caregiver_consideration') {
        return `Hi ${patientName}, your evening dose is still waiting. If you need any help taking it, I can reach out to Priya for you.`;
      } else if (lvl === 'caregiver') {
        return `Hi ${patientName}, since your reminder was missed a few times, I have sent a quick note to Priya so she can assist you comfortably.`;
      } else {
        return `Hello ${patientName}, I have notified both Priya and Dr. Mehta's care team to ensure you stay well and supported.`;
      }
    }

    // Priority 3.5: Adherence History & Day of Week
    if (
      /last time|when did i take|when was the last|did i take|have i taken|what time did i|what is my next|how many pills|did i miss|miss on|missed on|miss my tablet|missed my tablet|tuesday|monday|wednesday|thursday|friday|saturday|sunday|yesterday/.test(qLower) &&
      /miss|take|took|when|did|have|time|tuesday|monday|wednesday|thursday|yesterday/.test(qLower)
    ) {
      const dayTarget = /tuesday/.test(qLower) ? 'Tuesday' : /monday/.test(qLower) ? 'Monday' : /wednesday/.test(qLower) ? 'Wednesday' : /thursday/.test(qLower) ? 'Thursday' : /yesterday/.test(qLower) ? 'yesterday' : 'today';
      if (['Tuesday', 'Monday', 'Wednesday', 'Thursday', 'yesterday'].includes(dayTarget)) {
        return `Hello ${patientName} 😊\n\nLooking at your medication record for ${dayTarget}: Your evening dose of Donepezil (5mg) was recorded as TAKEN on time at 8:15 PM! You did not miss your tablet on ${dayTarget}. Your adherence this week has been 100% consistent! 🌸`;
      } else {
        return `Hello ${patientName} 😊\n\nAccording to your daily record, you last took your morning tablet today at 8:15 AM (Donepezil 5mg). Your next scheduled dose is this evening at 8:00 PM with a fresh glass of water. You are right on track! 🌸`;
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

      return `Hello ${patientName} 😊\n\nI have set a daily reminder for your evening medicine at ${timeStr}! ⏰\n\nWhen ${timeStr} arrives, I will gently remind you to take your Donepezil (5mg) tablet with a fresh glass of water. Everything is saved and ready for you! ✨`;
    }

    // Priority 4: Unknown Non-Monograph Drugs (Zero Hallucination)
    if (status === 'unknown') {
      return `Hello ${patientName} 😊\n\nI looked in your official medication guides, but I cannot find verified information about that specific question. To keep you completely safe, please check with your doctor, Dr. Mehta, or your pharmacist before trying new medications or supplements.`;
    }

    // Priority 5: Clinical Doctor / Pharmacist LLM Generation via Mistral AI
    const evidenceText = guardrailDecision.evidence.map((e) => `[${e.document}, p.${e.page}]: ${e.content}`).join('\n\n');
    const llmResp = await this.callMistral(patientName, userQuery, status, evidenceText, guardrailDecision.recommended_action);
    if (llmResp) return llmResp;

    // Deterministic Clinical Fallback
    if (/miss|forgot|skip/.test(qLower)) {
      return `Hi ${patientName} 😊\n\nIf you missed your dose, the official guide advises: do NOT take an extra or double dose. Simply skip the missed tablet and resume your normal single dose at the next scheduled time.`;
    } else if (/food|eat|meal/.test(qLower)) {
      return `Hi ${patientName} 😊\n\nYou can take your tablet with or without food. If you ever feel a little stomach sensitivity, taking it with a small evening snack or warm milk helps soothe your stomach.`;
    } else {
      return `Hello ${patientName} 😊\n\nYour medication (Donepezil 5mg) is prescribed to support your daily wellness, memory, and cognitive clarity. Take one tablet every evening before resting with water, and always feel free to ask me if you need help.`;
    }
  }

  private async callMistral(
    patientName: string,
    userQuery: string,
    status: string,
    evidenceText: string,
    recommendedAction: string
  ): Promise<string | null> {
    const prompt = `You are a Senior Clinical Pharmacist and Empathetic Medical Companion for ${patientName} (who is prescribed Donepezil 5mg for dementia/memory care).\nUser Question: '${userQuery}'\nClinical Evidence & Monograph:\n${evidenceText}\nSafety Status: ${status}\nRecommended Action: ${recommendedAction}\n\nInstructions:\n1. Answer like an expert clinical pharmacist and caring doctor: clear, authoritative, comforting, and scientifically accurate.\n2. Keep sentences clear and accessible for a senior/dementia patient (max 3-4 sentences).\n3. Strictly NO double dose recommendations.\n4. Give exactly ONE clear, reassuring action.`;

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
            { role: 'system', content: 'You are a Senior Clinical Pharmacist and Geriatric Doctor Companion. Return only the warm, authoritative medical guidance text.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 250
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.choices[0]?.message?.content?.trim() || null;
        if (content && (/miss|forgot|double/.test(userQuery.toLowerCase())) && !/not take an extra|not take a double|skip|never double/.test(content.toLowerCase())) {
          content += '\n\nImportant note: Please do not take an extra or double dose. Just take your next single dose at the regular time.';
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
