import React, { useState } from 'react';
import type { DoseScheduleItem } from '../types/adherence';
import { usePatient } from '../context/PatientContext';
import { CheckCircle2, Clock, HelpCircle, Pill, AlertCircle, Sparkles, MessageSquareHeart, ShieldAlert, Timer } from 'lucide-react';

interface MedicationCardProps {
  dose: DoseScheduleItem;
  onOpenChatWithTopic?: (topic: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ dose, onOpenChatWithTopic }) => {
  const { markDoseAsTaken, setActiveTab } = usePatient();
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkTaken = async () => {
    setIsMarking(true);
    try {
      await markDoseAsTaken(dose.id);
    } finally {
      setIsMarking(false);
    }
  };

  const handleTalkToAssistant = (customTopic?: string) => {
    const topic = customTopic || `I have a question about my ${dose.time_slot} dose of ${dose.medication_name}. What should I do?`;
    if (onOpenChatWithTopic) {
      onOpenChatWithTopic(topic);
    } else {
      setActiveTab('chat');
    }
  };

  const isTaken = dose.status === 'TAKEN';
  const isSnoozed = dose.status === 'SNOOZED';
  const isUnsure = dose.status === 'UNSURE';
  const isMissed = dose.status === 'MISSED';
  const isDue = dose.status === 'DUE';

  const getMealTag = () => {
    const s = (dose.time_slot || '').toLowerCase();
    const t = (dose.scheduled_time || '').toLowerCase();
    const hourNum = parseInt(t.split(':')[0] || '20', 10);
    if (s.includes('breakfast') || s.includes('morning') || hourNum < 12) {
      return { label: '☕ Before / With Breakfast', color: 'bg-[#FFF8E7] text-[#8C5A00] border-[#FFBE53]/40' };
    }
    if (s.includes('lunch') || s.includes('afternoon') || (hourNum >= 12 && hourNum < 17)) {
      return { label: '🍽️ After Lunch (Midday)', color: 'bg-[#EBF2FF] text-[#1D5BD8] border-[#4E89FF]/30' };
    }
    return { label: '🌙 After Dinner / Bedtime', color: 'bg-[#F2EDFF] text-[#5B31D8] border-[#7952EC]/30' };
  };

  const mealTag = getMealTag();

  return (
    <div
      className={`rounded-[20px] border transition-all duration-300 p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)] ${
        isTaken
          ? 'border-[#1E824C] bg-[#EAF8F0] ring-2 ring-[#1E824C]/25 shadow-[0_8px_25px_rgba(30,130,76,0.15)]'
          : isSnoozed
          ? 'border-[#FFBE53] bg-[#FFF8E7] ring-2 ring-[#FFBE53]/30'
          : isUnsure
          ? 'border-[#4E89FF] bg-[#EBF2FF] ring-2 ring-[#4E89FF]/25'
          : isMissed
          ? 'border-[#E53E3E] bg-[#FFF0F0] ring-2 ring-[#E53E3E]/25'
          : isDue
          ? 'border-[#FF6138] bg-white ring-2 ring-[#FF6138]/15'
          : 'border-[#EFEAE1] bg-white'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 h-full">
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${
                isTaken
                  ? 'bg-white text-[#1E824C] shadow-xs'
                  : isSnoozed
                  ? 'bg-white text-[#B37400] shadow-xs'
                  : isUnsure
                  ? 'bg-white text-[#1D5BD8] shadow-xs'
                  : isMissed
                  ? 'bg-white text-[#C53030] shadow-xs'
                  : isDue
                  ? 'bg-[#FFF0EB] text-[#FF6138]'
                  : 'bg-[#FAF7F2] text-[#6B6282]'
              }`}
            >
              {isTaken ? (
                <CheckCircle2 className="w-6 h-6 text-[#1E824C]" />
              ) : isSnoozed ? (
                <Timer className="w-6 h-6 text-[#B37400]" />
              ) : isUnsure ? (
                <HelpCircle className="w-6 h-6 text-[#1D5BD8]" />
              ) : isMissed ? (
                <ShieldAlert className="w-6 h-6 text-[#C53030]" />
              ) : (
                <Pill className="w-6 h-6" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                  isTaken
                    ? 'bg-[#1E824C] text-white shadow-2xs'
                    : isSnoozed
                    ? 'bg-[#FFBE53] text-[#4A3200] border border-[#FFBE53]'
                    : isUnsure
                    ? 'bg-[#4E89FF] text-white'
                    : isMissed
                    ? 'bg-[#E53E3E] text-white'
                    : isDue
                    ? 'bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/25'
                    : 'bg-[#FAF7F2] text-[#6B6282] border border-[#EFEAE1]'
                }`}
              >
                {isTaken
                  ? '✓ Taken & Recorded'
                  : isSnoozed
                  ? '⏰ Snoozed (CareBot)'
                  : isUnsure
                  ? '❓ Unsure (CareBot)'
                  : isMissed
                  ? '❌ Missed Dose (CareBot)'
                  : isDue
                  ? 'Due Now'
                  : 'Upcoming'}
              </span>

              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isTaken ? 'bg-white text-[#136B3B] border-[#1E824C]/30' : mealTag.color
                }`}
              >
                {mealTag.label}
              </span>
            </div>
          </div>

          {/* Medication Info */}
          <div>
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                isTaken
                  ? 'text-[#136B3B]'
                  : isSnoozed
                  ? 'text-[#8C5A00]'
                  : isUnsure
                  ? 'text-[#1D5BD8]'
                  : isMissed
                  ? 'text-[#C53030]'
                  : 'text-[#6B6282]'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  isTaken
                    ? 'text-[#1E824C]'
                    : isSnoozed
                    ? 'text-[#B37400]'
                    : isMissed
                    ? 'text-[#C53030]'
                    : isUnsure
                    ? 'text-[#1D5BD8]'
                    : 'text-[#988EA8]'
                }`}
              />
              {dose.time_slot} ({dose.scheduled_time || 'Daily'})
            </span>

            <h3
              className={`text-lg font-extrabold mt-1 font-['Outfit'] ${
                isTaken
                  ? 'text-[#0E4A28]'
                  : isSnoozed
                  ? 'text-[#4A3200]'
                  : isUnsure
                  ? 'text-[#0F2F7A]'
                  : isMissed
                  ? 'text-[#7B1D1D]'
                  : 'text-[#2D2545]'
              }`}
            >
              {dose.medication_name}{' '}
              <span
                className={`text-sm font-semibold ${
                  isTaken
                    ? 'text-[#1B5E20]'
                    : isSnoozed
                    ? 'text-[#8C5A00]'
                    : isMissed
                    ? 'text-[#9B2C2C]'
                    : 'text-[#6B6282]'
                }`}
              >
                ({dose.dosage})
              </span>
            </h3>

            <p
              className={`text-xs mt-1 leading-relaxed ${
                isTaken
                  ? 'text-[#2E7D32]'
                  : isSnoozed
                  ? 'text-[#734A00]'
                  : isUnsure
                  ? 'text-[#1D5BD8]'
                  : isMissed
                  ? 'text-[#9B2C2C]'
                  : 'text-[#5D5570]'
              }`}
            >
              {dose.instructions}
            </p>
          </div>

          {/* FRONT-AND-CENTER STATUS & MONOGRAPH GUIDELINES */}
          {isTaken && (
            <div className="p-3 bg-white/80 border border-[#1E824C]/25 rounded-[12px] space-y-0.5 shadow-2xs">
              <p className="text-xs font-black text-[#1E824C] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1E824C]" /> Recorded at {dose.taken_at || '11:27 AM'} • Verified in History
              </p>
              <p className="text-[11px] text-[#2E7D32]">
                Adherence recorded and locked. Great consistency! 🌸
              </p>
            </div>
          )}

          {isSnoozed && (
            <div className="p-3 bg-white/90 border border-[#FFBE53]/50 rounded-[12px] space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C5A00]">
                <Timer className="w-4 h-4 text-[#B37400]" />
                <span>Snoozed via Telegram @BversityCareBot</span>
              </div>
              <p className="text-[11px] text-[#5D5570] leading-relaxed">
                Take your time with a fresh glass of water. A gentle follow-up prompt will arrive.
              </p>
            </div>
          )}

          {isUnsure && (
            <div className="p-3.5 bg-white/95 border border-[#4E89FF]/30 rounded-[12px] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D5BD8]">
                <HelpCircle className="w-4 h-4 text-[#1D5BD8]" />
                <span>Monograph Safety Rule:</span>
              </div>
              <p className="text-[11px] text-[#334155] leading-relaxed">
                <strong>Never double up or take extra tablets if unsure.</strong> Please check your daily pill organizer or blister pack.
              </p>
            </div>
          )}

          {isMissed && (
            <div className="p-3.5 bg-white/95 border border-[#E53E3E]/30 rounded-[12px] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C53030]">
                <ShieldAlert className="w-4 h-4 text-[#C53030]" />
                <span>Clinical Monograph Rule for Missed Dose:</span>
              </div>
              <p className="text-[11px] text-[#334155] leading-relaxed">
                Skip this missed dose completely. <strong>Strictly do NOT take a double dose tomorrow.</strong> Resume your regular schedule at your next normal timing.
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION AREA */}
        <div className="pt-2 border-t border-[#F4EFE6]/60 space-y-2">
          {isTaken ? (
            <div
              title="Medication intake is recorded and locked into clinical adherence history."
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1E824C] text-white font-bold text-sm shadow-xs select-none"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>✓ Recorded & Locked in History</span>
            </div>
          ) : isMissed ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleTalkToAssistant(`I missed my ${dose.time_slot} dose of ${dose.medication_name}. What is the official monograph safety guidance?`)}
                className="touch-target w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-xs bg-[#C53030] hover:bg-[#9B2C2C] text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>Talk with Companion about Missed Dose</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleMarkTaken}
                  disabled={isMarking}
                  className="text-[11px] text-[#6B6282] hover:text-[#2D2545] font-semibold underline cursor-pointer"
                >
                  If you actually took it, click here to mark as taken
                </button>
              </div>
            </div>
          ) : isUnsure ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleTalkToAssistant(`I am not sure if I took my ${dose.time_slot} dose of ${dose.medication_name}. Can you help me check safely?`)}
                className="touch-target w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-xs bg-[#1D5BD8] hover:bg-[#1546B0] text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>Talk with Companion for Guidance</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleMarkTaken}
                  disabled={isMarking}
                  className="text-[11px] text-[#1D5BD8] hover:underline font-bold cursor-pointer"
                >
                  ✓ I checked my organizer and took it now
                </button>
              </div>
            </div>
          ) : isSnoozed ? (
            <div className="space-y-1.5">
              <button
                onClick={handleMarkTaken}
                disabled={isMarking}
                aria-label={`Mark ${dose.medication_name} as taken`}
                className="touch-target w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-xs bg-[#B37400] hover:bg-[#8C5A00] text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ Take & Mark as Taken Now</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleMarkTaken}
              disabled={isMarking}
              aria-label={`Mark ${dose.medication_name} as taken`}
              className="touch-target w-full flex items-center justify-center gap-1.5 py-3 rounded-full font-bold text-sm bg-[#FF6138] hover:bg-[#E84E27] text-white shadow-[0_2px_10px_rgba(255,97,56,0.3)] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Taken</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
