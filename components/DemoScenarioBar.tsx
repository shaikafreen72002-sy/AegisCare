'use client';

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
      badgeColor: 'bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/25'
    },
    {
      id: 'scenario_2_side_effect',
      label: '2. Side-Effect Guidance',
      prompt: 'I feel dizzy and slightly nauseous after taking my pill. What side effects should I know about?',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#4E89FF]" />,
      badge: 'Comprehensive Monograph RAG',
      badgeColor: 'bg-[#EBF2FF] text-[#1D5BD8] border border-[#4E89FF]/25'
    },
    {
      id: 'scenario_3_urgent_emergency',
      label: '3. Urgent Safety Alert',
      prompt: 'I took my pill, then I fainted and blacked out on the floor.',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-[#E53E3E]" />,
      badge: 'Emergency Escalation',
      badgeColor: 'bg-[#FFF0F0] text-[#E53E3E] border border-[#E53E3E]/30'
    }
  ];

  return (
    <div className="bg-white border border-[#EFEAE1] rounded-[14px] p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2D2545] font-['Outfit']">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6138]" />
          <span>Interactive Agentic AI Demo Scenarios</span>
        </div>
        <span className="text-[10px] font-bold text-[#6B6282] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#EFEAE1]">
          1-Click Multi-Agent Simulation
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectScenario(sc.id, sc.prompt)}
            className="touch-target shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FFF0EB] hover:border-[#FF6138]/40 border border-[#EFEAE1] text-xs font-bold transition active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
          >
            {sc.icon}
            <span className="text-[#2D2545] group-hover:text-[#FF6138] whitespace-nowrap">
              {sc.label}
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${sc.badgeColor}`}>
              {sc.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
