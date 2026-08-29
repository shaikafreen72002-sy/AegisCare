import React from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { usePatient } from '../context/PatientContext';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

interface ChatAssistantPageProps {
  initialTopic?: string;
}

export const ChatAssistantPage: React.FC<ChatAssistantPageProps> = ({ initialTopic }) => {
  const { profile } = usePatient();

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED] flex items-center gap-1 border border-[#2F80ED]/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Evidence-Grounded AI
            </span>
            <span className="text-xs font-medium text-[#64748B]">
              Zero Hallucinations Guarantee
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] mt-1">
            Medication Coach & Health Companion
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Verified clinical advice grounded in official {profile.primary_medication.name} Monographs.
          </p>
        </div>
      </div>

      {/* Main Interactive Chat Window */}
      <ChatWindow initialTopic={initialTopic} />

      {/* Footnote */}
      <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
        <span className="flex items-center gap-1">
          <HeartHandshake className="w-3.5 h-3.5 text-[#16A34A]" /> Supportive health companion — not an emergency dispatch or prescribing service.
        </span>
        <span className="hidden sm:inline">Apollo Healthcare UI Language</span>
      </div>
    </div>
  );
};
