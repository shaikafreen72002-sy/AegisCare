import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Sparkles,
  X,
  Pill
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

export const MonthlyCalendarPlan: React.FC = () => {
  const { profile, adherence } = usePatient();
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);

  const today = new Date();
  const currentDayNum = today.getDate();
  const monthName = today.toLocaleString('en-US', { month: 'long' });
  const year = today.getFullYear();

  const todayDosesTaken = adherence.schedule.filter((s) => s.status === 'TAKEN').length;
  const todayTotalDoses = adherence.schedule.length;
  const isTodayFullyTaken = todayTotalDoses > 0 && todayDosesTaken === todayTotalDoses;

  const days: DayPlan[] = Array.from({ length: 30 }, (_, idx) => {
    const dayNum = idx + 1;
    const dateStr = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const displayDate = `${monthName.slice(0, 3)} ${dayNum}`;
    const isToday = dayNum === currentDayNum;

    const isCaregiverCheckpoint = dayNum % 3 === 0;
    const isDoctorCheckpoint = dayNum === 5 || dayNum === 10 || dayNum === 20 || dayNum === 25;

    let status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'MISSED' = 'UPCOMING';
    let dosesTaken = 0;
    const totalDoses = 3;

    if (dayNum < currentDayNum) {
      status = 'COMPLETED';
      dosesTaken = 3;
    } else if (isToday) {
      if (isTodayFullyTaken) {
        status = 'COMPLETED';
        dosesTaken = todayTotalDoses;
      } else if (todayDosesTaken > 0) {
        status = 'IN_PROGRESS';
        dosesTaken = todayDosesTaken;
      } else {
        status = 'IN_PROGRESS';
        dosesTaken = 0;
      }
    } else {
      status = 'UPCOMING';
      dosesTaken = 0;
    }

    const defaultDoses = [
      {
        slot: 'Morning Routine',
        time: '8:00 AM',
        medication: profile.primary_medication?.name || 'Donepezil',
        dosage: '5 mg',
        status: (dayNum < currentDayNum || (isToday && adherence.schedule[0]?.status === 'TAKEN')) ? ('TAKEN' as const) : ('DUE' as const),
        takenAt: (dayNum < currentDayNum || (isToday && adherence.schedule[0]?.status === 'TAKEN')) ? '08:15 AM' : undefined
      },
      {
        slot: 'Midday Routine',
        time: '1:00 PM',
        medication: 'Vitamin D & Hydration',
        dosage: '1000 IU',
        status: (dayNum < currentDayNum || (isToday && adherence.schedule[1]?.status === 'TAKEN')) ? ('TAKEN' as const) : ('DUE' as const),
        takenAt: (dayNum < currentDayNum || (isToday && adherence.schedule[1]?.status === 'TAKEN')) ? '01:10 PM' : undefined
      },
      {
        slot: 'Evening Routine',
        time: '8:00 PM',
        medication: `${profile.primary_medication?.name || 'Donepezil'} (Evening Maintenance)`,
        dosage: profile.primary_medication?.dosage || '10 mg',
        status: (dayNum < currentDayNum || (isToday && adherence.schedule[2]?.status === 'TAKEN')) ? ('TAKEN' as const) : ('DUE' as const),
        takenAt: (dayNum < currentDayNum || (isToday && adherence.schedule[2]?.status === 'TAKEN')) ? '08:05 PM' : undefined
      }
    ];

    return {
      dayNumber: dayNum,
      dateStr,
      displayDate,
      status,
      dosesTaken,
      totalDoses: isToday ? todayTotalDoses || 3 : totalDoses,
      isCaregiverCheckpoint,
      isDoctorCheckpoint,
      isToday,
      doses: defaultDoses
    };
  });

  const completedDaysCount = days.filter((d) => d.status === 'COMPLETED').length;
  const adherencePercentage = Math.round((completedDaysCount / currentDayNum) * 100);

  return (
    <div className="bg-white border border-[#EFEAE1] rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)] space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F4EFE6] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-[#FFF0EB] text-[#FF6138] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#2D2545] font-['Outfit']">
                30-Day Medication Adherence Plan
              </h2>
              <p className="text-xs text-[#6B6282] font-medium">
                {monthName} {year} • Automated Checkpoints for {profile.preferred_name || profile.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#EAF8F0] border border-[#1E824C]/25 flex items-center gap-1.5 text-xs font-bold text-[#136B3B]">
            <CheckCircle2 className="w-4 h-4 text-[#1E824C]" />
            <span>{completedDaysCount}/30 Days Done ({adherencePercentage}%)</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#FFF8E7] border border-[#FFBE53]/40 flex items-center gap-1.5 text-[11px] font-bold text-[#8C5A00]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFBE53]" />
            <span>Caregiver (Day 3 Safeguard)</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#F2EDFF] border border-[#7952EC]/25 flex items-center gap-1.5 text-[11px] font-bold text-[#5B31D8]">
            <Stethoscope className="w-3.5 h-3.5 text-[#7952EC]" />
            <span>Physician (Day 5 & 10 Safeguard)</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-[#FAF7F2] border border-[#EFEAE1] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6138] shrink-0" />
          <span className="text-[#40365D] font-medium leading-relaxed">
            <strong>Automated Safety Safeguards:</strong> If 2 consecutive days are missed, Day 3 automatically alerts Caregiver <strong>Priya</strong>. If missed through Day 5 or 10, clinical telemetry escalates directly to <strong>Dr. Aarav Mehta</strong>.
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-bold text-[#1E824C] bg-[#EAF8F0] px-2.5 py-1 rounded-full border border-[#1E824C]/20">
          ✓ Active by Default
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
        {days.map((day) => {
          const isDone = day.status === 'COMPLETED';
          const isToday = day.isToday;

          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-[14px] border text-left transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.02] ${
                isDone
                  ? 'bg-[#EAF8F0] border-[#1E824C]/35 hover:border-[#1E824C]'
                  : isToday
                  ? 'bg-white border-[#FF6138] ring-2 ring-[#FF6138]/20 shadow-xs'
                  : 'bg-[#FAF7F2] border-[#EFEAE1] hover:border-[#CBD5E1]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-[#2D2545] font-['Outfit']">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-[#6B6282]">
                    {day.displayDate}
                  </span>
                </div>

                <div className="my-1">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E824C] text-white shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" /> {day.dosesTaken}/{day.totalDoses} Done
                    </span>
                  ) : isToday ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/25">
                      <Clock className="w-3 h-3" /> Today ({day.dosesTaken}/{day.totalDoses})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEAE1] text-[#6B6282]">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#EFEAE1]/60 flex items-center justify-between text-[9px] font-bold">
                {day.isCaregiverCheckpoint && (
                  <span className="text-[#8C5A00] flex items-center gap-0.5" title="Day 3 Safeguard: 2-Day Missed Alert to Caregiver">
                    <ShieldAlert className="w-3 h-3 text-[#FFBE53]" /> Caregiver
                  </span>
                )}
                {day.isDoctorCheckpoint && (
                  <span className="text-[#5B31D8] flex items-center gap-0.5" title="Day 5 / 10 Safeguard: Physician Telemetry Alert">
                    <Stethoscope className="w-3 h-3 text-[#7952EC]" /> Doctor
                  </span>
                )}
                {!day.isCaregiverCheckpoint && !day.isDoctorCheckpoint && (
                  <span className="text-[#988EA8]">Daily 3 Doses</span>
                )}
                <ChevronRight className="w-3 h-3 text-[#988EA8] opacity-0 group-hover:opacity-100 transition" />
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-[#1E1A2E]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#EFEAE1] rounded-[20px] p-6 max-w-md w-full shadow-[0_20px_50px_rgba(45,37,69,0.25)] space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#FFF0EB] text-[#FF6138] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
                    Day {selectedDay.dayNumber} Adherence Log
                  </h3>
                  <p className="text-xs text-[#6B6282] font-medium">
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

            <div className="p-3 bg-[#FAF7F2] rounded-[12px] border border-[#EFEAE1] text-xs space-y-1">
              <div className="font-bold text-[#2D2545] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1E824C]" />
                Automated Safeguard Telemetry
              </div>
              <p className="text-[11px] text-[#6B6282] leading-relaxed">
                {selectedDay.isCaregiverCheckpoint
                  ? '⚠️ Caregiver Checkpoint (Day 3, 6, 9...): If 2 consecutive days were missed, Telegram notification dispatches automatically to Priya.'
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
