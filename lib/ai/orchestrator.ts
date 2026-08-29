import { clinicalGuardrailAgent } from './guardrailAgent';
import { adherenceEscalationAgent } from './adherenceAgent';
import { empatheticCommunicatorAgent, TelegramDispatchTool } from './empathyAgent';
import type { ChatApiResponse, PipelineEvent, IntentType } from '../types/chat';

export class MultiAgentOrchestrator {
  public async processMessage(
    message: string,
    medicationName: string = 'donepezil',
    patientName: string = 'Afreen',
    completedDays?: number[]
  ): Promise<ChatApiResponse> {
    const pipelineEvents: PipelineEvent[] = [];
    const msgLow = message.toLowerCase();

    // Check for Dose Acknowledgment Trigger (Scenario 1)
    const isQuestion = /when|did i|what time|last time|have i|how many|\?/.test(msgLow);
    const isMarkingTaken = !isQuestion && /took my|taken my|just took|swallowed my pill|mark taken|already took|i took it/.test(msgLow);

    let adherenceDecision = null;
    if (isMarkingTaken) {
      adherenceDecision = adherenceEscalationAgent.recordAcknowledgment('current_dose', true);
      pipelineEvents.push({
        agent: 'Adherence Escalation Agent',
        role: 'Patient Monitoring Manager',
        status: 'SUCCESS',
        action: 'DOSE_RECORDED',
        detail: 'Dose marked as taken. Non-acknowledgment counter reset to 0.'
      });
    }

    // Step 1: Clinical Guardrail Agent Evaluation
    const guardrailDecision = clinicalGuardrailAgent.evaluateMedicalQuery(message, medicationName, patientName);
    pipelineEvents.push({
      agent: 'Clinical Guardrail Agent',
      role: 'Medical Information Specialist',
      status: guardrailDecision.status === 'urgent' ? 'ESCALATED' : guardrailDecision.status === 'caution' ? 'CAUTION' : guardrailDecision.status === 'unknown' ? 'NOTICE' : 'SUCCESS',
      action: `STATUS_${guardrailDecision.status.toUpperCase()}`,
      detail: `Evaluation: ${guardrailDecision.status.toUpperCase()} — ${guardrailDecision.reason}`
    });

    // Step 2: Document Knowledge Agent RAG
    const evidence = guardrailDecision.evidence;
    if (evidence && evidence.length > 0) {
      pipelineEvents.push({
        agent: 'Document Knowledge Agent',
        role: 'Clinical Knowledge Librarian',
        status: 'SUCCESS',
        action: 'EVIDENCE_RETRIEVED',
        detail: `Retrieved ${evidence.length} verified monograph source chunks.`
      });
    } else {
      pipelineEvents.push({
        agent: 'Document Knowledge Agent',
        role: 'Clinical Knowledge Librarian',
        status: 'NOTICE',
        action: 'ZERO_HALLUCINATION_ENFORCED',
        detail: 'No matching monograph sources found in verified knowledge base.'
      });
    }

    // Step 3: Handle Emergency or Caregiver Escalation Dispatch
    let escalationResult = null;
    if (guardrailDecision.requires_escalation || (adherenceDecision && adherenceDecision.requires_caregiver_alert)) {
      const urgency = guardrailDecision.escalation_urgency || 'HIGH';
      const triggerName = guardrailDecision.requires_escalation ? 'CRITICAL_SYMPTOM' : 'REPEATED_MISSED_DOSES';
      const summaryText = guardrailDecision.reason || 'Urgent clinical escalation required.';

      escalationResult = TelegramDispatchTool.sendMessage(
        urgency === 'CRITICAL' ? 'Dr. Mehta & Caregiver Priya' : 'CareBot (@BversityCareBot)',
        patientName,
        urgency,
        triggerName,
        summaryText
      );

      pipelineEvents.push({
        agent: 'Empathetic Communicator Agent',
        role: 'Telegram Dispatch Tool',
        status: 'SENT',
        action: 'ESCALATION_DISPATCHED',
        detail: `Dispatched ${urgency} Telegram alert to ${escalationResult.recipient} (Receipt: ${escalationResult.receipt_id}).`
      });
    }

    // Step 4: Empathetic Communicator Agent Generation
    const finalText = await empatheticCommunicatorAgent.generatePatientResponse(
      patientName,
      guardrailDecision,
      adherenceDecision,
      message,
      completedDays
    );

    pipelineEvents.push({
      agent: 'Empathetic Communicator Agent',
      role: 'Patient Empathy Coach',
      status: 'SUCCESS',
      action: 'RESPONSE_FORMULATED',
      detail: 'Formulated warm, dementia-friendly patient message without medical jargon.'
    });

    // Map intent for backward compatibility
    let intent: IntentType = 'GENERAL_QUERY';
    if (isMarkingTaken) {
      intent = 'MARK_TAKEN';
    } else if (/last time|when did i|what time|my schedule|my routine/.test(msgLow)) {
      intent = 'ADHERENCE_QUERY';
    } else if (/reminder|remind me|alarm|keep a reminder|schedule a reminder/.test(msgLow)) {
      intent = 'REMINDER_SETUP';
    } else if (/miss|forgot/.test(msgLow)) {
      intent = 'MISSED_DOSE';
    } else if (/food|eat/.test(msgLow)) {
      intent = 'MEDICATION_WITH_FOOD';
    } else if (guardrailDecision.status === 'urgent') {
      intent = 'SEVERE_SYMPTOM';
    } else if (guardrailDecision.status === 'caution') {
      intent = 'SIDE_EFFECT';
    } else if (/what|why|know/.test(msgLow)) {
      intent = 'DRUG_INFO';
    }

    return {
      response: finalText,
      intent,
      risk_level: guardrailDecision.status === 'urgent' ? 'CRITICAL' : guardrailDecision.status === 'caution' ? 'MEDIUM' : 'LOW',
      safety_status: guardrailDecision.status === 'urgent' ? 'ESCALATE' : guardrailDecision.status === 'unknown' ? 'INSUFFICIENT_EVIDENCE' : 'SAFE',
      escalation_required: guardrailDecision.requires_escalation || (adherenceDecision?.requires_caregiver_alert ?? false),
      escalation: escalationResult ? {
        recipient: escalationResult.recipient,
        channel: escalationResult.channel || 'TELEGRAM_BOT',
        urgency: escalationResult.urgency,
        trigger: escalationResult.trigger,
        summary: escalationResult.summary,
        notification_status: escalationResult.notification_status,
        receipt_id: escalationResult.receipt_id
      } : null,
      sources: evidence,
      ai_pipeline_events: pipelineEvents
    };
  }
}

export const orchestrator = new MultiAgentOrchestrator();
