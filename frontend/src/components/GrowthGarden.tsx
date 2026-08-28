import React from 'react';
import { usePatient } from '../context/PatientContext';
import { Sparkles, Heart } from 'lucide-react';

const STAGE_METADATA = [
  { level: 1, title: 'Nurtured Seed', emoji: '🌱', desc: 'Routine planted' },
  { level: 2, title: 'Gentle Sprout', emoji: '🌿', desc: 'Taking roots' },
  { level: 3, title: 'Tender Buds', emoji: '🍃', desc: 'Daily consistency' },
  { level: 4, title: 'Blooming Jasmine', emoji: '🌸', desc: 'Flourishing wellness' },
  { level: 5, title: 'Sacred Garden', emoji: '🌺', desc: 'Serene adherence' }
];

export const GrowthGarden: React.FC = () => {
  const { adherence } = usePatient();
  const currentStage = Math.min(5, Math.max(1, adherence.growth_stage));
  const stageInfo = STAGE_METADATA[currentStage - 1];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Garden Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[10px] bg-[#EAF3FF] border border-[#2F80ED]/20 flex items-center justify-center text-3xl shrink-0">
            {stageInfo.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Routine Progress
              </span>
              <span className="text-xs font-semibold text-[#64748B]">
                Stage {currentStage} of 5 • {stageInfo.title}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mt-1">
              {adherence.garden_name}
            </h2>
            <p className="text-sm text-[#475569] font-medium mt-0.5">
              {adherence.routine_message}
            </p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#F8FAFC] px-3.5 py-2 rounded-[8px] border border-[#E2E8F0]">
          {STAGE_METADATA.map((stage) => {
            const isCompleted = stage.level <= currentStage;
            const isCurrent = stage.level === currentStage;
            return (
              <div
                key={stage.level}
                className="flex flex-col items-center"
                title={`${stage.title}: ${stage.desc}`}
              >
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#2F80ED] text-white shadow-sm ring-2 ring-[#EAF3FF]'
                      : isCompleted
                      ? 'bg-[#EAF3FF] text-[#2F80ED]'
                      : 'bg-white border border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {stage.level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gentle Affirmation Footnote */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#475569]">
        <span className="flex items-center gap-1.5 font-medium">
          <Heart className="w-3.5 h-3.5 text-[#16A34A]" />
          Positive routine care — each dose supports your cognitive health and daily clarity.
        </span>
        <span className="hidden sm:inline font-semibold text-[#2F80ED]">
          Gentle Habit Growth
        </span>
      </div>
    </div>
  );
};
