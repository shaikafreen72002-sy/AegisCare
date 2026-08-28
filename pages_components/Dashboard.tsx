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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F80ED]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
            {getGreeting()}, {profile.preferred_name || profile.name}!
          </h1>
          <p className="text-sm text-[#475569] font-medium mt-0.5">
            Your daily personalized adherence routine is organized and ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            aria-label="Send Telegram Medication Reminder"
            className="touch-target flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] bg-[#EAF3FF] hover:bg-[#D4E8FF] text-[#2F80ED] border border-[#CBD5E1]/60 font-semibold text-xs sm:text-sm shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram Reminder (@BversityCareBot)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            aria-label="Open AI Medication Companion Chat"
            className="touch-target flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Talk with Companion</span>
          </button>
        </div>
      </div>

      <AdherenceStreakCard />

      <DemoScenarioBar onSelectScenario={handleScenarioSelect} isLoading={false} />

      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Adherence Escalation & Safety Status
              </h2>
              <span className="text-xs text-[#64748B]">
                Monitored by Adherence Escalation Agent (1–5 Non-Acknowledgment Tree)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
              ✓ Adherence: {adherencePct}% Today
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF3FF] text-[#2F80ED]">
              Escalation Tier: Normal
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#475569]">
            <span>Escalation Progression: Step 0/5</span>
            <span className="text-[#16A34A] font-bold">All Reminders Acknowledged</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { step: 1, label: '1. Gentle Prompt', color: 'bg-[#16A34A]' },
              { step: 2, label: '2. Clear Reminder', color: 'bg-[#22C55E]' },
              { step: 3, label: '3. Caregiver Flag', color: 'bg-[#F59E0B]' },
              { step: 4, label: '4. Telegram Alert', color: 'bg-[#EA580C]' },
              { step: 5, label: '5. Doctor Escalation', color: 'bg-[#DC2626]' }
            ].map((s) => (
              <div
                key={s.step}
                className="p-2 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-0.5"
              >
                <div className="text-[10px] font-bold text-[#64748B]">Step {s.step}</div>
                <div className="text-[11px] font-semibold text-[#0F172A] truncate">
                  {s.label.split('. ')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2F80ED]" />
            <h2 className="text-xl font-bold text-[#0F172A]">Today's Medication Routine</h2>
          </div>
          <span className="text-xs font-semibold text-[#64748B]">
            {takenCount} of {totalCount} doses taken
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adherence.schedule.map((dose) => (
            <MedicationCard key={dose.id} dose={dose} />
          ))}
        </div>
      </div>
    </div>
  );
};
