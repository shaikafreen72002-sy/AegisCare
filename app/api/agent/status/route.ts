import { NextResponse } from 'next/server';
import { adherenceEscalationAgent } from '@/lib/ai/adherenceAgent';
import { documentKnowledgeAgent } from '@/lib/ai/knowledgeAgent';

export async function GET() {
  const inventory = documentKnowledgeAgent.getInventory();
  const counter = adherenceEscalationAgent.getCounter();

  return NextResponse.json({
    status: 'HEALTHY',
    system: 'Agentic Dementia Medication Adherence System',
    agents: {
      clinical_guardrail_agent: {
        status: 'ACTIVE',
        capabilities: ['Zero-Hallucination Guardrails', 'No-Double-Dose Enforcement', 'Emergency Triage']
      },
      adherence_escalation_agent: {
        status: 'ACTIVE',
        counter,
        max_counter: 5,
        escalation_path: ['Gentle Prompt', 'Clear Reminder', 'Caregiver Flag', 'Telegram Alert', 'Doctor Escalation']
      },
      empathetic_communicator_agent: {
        status: 'ACTIVE',
        model: 'mistral-small-latest',
        dispatch_tool: 'Telegram Bot Tool (@BversityCareBot) Ready'
      },
      document_knowledge_agent: {
        status: 'ACTIVE',
        documents_indexed: inventory.length,
        rag_active: true
      }
    }
  });
}
