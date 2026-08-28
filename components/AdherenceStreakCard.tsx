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

  const fullDaysCompleted = (adherence.history || []).filter(
    (h) => h.status === 'COMPLETED' || (h.doses_taken > 0 && h.doses_taken === h.total_doses)
  ).length;

  const allTodayTaken = adherence.schedule.length > 0 && adherence.schedule.every((s) => s.status === 'TAKEN');
  const streakDays = fullDaysCompleted + (allTodayTaken ? 1 : 0);

  const milestones: Milestone[] = [
    { days: 1, label: 'Day 1 Done', title: 'First Step Taken', icon: '🌱', reward: 'Habit Initiator', color: 'from-emerald-500 to-teal-500' },
    { days: 5, label: 'Day 5 Done', title: '5-Day Consistency', icon: '🌿', reward: 'Consistency Builder', color: 'from-blue-500 to-indigo-500' },
    { days: 10, label: 'Day 10 Done', title: '10-Day Champion', icon: '🌳', reward: 'Wellness Master', color: 'from-purple-500 to-pink-500' },
    { days: 20, label: 'Day 20 Done', title: '20-Day Golden Streak', icon: '🏆', reward: 'Golden Adherent', color: 'from-amber-500 to-orange-500' },
    { days: 30, label: 'Day 30 Done', title: '30-Day Legend', icon: '👑', reward: 'Care Legend', color: 'from-rose-500 to-red-500' }
  ];

  // Trigger party celebration
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

  // Auto-celebrate when reaching milestone
  useEffect(() => {
    const matched = milestones.find((m) => m.days === streakDays);
    if (matched && streakDays > 0) {
      const key = `aegiscare_milestone_celebrated_${profile.preferred_name || 'patient'}_${matched.days}`;
      if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        triggerCelebration(matched);
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
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4 animate-fade-in relative overflow-hidden">
      {/* Canvas Confetti Explosion */}
      <ConfettiPartyPopper active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Celebratory Milestone Modal Banner */}
      {celebratedMilestone && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-2 border-[#F59E0B] rounded-[14px] p-6 max-w-md w-full shadow-[0_16px_40px_rgba(0,0,0,0.2)] text-center space-y-4 animate-scale-up">
            <div className="text-5xl animate-bounce">{celebratedMilestone.icon}</div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] bg-[#FEF3C7] px-3 py-1 rounded-full">
                🎉 Milestone Achieved!
              </span>
              <h3 className="text-2xl font-black text-[#0F172A] mt-2">
                {celebratedMilestone.label}
              </h3>
              <p className="text-sm font-semibold text-[#2F80ED] mt-0.5">
                {celebratedMilestone.title} • {celebratedMilestone.reward}
              </p>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Outstanding dedication, <strong>{profile.preferred_name || profile.name}</strong>! Taking your prescribed medication consistently protects your health and sets a wonderful wellness habit!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCelebratedMilestone(null)}
              className="touch-target w-full py-2.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              Continue My Healthy Routine 🚀
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[10px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold shadow-xs">
            <Flame className={`w-7 h-7 text-[#EA580C] ${streakDays > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A]">
                {streakDays}-Day Adherence Streak
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  streakDays > 0
                    ? 'bg-[#DCFCE7] text-[#16A34A]'
                    : 'bg-[#EAF3FF] text-[#2F80ED]'
                }`}
              >
                {streakDays > 0 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Consistent
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" /> Starting Today
                  </>
                )}
              </span>
            </div>
            <span className="text-xs text-[#64748B] font-medium">
              {streakDays > 0
                ? `Daily on-time medication adherence for ${profile.preferred_name || profile.name}`
                : `Log today's medication to start your adherence streak`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => triggerCelebration(milestones[0])}
            title="Click to celebrate streak progress with party poppers"
            className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] text-xs font-bold border border-[#F59E0B]/30 shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <PartyPopper className="w-4 h-4 text-[#EA580C]" />
            <span>Celebrate! 🎉</span>
          </button>
        </div>
      </div>

      {/* ================= STREAK MILESTONES PROGRESS TRACK ================= */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            Streak Milestones Road
          </span>
          <span className="text-[11px] text-[#64748B] font-medium">
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
                className={`p-3 rounded-[10px] border transition-all text-left relative flex flex-col justify-between ${
                  isDone
                    ? 'bg-[#F0FDF4] border-[#16A34A]/40 shadow-xs cursor-pointer hover:border-[#16A34A] hover:bg-[#DCFCE7]'
                    : isCurrentTarget
                    ? 'bg-white border-[#2F80ED] ring-1 ring-[#2F80ED]/20 shadow-2xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{m.icon}</span>
                    {isDone ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#16A34A] text-white flex items-center gap-0.5 shadow-2xs">
                        <Check className="w-3 h-3" /> Done!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#64748B] bg-[#E2E8F0] px-1.5 py-0.2 rounded">
                        Target
                      </span>
                    )}
                  </div>

                  <h4 className={`text-xs font-bold mt-1.5 ${isDone ? 'text-[#16A34A]' : 'text-[#0F172A]'}`}>
                    {m.label}
                  </h4>
                  <p className="text-[11px] text-[#64748B] leading-tight mt-0.5">
                    {m.title}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#E2E8F0]/60 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#475569]">{m.reward}</span>
                  {isDone && <span className="text-[#EA580C] font-bold">🎉</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Compliment Box */}
      <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-[#334155] font-medium leading-relaxed italic">
          {complimentText}
        </p>
      </div>
    </div>
  );
};
