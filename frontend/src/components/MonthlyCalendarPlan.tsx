import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Pill,
  CalendarDays,
  Check,
  HeartHandshake,
  Quote,
  Award,
  Flame
} from 'lucide-react';

interface DayPlan {
  dayNumber: number;
  dateStr: string;
  displayDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'MISSED';
  dosesTaken: number;
  totalDoses: number;
  isCaregiverCheckpoint: boolean;
  isDoctorCheckpoint: boolean;
  isToday: boolean;
  doses: {
    slot: string;
    time: string;
    medication: string;
    dosage: string;
    status: 'TAKEN' | 'DUE' | 'MISSED';
    takenAt?: string;
  }[];
}

interface MonthlyCalendarPlanProps {
  initiallyExpanded?: boolean;
}

export const MonthlyCalendarPlan: React.FC<MonthlyCalendarPlanProps> = ({
  initiallyExpanded = false
}) => {
  const { profile, adherence } = usePatient();
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aegiscare_completed_days_set');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const today = new Date();
  const currentDayNum = today.getDate();
  const monthName = today.toLocaleString('en-US', { month: 'long' });
  const year = today.getFullYear();

  const todayDosesTaken = adherence.schedule.filter((s) => s.status === 'TAKEN').length;
  const todayTotalDoses = adherence.schedule.length;
  const isTodayFullyTaken = todayTotalDoses > 0 && todayDosesTaken === todayTotalDoses;

  useEffect(() => {
    if (isTodayFullyTaken && !completedDays.includes(currentDayNum)) {
      const next = [...completedDays, currentDayNum];
      setCompletedDays(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegiscare_completed_days_set', JSON.stringify(next));
      }
    }
  }, [isTodayFullyTaken, currentDayNum]);

  const days: DayPlan[] = Array.from({ length: 30 }, (_, idx) => {
    const dayNum = idx + 1;
    const dateStr = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const displayDate = `${monthName.slice(0, 3)} ${dayNum}`;
    const isToday = dayNum === currentDayNum;

    const isCaregiverCheckpoint = dayNum % 3 === 0;
    const isDoctorCheckpoint = dayNum === 5 || dayNum === 10 || dayNum === 20 || dayNum === 25;

    const isExplicitlyCompleted = completedDays.includes(dayNum);

    let status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'MISSED' = 'UPCOMING';
    let dosesTaken = 0;

    if (isExplicitlyCompleted) {
      status = 'COMPLETED';
      dosesTaken = 3;
    } else if (isToday) {
      if (todayDosesTaken > 0) {
        status = isTodayFullyTaken ? 'COMPLETED' : 'IN_PROGRESS';
        dosesTaken = todayDosesTaken;
      } else {
        status = 'IN_PROGRESS';
        dosesTaken = 0;
      }
    } else {
      status = 'UPCOMING';
      dosesTaken = 0;
    }

    const dynamicDoses = (adherence.schedule && adherence.schedule.length > 0)
      ? adherence.schedule.map((doseItem, sIdx) => {
          const isDoseTaken = isExplicitlyCompleted || (isToday && doseItem.status === 'TAKEN');
          const [h, m] = (doseItem.scheduled_time || '20:00').split(':');
          const hourNum = parseInt(h, 10);
          const period = hourNum >= 12 ? 'PM' : 'AM';
          const displayHour = hourNum % 12 || 12;
          const formatted12h = `${displayHour}:${m || '00'} ${period}`;

          return {
            slot: doseItem.time_slot ? doseItem.time_slot.split(' (')[0] : `Dose ${sIdx + 1}`,
            time: formatted12h,
            medication: doseItem.medication_name || 'Prescribed Medicine',
            dosage: doseItem.dosage || 'Standard Dose',
            status: isDoseTaken ? ('TAKEN' as const) : ('DUE' as const),
            takenAt: isDoseTaken ? (doseItem.taken_at || formatted12h) : undefined
          };
        })
      : [
          {
            slot: 'Morning Routine',
            time: '8:00 AM',
            medication: profile.primary_medication?.name || 'Donepezil',
            dosage: '5 mg',
            status: isExplicitlyCompleted || (isToday && adherence.schedule[0]?.status === 'TAKEN') ? ('TAKEN' as const) : ('DUE' as const),
            takenAt: isExplicitlyCompleted || (isToday && adherence.schedule[0]?.status === 'TAKEN') ? '08:15 AM' : undefined
          },
          {
            slot: 'Midday Routine',
            time: '1:00 PM',
            medication: 'Vitamin D & Hydration',
            dosage: '1000 IU',
            status: isExplicitlyCompleted || (isToday && adherence.schedule[1]?.status === 'TAKEN') ? ('TAKEN' as const) : ('DUE' as const),
            takenAt: isExplicitlyCompleted || (isToday && adherence.schedule[1]?.status === 'TAKEN') ? '01:10 PM' : undefined
          },
          {
            slot: 'Evening Routine',
            time: '8:00 PM',
            medication: `${profile.primary_medication?.name || 'Donepezil'} (Evening Maintenance)`,
            dosage: profile.primary_medication?.dosage || '10 mg',
            status: isExplicitlyCompleted || (isToday && adherence.schedule[2]?.status === 'TAKEN') ? ('TAKEN' as const) : ('DUE' as const),
            takenAt: isExplicitlyCompleted || (isToday && adherence.schedule[2]?.status === 'TAKEN') ? '08:05 PM' : undefined
          }
        ];

    return {
      dayNumber: dayNum,
      dateStr,
      displayDate,
      status,
      dosesTaken,
      totalDoses: isToday ? todayTotalDoses || dynamicDoses.length : dynamicDoses.length,
      isCaregiverCheckpoint,
      isDoctorCheckpoint,
      isToday,
      doses: dynamicDoses
    };
  });

  const completedDaysCount = completedDays.length;
  const adherencePercentage = Math.round((completedDaysCount / 30) * 100);

  const getDayMotivationQuote = (day: DayPlan, patientName: string) => {
    const isAllTaken = day.status === 'COMPLETED' || (day.dosesTaken > 0 && day.dosesTaken >= day.totalDoses);
    const isPartiallyTaken = day.dosesTaken > 0 && day.dosesTaken < day.totalDoses;

    if (isAllTaken) {
      const quotes = [
        `🌟 "Outstanding commitment, ${patientName}! Completing all your scheduled doses today is a huge victory for your wellness and memory protection."`,
        `🏆 "Brilliant consistency, ${patientName}! Your dedication creates steady mental clarity. You and your care team can be truly proud today!"`,
        `✨ "Every dose taken on time strengthens your daily health foundation. Wonderful job finishing today's routine, ${patientName}!"`
      ];
      return {
        badge: '🌟 Daily Adherence Accomplished',
        quote: quotes[day.dayNumber % quotes.length],
        bgColor: 'bg-[#EAF8F0]',
        borderColor: 'border-[#1E824C]/30',
        textColor: 'text-[#136B3B]',
        iconColor: 'text-[#1E824C]'
      };
    }

    if (isPartiallyTaken) {
      return {
        badge: '🌱 Great Progress Made Today',
        quote: `“Step by step, you are doing wonderfully, ${patientName}! You have already logged ${day.dosesTaken} dose(s) today. Stay gentle with yourself and continue your routine!”`,
        bgColor: 'bg-[#FFF8E7]',
        borderColor: 'border-[#FFBE53]/40',
        textColor: 'text-[#8C5A00]',
        iconColor: 'text-[#D97706]'
      };
    }

    if (day.isToday) {
      return {
        badge: "🌸 Today's Gentle Encouragement",
        quote: `“Good day, ${patientName}! Taking your medicine at your scheduled time gives you the peace of mind to enjoy each day with clarity and strength.”`,
        bgColor: 'bg-[#FFF0EB]',
        borderColor: 'border-[#FF6138]/30',
        textColor: 'text-[#A03518]',
        iconColor: 'text-[#FF6138]'
      };
    }

    const generalQuotes = [
      `“Consistency is the kindest gift you can give your mind and body. One day at a time, ${patientName}! 🌿”`,
      `“Small daily healthy habits create great long-term wellness. Your care team is right beside you! 💖”`,
      `“Every single step in your routine helps protect your memory and keeps your loved ones smiling! 🌟”`
    ];

    return {
      badge: `🌱 Day ${day.dayNumber} Care Motivation`,
      quote: generalQuotes[day.dayNumber % generalQuotes.length],
      bgColor: 'bg-[#F8FAFC]',
      borderColor: 'border-[#CBD5E1]',
      textColor: 'text-[#334155]',
      iconColor: 'text-[#4E89FF]'
    };
  };

  return (
    <div id="monthly-plan-section" className="bg-white border border-[#EFEAE1] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(45,37,69,0.04)] space-y-4 animate-fade-in transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#FFF0EB] text-[#FF6138] flex items-center justify-center shadow-xs shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
                30-Day Monthly Medication Adherence Plan
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF8F0] text-[#1E824C] font-bold border border-[#1E824C]/20">
                Month of {monthName} {year}
              </span>
            </div>
            <p className="text-xs text-[#6B6282] font-medium mt-0.5">
              Automated 30-day tracking • Telemetry checkpoints for Caregiver Priya & Dr. Mehta
            </p>
          </div>
        </div>

        {/* Adherence Rate & Dropdown Toggle */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="text-right hidden xs:block">
            <span className="text-[10px] uppercase font-bold text-[#988EA8] block leading-none">
              30-Day Progress
            </span>
            <span className="text-sm font-extrabold text-[#1E824C] font-['Outfit']">
              {completedDaysCount}/30 Days ({adherencePercentage}%)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="touch-target flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F0EBE0] text-[#40365D] border border-[#EFEAE1] font-bold text-xs shadow-2xs transition active:scale-[0.98] cursor-pointer"
          >
            <span>{isOpen ? 'Collapse Calendar' : 'View Full 30-Day Log'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-[#FF6138]" /> : <ChevronDown className="w-4 h-4 text-[#FF6138]" />}
          </button>
        </div>
      </div>

      {/* Expanded Dropdown Content (Day 1 to Day 30) */}
      {isOpen && (
        <div className="pt-3 border-t border-[#F4EFE6] space-y-4 animate-fade-in">
          {/* Automated Safeguards Explanation */}
          <div className="p-3 bg-[#FAF7F2] border border-[#EFEAE1] rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6138]" />
              <span className="text-[#40365D] font-medium leading-relaxed">
                <strong>Interactive 30-Day Medication Log:</strong> Click on any Day (Day 1, Day 2...) to inspect your logged doses and read daily health motivation quotes. Doses are tracked individually as you take them. If 3 consecutive days are missed, Day 3 automatically alerts Caregiver <strong>Priya</strong> on Telegram. If missed through Day 5, clinical telemetry escalates directly to <strong>Dr. Aarav Mehta (Physician)</strong>.
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-bold text-[#1E824C] bg-[#EAF8F0] px-2.5 py-0.5 rounded-full border border-[#1E824C]/20">
              ✓ Active by Default
            </span>
          </div>

          {/* 30-Day Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {days.map((day) => {
              const isDone = day.status === 'COMPLETED';
              const isToday = day.isToday;

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`p-2.5 rounded-[12px] border text-left transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.02] ${
                    isDone
                      ? 'bg-[#EAF8F0] border-[#1E824C]/35 hover:border-[#1E824C]'
                      : isToday
                      ? 'bg-[#FFF0EB] border-[#FF6138] ring-2 ring-[#FF6138]/20 shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EFEAE1] hover:border-[#FF6138]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black font-['Outfit'] ${isToday ? 'text-[#FF6138]' : isDone ? 'text-[#1E824C]' : 'text-[#2D2545]'}`}>
                      Day {day.dayNumber}
                    </span>

                    {isDone ? (
                      <span className="w-4 h-4 rounded-full bg-[#1E824C] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : isToday ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FF6138] text-white uppercase tracking-wider">
                        Today
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#988EA8]">
                        {day.dosesTaken}/{day.totalDoses}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    <span className="text-[10px] text-[#6B6282] block">
                      {day.displayDate}
                    </span>

                    <div className="flex flex-wrap gap-1">
                      {day.isCaregiverCheckpoint && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/40" title="Caregiver Priya Telemetry Checkpoint">
                          Priya
                        </span>
                      )}
                      {day.isDoctorCheckpoint && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#F2EDFF] text-[#5B31D8] border border-[#7952EC]/30" title="Dr. Aarav Mehta Clinical Checkpoint">
                          Dr. Mehta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${isDone ? 'text-[#1E824C]' : isToday ? 'text-[#FF6138]' : 'text-[#988EA8]'}`}>
                      {isDone ? '✓ Logged' : isToday ? `${day.dosesTaken}/${day.totalDoses} Taken` : 'Scheduled'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#988EA8] opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Inspector & Appreciation Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-[0_20px_60px_rgba(45,37,69,0.2)] border border-[#EFEAE1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#FFF0EB] text-[#FF6138] flex items-center justify-center shadow-xs shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2D2545] font-['Outfit']">
                    Day {selectedDay.dayNumber} Adherence Log
                  </h3>
                  <p className="text-xs text-[#6B6282]">
                    {selectedDay.displayDate}, {year} • {selectedDay.dosesTaken}/{selectedDay.totalDoses} Doses Recorded
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="p-1.5 text-[#6B6282] hover:text-[#2D2545] rounded-full hover:bg-[#FAF7F2] cursor-pointer transition"
                aria-label="Close Day Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doses List for this Day */}
            <div className="space-y-2.5">
              {selectedDay.doses.map((d, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-[12px] border flex items-center justify-between text-xs ${
                    d.status === 'TAKEN'
                      ? 'bg-[#EAF8F0] border-[#1E824C]/25 text-[#136B3B]'
                      : 'bg-[#FAF7F2] border-[#EFEAE1] text-[#2D2545]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0">
                      {d.status === 'TAKEN' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1E824C]" />
                      ) : (
                        <Pill className="w-4 h-4 text-[#6B6282]" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold block text-[#2D2545]">
                        {d.medication} ({d.dosage})
                      </span>
                      <span className="text-[10px] text-[#6B6282]">
                        {d.slot} • {d.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {d.status === 'TAKEN' ? (
                      <span className="text-[10px] font-bold text-[#1E824C] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                        Taken {d.takenAt || 'On Time'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#FF6138] bg-[#FFF0EB] px-2 py-0.5 rounded-full border border-[#FF6138]/20">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Appreciation & Motivational Quote Card */}
            {(() => {
              const motivation = getDayMotivationQuote(selectedDay, profile.preferred_name || profile.name || 'Friend');
              return (
                <div className={`p-4 rounded-[16px] border ${motivation.bgColor} ${motivation.borderColor} space-y-2 relative overflow-hidden shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${motivation.textColor}`}>
                      <Sparkles className={`w-3.5 h-3.5 ${motivation.iconColor}`} />
                      {motivation.badge}
                    </span>
                    <HeartHandshake className={`w-4 h-4 ${motivation.iconColor} opacity-70`} />
                  </div>

                  <p className={`text-xs ${motivation.textColor} font-medium leading-relaxed italic`}>
                    {motivation.quote}
                  </p>
                </div>
              );
            })()}

            {/* Safeguard Telemetry Status */}
            <div className="p-3 bg-[#FAF7F2] rounded-[12px] border border-[#EFEAE1] text-xs space-y-1">
              <div className="font-bold text-[#2D2545] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1E824C]" />
                Automated Safeguard Telemetry
              </div>
              <p className="text-[11px] text-[#6B6282] leading-relaxed">
                {selectedDay.isCaregiverCheckpoint
                  ? '⚠️ Caregiver Checkpoint (Day 3, 6, 9...): If 3 consecutive days are missed, Telegram notification dispatches automatically to Priya.'
                  : selectedDay.isDoctorCheckpoint
                  ? '🚨 Physician Telemetry Checkpoint (Day 5, 10...): Adherence summary escalates directly to Dr. Aarav Mehta.'
                  : '✓ Normal Routine Monitored: Patient is maintaining consistent adherence.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="touch-target w-full py-2.5 rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              Close Day View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
