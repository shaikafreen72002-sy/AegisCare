'use client';

import React, { useState } from 'react';
import type { DoseScheduleItem } from '@/lib/types/adherence';
import { usePatient } from '@/lib/context/PatientContext';
import { CheckCircle2, Clock, HelpCircle, Pill, AlertCircle, Sparkles, MessageSquareHeart } from 'lucide-react';

interface MedicationCardProps {
  dose: DoseScheduleItem;
  onOpenChatWithTopic?: (topic: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ dose, onOpenChatWithTopic }) => {
  const { markDoseAsTaken, setActiveTab } = usePatient();
  const [isMarking, setIsMarking] = useState(false);
  const [showMissedHelp, setShowMissedHelp] = useState(dose.status === 'MISSED');

  const handleMarkTaken = async () => {
    setIsMarking(true);
    try {
      await markDoseAsTaken(dose.id);
    } finally {
      setIsMarking(false);
    }
  };

  const handleTalkToAssistant = () => {
    if (onOpenChatWithTopic) {
      onOpenChatWithTopic(`I missed my ${dose.time_slot} dose of ${dose.medication_name}. What should I do?`);
    } else {
      setActiveTab('chat');
    }
  };

  const isTaken = dose.status === 'TAKEN';
  const isDue = dose.status === 'DUE';
  const isMissed = dose.status === 'MISSED' || showMissedHelp;

  const getMealTag = () => {
    const s = (dose.time_slot || '').toLowerCase();
    const t = (dose.scheduled_time || '').toLowerCase();
    const hourNum = parseInt(t.split(':')[0] || '20', 10);
    if (s.includes('breakfast') || s.includes('morning') || hourNum < 12) {
      return { label: '☕ Before / With Breakfast', color: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30' };
    }
    if (s.includes('lunch') || s.includes('afternoon') || (hourNum >= 12 && hourNum < 17)) {
      return { label: '🍽️ After Lunch (Midday)', color: 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30' };
    }
    return { label: '🌙 After Dinner / Bedtime', color: 'bg-[#EAF3FF] text-[#2F80ED] border-[#2F80ED]/30' };
  };

  const mealTag = getMealTag();

  return (
    <div
      className={`rounded-[12px] border transition-all p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] bg-white ${
        isTaken
          ? 'border-[#16A34A]/30 bg-[#F0FDF4]/40'
          : isDue
          ? 'border-[#2F80ED] ring-1 ring-[#2F80ED]/20'
          : isMissed
          ? 'border-[#F59E0B]'
          : 'border-[#E2E8F0]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-[8px] flex items-center justify-center shrink-0 ${
              isTaken
                ? 'bg-[#DCFCE7] text-[#16A34A]'
                : isDue
                ? 'bg-[#EAF3FF] text-[#2F80ED]'
                : 'bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#475569] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                {dose.time_slot}
              </span>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isTaken
                    ? 'bg-[#DCFCE7] text-[#16A34A]'
                    : isDue
                    ? 'bg-[#EAF3FF] text-[#2F80ED]'
                    : isMissed
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {isTaken ? 'Recorded' : isDue ? 'Due Now' : isMissed ? 'Needs Help' : 'Upcoming'}
              </span>

              {/* Before / After Medicine Meal Context Tag */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mealTag.color}`}>
                {mealTag.label}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0F172A] mt-1">
              {dose.medication_name}{' '}
              <span className="text-sm font-normal text-[#64748B]">
                ({dose.dosage})
              </span>
            </h3>

            <p className="text-sm text-[#475569] mt-0.5 leading-relaxed">
              {dose.instructions}
            </p>

            {isTaken && dose.taken_at && (
              <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" /> Recorded at {dose.taken_at} • Locked & Verified
              </p>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
          {!isTaken ? (
            <button
              onClick={handleMarkTaken}
              disabled={isMarking}
              aria-label={`Mark ${dose.medication_name} as taken`}
              className="touch-target flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[8px] font-semibold text-sm bg-[#2F80ED] hover:bg-[#2563D9] text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Taken</span>
            </button>
          ) : (
            <div
              title="Medication intake is recorded and locked. Cannot be altered."
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#DCFCE7] text-[#16A34A] font-bold text-xs border border-[#16A34A]/30 cursor-not-allowed select-none shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>✓ Recorded & Locked</span>
            </div>
          )}

          {!isTaken && !showMissedHelp && (
            <button
              onClick={() => setShowMissedHelp(true)}
              aria-label={`Need help with ${dose.medication_name}?`}
              className="text-xs font-semibold text-[#64748B] hover:text-[#2F80ED] hover:underline flex items-center gap-1 py-0.5"
            >
              <HelpCircle className="w-3 h-3" /> Need guidance?
            </button>
          )}
        </div>
      </div>

      {showMissedHelp && !isTaken && (
        <div className="mt-3.5 pt-3.5 border-t border-[#FEF3C7] bg-[#FEF3C7]/40 rounded-[8px] p-3.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-bold text-[#0F172A]">
                Your medicine was not recorded. Would you like some help?
              </h4>
              <p className="text-xs text-[#475569]">
                Never double up your dose. We can check your medication monograph guidance.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleTalkToAssistant}
                  className="touch-target flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs shadow-sm transition"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Talk with Companion</span>
                </button>
                <button
                  onClick={() => setShowMissedHelp(false)}
                  className="touch-target px-3 py-1.5 rounded-[8px] bg-white border border-[#CBD5E1] text-[#334155] font-semibold text-xs hover:bg-[#F8FAFC] transition"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
