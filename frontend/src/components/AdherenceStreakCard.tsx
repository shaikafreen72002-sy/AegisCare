import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';
import { Flame, Sparkles, CheckCircle2, Award, Trophy, Check, Star } from 'lucide-react';

interface Milestone {
  days: number;
  label: string;
  title: string;
  icon: string;
  reward: string;
  color: string;
}

export const AdherenceStreakCard: React.FC = () => {
  const { profile, adherence } = usePatient();
  const [calendarDaysCount, setCalendarDaysCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aegiscare_completed_days_set');
        if (saved) return JSON.parse(saved).length;
      } catch {}
    }
    return 0;
  });

  useEffect(() => {
    const handleDaysUpdated = (e: any) => {
      const daysArr = e.detail || [];
      setCalendarDaysCount(daysArr.length);
    };
    window.addEventListener('aegiscare_days_updated', handleDaysUpdated);
    return () => window.removeEventListener('aegiscare_days_updated', handleDaysUpdated);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const previousFullDaysCompleted = (adherence.history || []).filter(
    (h) => h.date !== todayStr && (h.status === 'COMPLETED' || (h.doses_taken > 0 && h.doses_taken >= h.total_doses))
  ).length;

  const isTodayFullyCompleted = adherence.schedule.length > 0 && adherence.schedule.every((s) => s.status === 'TAKEN');
  const streakDays = Math.max(calendarDaysCount, previousFullDaysCompleted + (isTodayFullyCompleted ? 1 : 0));

  const milestones: Milestone[] = [
    { days: 1, label: 'Day 1 Done', title: 'First Step Taken', icon: '🌱', reward: 'Habit Initiator', color: 'from-emerald-500 to-teal-500' },
    { days: 5, label: 'Day 5 Done', title: '5-Day Consistency', icon: '🌿', reward: 'Consistency Builder', color: 'from-blue-500 to-indigo-500' },
    { days: 10, label: 'Day 10 Done', title: '10-Day Champion', icon: '🌳', reward: 'Wellness Master', color: 'from-purple-500 to-pink-500' },
    { days: 20, label: 'Day 20 Done', title: '20-Day Golden Streak', icon: '🏆', reward: 'Golden Adherent', color: 'from-amber-500 to-orange-500' },
    { days: 30, label: 'Day 30 Done', title: '30-Day Legend', icon: '👑', reward: 'Care Legend', color: 'from-rose-500 to-red-500' }
  ];

  const compliments = [
    `“Wonderful consistency, ${profile.preferred_name || profile.name}! Taking your medicine on time every day keeps your memory protected and your health strong. Every single day counts! ✨”`,
    `“You're doing amazing, ${profile.preferred_name || profile.name}! Staying on track with your routine brings great health and peace of mind. Keep up the brilliant work! 🌟”`,
    `“Great dedication, ${profile.preferred_name || profile.name}! Consistency is the greatest helper for daily wellness. Your care team is so proud of you! 💖”`
  ];

  const complimentText =
    streakDays === 0
      ? `“Welcome to your personalized care plan, ${profile.preferred_name || profile.name}! Take and log your scheduled doses today to begin your daily streak and build healthy wellness habits! 🌱”`
      : compliments[streakDays % compliments.length];

  return (
    <div className="bg-white border border-[#EFEAE1] rounded-[16px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)] space-y-4 animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EFE6] pb-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-[#FF6138] to-[#FFA439] text-white flex items-center justify-center font-bold shadow-[0_2px_10px_rgba(255,97,56,0.3)]">
            <Flame className={`w-7 h-7 text-white ${streakDays > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-[#2D2545] font-['Outfit']">
                {streakDays}-Day Adherence Streak
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  streakDays > 0
                    ? 'bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/20'
                    : 'bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/20'
                }`}
              >
                {streakDays > 0 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Consistent Routine
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" /> Starting Today
                  </>
                )}
              </span>
            </div>
            <span className="text-xs text-[#6B6282] font-medium">
              {streakDays > 0
                ? `Daily on-time medication adherence for ${profile.preferred_name || profile.name}`
                : `Log today's medication to start your adherence streak`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#2D2545] text-xs font-bold flex items-center gap-1.5 border border-[#EFEAE1] shadow-2xs">
            <Award className="w-4 h-4 text-[#FF6138]" />
            <span>{streakDays > 0 ? `${streakDays} Day${streakDays > 1 ? 's' : ''} 100% Completed` : 'New Habit Tracking'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#5D5570] flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FFBE53]" />
            Streak Milestones Road
          </span>
          <span className="text-[11px] text-[#6B6282] font-semibold bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#EFEAE1]">
            {streakDays} Days Completed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {milestones.map((m) => {
            const isDone = streakDays >= m.days;

            return (
              <div
                key={m.days}
                className={`p-3 rounded-[14px] border transition-all relative ${
                  isDone
                    ? 'bg-[#EAF8F0] border-[#1E824C]/30 shadow-2xs'
                    : 'bg-white border-[#EFEAE1]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{m.icon}</span>
                  {isDone ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E824C] text-white flex items-center gap-0.5 shadow-2xs">
                      <Check className="w-3 h-3" /> Done!
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#6B6282] border border-[#EFEAE1]">
                      Target
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-xs text-[#2D2545] font-['Outfit']">{m.label}</div>
                <div className="text-[10px] text-[#6B6282] font-medium leading-tight mt-0.5">{m.title}</div>
                <div className="mt-2 pt-1.5 border-t border-[#F4EFE6] flex items-center justify-between text-[9px] font-semibold text-[#8C5A00]">
                  <span>{m.reward}</span>
                  {isDone && <Star className="w-2.5 h-2.5 text-[#FFBE53] fill-[#FFBE53]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 bg-[#FAF7F2] rounded-[12px] border border-[#EFEAE1] flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-[#FFBE53] shrink-0" />
        <p className="text-xs text-[#5D5570] font-medium italic leading-relaxed">
          {complimentText}
        </p>
      </div>
    </div>
  );
};
