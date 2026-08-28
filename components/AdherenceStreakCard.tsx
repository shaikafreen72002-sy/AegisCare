'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { ConfettiPartyPopper } from './ConfettiPartyPopper';
import { Flame, Sparkles, CheckCircle2, Award, Trophy, PartyPopper, Check, Star, ShieldCheck, X } from 'lucide-react';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedMilestone, setCelebratedMilestone] = useState<Milestone | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Count past full days completed (excluding today to ensure 1 day per whole day)
  const previousFullDaysCompleted = (adherence.history || []).filter(
    (h) => h.date !== todayStr && (h.status === 'COMPLETED' || (h.doses_taken > 0 && h.doses_taken >= h.total_doses))
  ).length;

  // Today counts as 1 full day ONLY IF all doses scheduled for today are taken
  const isTodayFullyCompleted = adherence.schedule.length > 0 && adherence.schedule.every((s) => s.status === 'TAKEN');
  const streakDays = previousFullDaysCompleted + (isTodayFullyCompleted ? 1 : 0);

  const milestones: Milestone[] = [
    { days: 1, label: 'Day 1 Done', title: 'First Step Taken', icon: '🌱', reward: 'Habit Initiator', color: 'from-emerald-500 to-teal-500' },
    { days: 5, label: 'Day 5 Done', title: '5-Day Consistency', icon: '🌿', reward: 'Consistency Builder', color: 'from-blue-500 to-indigo-500' },
    { days: 10, label: 'Day 10 Done', title: '10-Day Champion', icon: '🌳', reward: 'Wellness Master', color: 'from-purple-500 to-pink-500' },
    { days: 20, label: 'Day 20 Done', title: '20-Day Golden Streak', icon: '🏆', reward: 'Golden Adherent', color: 'from-amber-500 to-orange-500' },
    { days: 30, label: 'Day 30 Done', title: '30-Day Legend', icon: '👑', reward: 'Care Legend', color: 'from-rose-500 to-red-500' }
  ];

  // Trigger party celebration automatically
  const triggerCelebration = (m: Milestone) => {
    setCelebratedMilestone(m);
    setShowConfetti(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Congratulations ${profile.preferred_name || profile.name}! You have achieved the ${m.label} Milestone! Your consistency is keeping your health protected.`
      );
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-celebrate automatically when a milestone is reached
  useEffect(() => {
    if (streakDays > 0) {
      const matched = milestones.find((m) => m.days === streakDays);
      if (matched) {
        const key = `aegiscare_milestone_celebrated_${profile.preferred_name || 'patient'}_${matched.days}`;
        if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          triggerCelebration(matched);
        }
      }
    }
  }, [streakDays, profile.preferred_name]);

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
      {/* Canvas Confetti Explosion */}
      <ConfettiPartyPopper active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Celebratory Milestone Modal Banner */}
      {celebratedMilestone && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-[#1E1A2E]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-2 border-[#FFBE53] rounded-[20px] p-6 max-w-md w-full shadow-[0_20px_50px_rgba(45,37,69,0.25)] text-center space-y-4 animate-scale-up">
            <div className="text-5xl animate-bounce">{celebratedMilestone.icon}</div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C5A00] bg-[#FFF8E7] px-3.5 py-1 rounded-full border border-[#FFBE53]/40">
                🎉 Milestone Achieved!
              </span>
              <h3 className="text-2xl font-black text-[#2D2545] mt-2 font-['Outfit']">
                {celebratedMilestone.label}
              </h3>
              <p className="text-sm font-bold text-[#FF6138] mt-0.5">
                {celebratedMilestone.title} • {celebratedMilestone.reward}
              </p>
              <p className="text-xs text-[#5D5570] mt-2 leading-relaxed">
                Outstanding dedication, <strong>{profile.preferred_name || profile.name}</strong>! Taking your prescribed medication consistently protects your health and sets a wonderful wellness habit!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCelebratedMilestone(null)}
              className="touch-target w-full py-3 rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,97,56,0.35)] transition active:scale-[0.98] cursor-pointer"
            >
              Continue My Healthy Routine 🚀
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EFE6] pb-3">
        <div className="flex items-center gap-3">
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

      {/* ================= STREAK MILESTONES PROGRESS TRACK ================= */}
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
            const isCurrentTarget = !isDone && (streakDays < m.days);

            return (
              <div
                key={m.days}
                onClick={() => {
                  if (isDone) triggerCelebration(m);
                }}
                className={`p-3.5 rounded-[14px] border transition-all text-left relative flex flex-col justify-between ${
                  isDone
                    ? 'bg-[#EAF8F0] border-[#1E824C]/30 shadow-xs cursor-pointer hover:border-[#1E824C] hover:bg-[#D4F4E4]'
                    : isCurrentTarget
                    ? 'bg-white border-[#FF6138] ring-2 ring-[#FF6138]/15 shadow-2xs'
                    : 'bg-[#FAF7F2] border-[#EFEAE1] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{m.icon}</span>
                    {isDone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E824C] text-white flex items-center gap-0.5 shadow-2xs">
                        <Check className="w-3 h-3" /> Done!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#6B6282] bg-[#EFEAE1] px-2 py-0.5 rounded-full">
                        Target
                      </span>
                    )}
                  </div>

                  <h4 className={`text-xs font-extrabold mt-2 font-['Outfit'] ${isDone ? 'text-[#136B3B]' : 'text-[#2D2545]'}`}>
                    {m.label}
                  </h4>
                  <p className="text-[11px] text-[#6B6282] font-medium leading-tight mt-0.5">
                    {m.title}
                  </p>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-[#EFEAE1] flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#5D5570]">{m.reward}</span>
                  {isDone && <span className="text-[#FF6138] font-bold">🎉</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Compliment Box */}
      <div className="p-4 bg-[#FAF7F2] border border-[#EFEAE1] rounded-[12px] flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#FFBE53] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-[#40365D] font-medium leading-relaxed italic">
          {complimentText}
        </p>
      </div>
    </div>
  );
};
