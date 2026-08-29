import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';

interface DemoScenarioBarProps {
  onSelectScenario: (scenarioId: string, promptText: string) => void;
  isLoading?: boolean;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  onSelectScenario,
  isLoading = false
}) => {
  const scenarios = [
    {
      id: 'scenario_1_adherence',
      label: '1. Normal Adherence',
      prompt: 'I took my evening medicine.',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#1E824C]" />,
      badge: 'Adherence Recorded',
      badgeColor: 'bg-[#EAF8F0] text-[#136B3B]'
    },
    {
      id: 'scenario_2_side_effect',
      label: '2. Side-Effect Guidance',
      prompt: 'I feel dizzy and slightly nauseous after taking my pill. What side effects should I know about?',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#4E89FF]" />,
      badge: 'Comprehensive Monograph RAG',
      badgeColor: 'bg-[#EBF2FF] text-[#1D5BD8]'
    },
    {
      id: 'scenario_3_urgent_emergency',
      label: '3. Urgent Safety Alert',
      prompt: 'I took my pill, then I fainted and blacked out on the floor.',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-[#E53E3E]" />,
      badge: 'Emergency Escalation',
      badgeColor: 'bg-[#FFF0F0] text-[#E53E3E]'
    }
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
          <Sparkles className="w-3.5 h-3.5 text-[#2F80ED]" />
          <span>Interactive Agentic AI Demo Scenarios</span>
        </div>
        <span className="text-[10px] font-semibold text-[#64748B]">
          1-Click Live Multi-Agent Simulation
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectScenario(sc.id, sc.prompt)}
            className="touch-target shrink-0 flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EAF3FF] border border-[#CBD5E1] text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
          >
            {sc.icon}
            <span className="text-[#0F172A] group-hover:text-[#2F80ED] whitespace-nowrap">
              {sc.label}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sc.badgeColor}`}>
              {sc.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
