'use client';

import React from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { Flame, Sparkles, CheckCircle2, Award } from 'lucide-react';

export const AdherenceStreakCard: React.FC = () => {
  const { profile, adherence } = usePatient();

  const historyCompleted = adherence.history.filter((h) => h.status === 'COMPLETED').length;
  const streakDays = Math.max(5, historyCompleted + (adherence.schedule.some((s) => s.status === 'TAKEN') ? 1 : 0));

  const compliments = [
    `“Wonderful consistency, ${profile.preferred_name || profile.name}! Taking your medicine on time every day keeps your memory protected and your heart strong. Every single day counts! ✨”`,
    `“You're doing amazing, ${profile.preferred_name || profile.name}! Staying on track with your routine brings great health and peace of mind. Keep up the brilliant work! 🌟”`,
    `“Great dedication, ${profile.preferred_name || profile.name}! Consistency is the greatest helper for daily wellness. Priya and your care team are so proud of you! 💖”`
  ];

  const complimentText = compliments[streakDays % compliments.length];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold shadow-xs">
            <Flame className="w-6 h-6 text-[#EA580C] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {streakDays}-Day Adherence Streak
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Consistent
              </span>
            </div>
            <span className="text-xs text-[#64748B] font-medium">
              Daily on-time medication adherence for {profile.preferred_name || profile.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] text-xs font-bold flex items-center gap-1.5 border border-[#CBD5E1]/40">
            <Award className="w-4 h-4 text-[#2F80ED]" />
            <span>Top 5% Routine Consistency</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-[#334155] font-medium leading-relaxed italic">
          {complimentText}
        </p>
      </div>
    </div>
  );
};
