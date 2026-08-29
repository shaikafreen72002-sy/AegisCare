import React, { useState } from 'react';
import type { DoseScheduleItem } from '../types/adherence';
import { usePatient } from '../context/PatientContext';
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
      className={`rounded-[18px] border transition-all duration-300 p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)] ${
        isTaken
          ? 'border-[#1E824C] bg-[#EAF8F0] ring-2 ring-[#1E824C]/25 shadow-[0_8px_25px_rgba(30,130,76,0.15)]'
          : isDue
          ? 'border-[#FF6138] bg-white ring-2 ring-[#FF6138]/15'
          : isMissed
          ? 'border-[#FFBE53] bg-white'
          : 'border-[#EFEAE1] bg-white'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 h-full">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${
                isTaken
                  ? 'bg-white text-[#1E824C] shadow-xs'
                  : isDue
                  ? 'bg-[#FFF0EB] text-[#FF6138]'
                  : 'bg-[#FAF7F2] text-[#6B6282]'
              }`}
            >
              {isTaken ? <CheckCircle2 className="w-6 h-6 text-[#1E824C]" /> : <Pill className="w-6 h-6" />}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                  isTaken
                    ? 'bg-[#1E824C] text-white shadow-2xs'
                    : isDue
                    ? 'bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/25'
                    : isMissed
                    ? 'bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/40'
                    : 'bg-[#FAF7F2] text-[#6B6282] border border-[#EFEAE1]'
                }`}
              >
                {isTaken ? '✓ Taken & Recorded' : isDue ? 'Due Now' : isMissed ? 'Needs Help' : 'Upcoming'}
              </span>

              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isTaken ? 'bg-white text-[#136B3B] border-[#1E824C]/30' : mealTag.color}`}>
                {mealTag.label}
              </span>
            </div>
          </div>

          <div>
            <span className={`text-xs font-bold flex items-center gap-1 ${isTaken ? 'text-[#136B3B]' : 'text-[#6B6282]'}`}>
              <Clock className={`w-3.5 h-3.5 ${isTaken ? 'text-[#1E824C]' : 'text-[#988EA8]'}`} />
              {dose.time_slot} ({dose.scheduled_time || 'Daily'})
            </span>

            <h3 className={`text-lg font-extrabold mt-1 font-['Outfit'] ${isTaken ? 'text-[#0E4A28]' : 'text-[#2D2545]'}`}>
              {dose.medication_name}{' '}
              <span className={`text-sm font-semibold ${isTaken ? 'text-[#1B5E20]' : 'text-[#6B6282]'}`}>
                ({dose.dosage})
              </span>
            </h3>

            <p className={`text-xs mt-1 leading-relaxed ${isTaken ? 'text-[#2E7D32]' : 'text-[#5D5570]'}`}>
              {dose.instructions}
            </p>

            {isTaken && (
              <p className="text-xs font-black text-[#1E824C] mt-2.5 flex items-center gap-1.5 bg-white/80 py-1 px-2.5 rounded-[10px] w-fit border border-[#1E824C]/25">
                <Sparkles className="w-3.5 h-3.5 text-[#1E824C]" /> Recorded at {dose.taken_at || '11:27 AM'} • Logged in Adherence History
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#F4EFE6]/60 flex items-center justify-between gap-2">
          {!isTaken ? (
            <button
              onClick={handleMarkTaken}
              disabled={isMarking}
              aria-label={`Mark ${dose.medication_name} as taken`}
              className="touch-target w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-sm bg-[#FF6138] hover:bg-[#E84E27] text-white shadow-[0_2px_10px_rgba(255,97,56,0.3)] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Taken</span>
            </button>
          ) : (
            <div
              title="Medication intake is recorded and locked into clinical adherence history."
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1E824C] text-white font-bold text-xs shadow-xs select-none"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>✓ Dose Taken & Logged</span>
            </div>
          )}

          {!isTaken && !showMissedHelp && (
            <button
              onClick={() => setShowMissedHelp(true)}
              aria-label={`Need help with ${dose.medication_name}?`}
              className="text-xs font-bold text-[#6B6282] hover:text-[#FF6138] hover:underline flex items-center gap-1 py-1 px-2 shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showMissedHelp && !isTaken && (
        <div className="mt-3.5 pt-3.5 border-t border-[#FFBE53]/40 bg-[#FFF8E7] rounded-[12px] p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#8C5A00] shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-[#2D2545]">
                Your medicine was not recorded. Would you like some guidance?
              </h4>
              <p className="text-[11px] text-[#5D5570]">
                Never double up your dose. We can check your medication monograph guidance.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleTalkToAssistant}
                  className="touch-target flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-xs shadow-xs transition"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Talk with Companion</span>
                </button>
                <button
                  onClick={() => setShowMissedHelp(false)}
                  className="text-xs text-[#6B6282] hover:underline px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
