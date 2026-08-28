'use client';

import React from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { AdherenceStreakCard } from '@/components/AdherenceStreakCard';
import { MedicationCard } from '@/components/MedicationCard';
import { DemoScenarioBar } from '@/components/DemoScenarioBar';
import {
  MessageSquareText,
  Clock,
  Calendar,
  CheckCircle2,
  Send
} from 'lucide-react';

interface DashboardProps {
  onOpenChatWithTopic?: (topic: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenChatWithTopic }) => {
  const { profile, adherence, setActiveTab, setIsTelegramModalOpen } = usePatient();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const handleScenarioSelect = (_scenarioId: string, promptText: string) => {
    if (onOpenChatWithTopic) {
      onOpenChatWithTopic(promptText);
    } else {
      setActiveTab('chat');
    }
  };

  const takenCount = adherence.schedule.filter((s) => s.status === 'TAKEN').length;
  const totalCount = adherence.schedule.length;
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EFEAE1] rounded-[16px] p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6138]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2545] mt-1 font-['Outfit']">
            {getGreeting()}, {profile.preferred_name || profile.name}!
          </h1>
          <p className="text-sm text-[#6B6282] font-medium mt-0.5">
            Your daily personalized adherence routine is organized and ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            aria-label="Send Telegram Medication Reminder"
            className="touch-target flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#EBF2FF] hover:bg-[#D9E7FF] text-[#1D5BD8] border border-[#4E89FF]/20 font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#4E89FF]" />
            <span>Telegram Reminder (@BversityCareBot)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            aria-label="Open AI Medication Companion Chat"
            className="touch-target flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-xs sm:text-sm shadow-[0_2px_10px_rgba(255,97,56,0.3)] transition active:scale-[0.98] cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Talk with Companion</span>
          </button>
        </div>
      </div>

      <AdherenceStreakCard />

      <DemoScenarioBar onSelectScenario={handleScenarioSelect} isLoading={false} />

      {/* Safety & Escalation Status Box */}
      <div className="bg-white border border-[#EFEAE1] rounded-[16px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFE6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EAF8F0] text-[#1E824C] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
                Adherence Escalation & Safety Protocol
              </h2>
              <span className="text-xs text-[#6B6282] font-medium">
                Monitored by Adherence Escalation Agent (2-Day Caregiver & 3-Day Physician Safeguard)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/20">
              ✓ Adherence: {adherencePct}% Today
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/20">
              Tier: Normal Routine
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#5D5570]">
            <span>Escalation Progression: Step 0/3</span>
            <span className="text-[#1E824C] font-bold">All Reminders Acknowledged</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { step: 1, label: '1. Patient Telegram Reminder', desc: 'Day 1 Missed Prompt', bg: 'bg-[#FAF7F2]', border: 'border-[#EFEAE1]' },
              { step: 2, label: '2. Caregiver Urgent Alert', desc: 'Day 2 Missed Flag', bg: 'bg-[#FFF8E7]', border: 'border-[#FFBE53]/40' },
              { step: 3, label: '3. Physician Clinical Alert', desc: 'Day 3+ Doctor Escalation', bg: 'bg-[#FFF0F0]', border: 'border-[#E53E3E]/30' }
            ].map((s) => (
              <div
                key={s.step}
                className={`p-3 rounded-[12px] ${s.bg} border ${s.border} text-left space-y-0.5`}
              >
                <div className="text-[10px] font-bold text-[#988EA8] uppercase tracking-wider">Tier {s.step}</div>
                <div className="text-xs font-bold text-[#2D2545] truncate">
                  {s.label.split('. ')[1]}
                </div>
                <div className="text-[11px] text-[#6B6282] font-medium truncate">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medication Doses Routine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6138]" />
            <h2 className="text-xl font-extrabold text-[#2D2545] font-['Outfit']">Today's Medication Routine</h2>
          </div>
          <span className="text-xs font-bold text-[#6B6282] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFEAE1]">
            {takenCount} of {totalCount} doses taken
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adherence.schedule.map((dose) => (
            <MedicationCard key={dose.id} dose={dose} />
          ))}
        </div>
      </div>
    </div>
  );
};
