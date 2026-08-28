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
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />,
      badge: 'Adherence Recorded',
      badgeColor: 'bg-[#DCFCE7] text-[#16A34A]'
    },
    {
      id: 'scenario_2_missed_dose',
      label: '2. Missed Dose (1→5)',
      prompt: '__STEP_MISSED_DOSE__',
      icon: <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />,
      badge: 'Escalation Tree',
      badgeColor: 'bg-[#FEF3C7] text-[#D97706]'
    },
    {
      id: 'scenario_3_side_effect',
      label: '3. Side-Effect Query',
      prompt: 'I feel dizzy and slightly nauseous after taking my pill.',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#2F80ED]" />,
      badge: 'RAG Grounding',
      badgeColor: 'bg-[#EAF3FF] text-[#2F80ED]'
    },
    {
      id: 'scenario_4_unknown_info',
      label: '4. Unknown Drug Info',
      prompt: 'Can I take ibuprofen and amoxicillin with my medicine for tooth pain?',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#64748B]" />,
      badge: 'Zero Hallucination',
      badgeColor: 'bg-[#F1F5F9] text-[#475569]'
    },
    {
      id: 'scenario_5_urgent_emergency',
      label: '5. Urgent Situation',
      prompt: 'I took my pill, then I fainted and blacked out on the floor.',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626]" />,
      badge: 'Emergency Alert',
      badgeColor: 'bg-[#FEE2E2] text-[#DC2626]'
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
