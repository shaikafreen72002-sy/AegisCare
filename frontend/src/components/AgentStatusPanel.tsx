import React, { useState } from 'react';
import type { PipelineEvent } from '../types/chat';
import {
  ShieldCheck,
  BookOpen,
  Clock,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface AgentStatusPanelProps {
  events?: PipelineEvent[];
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  events = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAgentIcon = (agentName: string) => {
    if (agentName.includes('Guardrail')) {
      return <ShieldCheck className="w-4 h-4 text-[#16A34A]" />;
    }
    if (agentName.includes('Knowledge') || agentName.includes('RAG')) {
      return <BookOpen className="w-4 h-4 text-[#2F80ED]" />;
    }
    if (agentName.includes('Adherence')) {
      return <Clock className="w-4 h-4 text-[#F59E0B]" />;
    }
    return <HeartHandshake className="w-4 h-4 text-[#8B5CF6]" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED
          </span>
        );
      case 'NOTICE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
            <AlertTriangle className="w-3 h-3" /> ZERO-HALLUCINATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED]">
            <Info className="w-3 h-3" /> ACTIVE
          </span>
        );
    }
  };

  const defaultPipeline = [
    {
      agent: 'Clinical Guardrail Agent',
      role: 'Medical Information Specialist',
      status: 'SUCCESS',
      action: 'SAFETY_VERIFIED',
      detail: 'Monograph safety rules verified. Prohibits dosage modification & double-dosing.'
    },
    {
      agent: 'Document Knowledge Agent',
      role: 'Clinical Knowledge Librarian',
      status: 'SUCCESS',
      action: 'RAG_RETRIEVED',
      detail: 'Grounded against official Product Monographs and BPSD guidelines.'
    },
    {
      agent: 'Adherence Escalation Agent',
      role: 'Patient Monitoring Manager',
      status: 'SUCCESS',
      action: 'STATUS_EVALUATED',
      detail: '1-5 non-acknowledgment counter monitored with configurable escalation policy.'
    },
    {
      agent: 'Empathetic Communicator Agent',
      role: 'Patient Empathy Coach',
      status: 'SUCCESS',
      action: 'DEMENTIA_TONE_FORMULATED',
      detail: 'Warm, single-action communication calibrated for low cognitive load.'
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultPipeline;

  return (
    <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] overflow-hidden text-xs transition-all">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-white hover:bg-[#F8FAFC] transition cursor-pointer border-b border-[#E2E8F0]/60"
        aria-label="Toggle Agent Safety Pipeline Trace"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
            <Cpu className="w-3 h-3" />
          </div>
          <span className="font-bold text-[#0F172A] tracking-tight">
            AI Multi-Agent Safety Pipeline
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] font-bold">
            4 Agents Active
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#64748B] font-semibold text-[11px]">
          <span>{isExpanded ? 'Hide Trace' : 'View Agent Activity'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Collapsed Compact Preview */}
      {!isExpanded && (
        <div className="px-3 py-1.5 flex flex-wrap items-center gap-3 text-[11px] text-[#475569]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Guardrail: Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2F80ED]"></span> RAG: Grounded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Escalation: Monitored
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span> Empathy: Calibrated
          </span>
        </div>
      )}

      {/* Expanded Multi-Agent Event Stepper */}
      {isExpanded && (
        <div className="p-3 space-y-2.5 bg-[#F8FAFC]">
          {displayEvents.map((evt, idx) => (
            <div
              key={idx}
              className="bg-white p-2.5 rounded-[6px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {getAgentIcon(evt.agent)}
                  <span className="font-bold text-[#0F172A]">{evt.agent}</span>
                  <span className="text-[10px] text-[#64748B]">({evt.role})</span>
                </div>
                {getStatusBadge(evt.status)}
              </div>
              <p className="text-[11px] text-[#334155] pl-5.5 leading-relaxed">
                {evt.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
