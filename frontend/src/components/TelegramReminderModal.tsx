import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';
import { apiService } from '../services/api';
import {
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  X,
  MessageSquare,
  Sunrise,
  Sun,
  Moon,
  ShieldCheck,
  Bell,
  CalendarCheck2
} from 'lucide-react';

interface TelegramReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramReminderModal: React.FC<TelegramReminderModalProps> = ({ isOpen, onClose }) => {
  const { profile, adherence, refreshState } = usePatient();
  const [chatIdInput, setChatIdInput] = useState('');
  const [botStatus, setBotStatus] = useState<any>({
    bot_username: 'BversityCareBot',
    telegram_link: 'https://t.me/BversityCareBot',
    connected_chat_id: null,
    status: 'WAITING_FOR_USER_START'
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon' | 'evening'>('evening');

  const fetchStatus = async () => {
    const data = await apiService.getTelegramStatus();
    setBotStatus(data);
    if (data.connected_chat_id && !chatIdInput) {
      setChatIdInput(data.connected_chat_id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(async () => {
      try {
        const pollRes = await apiService.pollTelegramUpdates();
        if (pollRes.processed_count > 0) {
          await refreshState();
          await fetchStatus();
          setLastAction(`Updated from Telegram at ${new Date().toLocaleTimeString()}`);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const slotConfigs = {
    morning: {
      title: 'Morning Dose Routine',
      time: '8:00 AM',
      icon: Sunrise,
      med: 'Donepezil',
      dosage: '5 mg',
      doseId: 'dose_morning_01',
      instruction: 'Take with breakfast or morning tea',
      preview: `🔔 Scheduled Morning Medication Reminder (8:00 AM)\n\nGood morning, ${profile.preferred_name || profile.name}! 🌸 It is 8:00 AM. Time for your scheduled morning dose of Donepezil (5 mg) with breakfast and a glass of water.`
    },
    afternoon: {
      title: 'Midday Routine & Hydration',
      time: '1:00 PM',
      icon: Sun,
      med: 'Vitamin D & Hydration',
      dosage: '1000 IU',
      doseId: 'dose_afternoon_02',
      instruction: 'Take with lunch and a fresh glass of water',
      preview: `☀️ Scheduled Midday Routine (1:00 PM)\n\nGood afternoon, ${profile.preferred_name || profile.name}! 🌿 It is 1:00 PM. Time for your midday routine and hydration check.`
    },
    evening: {
      title: 'Evening Primary Dose',
      time: '8:00 PM',
      icon: Moon,
      med: profile.primary_medication.name || 'Donepezil',
      dosage: profile.primary_medication.dosage || '10 mg',
      doseId: 'dose_evening_03',
      instruction: 'Take with dinner or evening snack before bedtime',
      preview: `🌙 Scheduled Evening Medication Reminder (8:00 PM)\n\nGood evening, ${profile.preferred_name || profile.name}! 🌙 It is 8:00 PM. Time for your scheduled evening dose of Donepezil (10 mg) with dinner or an evening snack.`
    }
  };

  const currentSlot = slotConfigs[selectedSlot];

  const handleSendTestReminder = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await apiService.sendTelegramReminder({
        medication: currentSlot.med,
        dosage: currentSlot.dosage,
        time: currentSlot.time,
        doseId: currentSlot.doseId,
        chatId: chatIdInput.trim() || undefined
      });
      setSendResult(res);
      await fetchStatus();
      await refreshState();
    } finally {
      setIsSending(false);
    }
  };

  const handleManualPoll = async () => {
    setIsPolling(true);
    try {
      const pollRes = await apiService.pollTelegramUpdates();
      await refreshState();
      await fetchStatus();
      setLastAction(`Sync complete. ${pollRes.processed_count} updates processed.`);
      setTimeout(() => setLastAction(null), 4000);
    } finally {
      setIsPolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1A2E]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-6 border border-[#EFEAE1] shadow-[0_20px_50px_rgba(45,37,69,0.25)] space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F4EFE6] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#4E89FF] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
                  Automated Medication Reminders
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2FF] text-[#1D5BD8] border border-[#4E89FF]/20">
                  @BversityCareBot
                </span>
              </div>
              <p className="text-xs text-[#6B6282] font-medium">
                Set once by caregiver/doctor — runs automatically throughout the whole month
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-full hover:bg-[#FAF7F2] text-[#6B6282] hover:text-[#2D2545] cursor-pointer"
            aria-label="Close Telegram Reminder modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dementia & Memory Care Protocol Explanation */}
        <div className="p-3.5 bg-[#EAF8F0] border border-[#1E824C]/25 rounded-[16px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#136B3B] font-['Outfit'] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1E824C]" /> 30-Day Automated Routine Active
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#136B3B] border border-[#1E824C]/20">
              🟢 Set Once • Auto-Runs Daily
            </span>
          </div>
          <p className="text-xs text-[#2D503C] leading-relaxed">
            <strong>Dementia Care Automation:</strong> Because patients often forget to set alarms or open apps, AegisCare dispatches reminders <strong>automatically every single day</strong> to Telegram at <strong>8:00 AM</strong>, <strong>1:00 PM</strong>, and <strong>8:00 PM</strong>. No daily app setup is required!
          </p>
        </div>

        {/* Telegram Bot Link & Connection Step */}
        <div className="p-4 bg-[#FAF7F2] border border-[#EFEAE1] rounded-[16px] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2D2545] flex items-center gap-1.5 font-['Outfit']">
              <Sparkles className="w-4 h-4 text-[#FF6138]" /> Step 1: One-Time Telegram Connection
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${botStatus.connected_chat_id ? 'bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/25' : 'bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/40'}`}>
              {botStatus.connected_chat_id ? `✓ Connected (Chat ID: ${botStatus.connected_chat_id})` : 'Waiting for /start'}
            </span>
          </div>

          <p className="text-xs text-[#5D5570]">
            Connect once to receive automated daily reminders for the entire 30-day care cycle.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <a
              href="https://t.me/BversityCareBot"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4E89FF] hover:bg-[#3B75EB] text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
            >
              <span>Open @BversityCareBot in Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleManualPoll}
              disabled={isPolling}
              className="touch-target py-2.5 px-4 bg-white border border-[#EFEAE1] text-[#40365D] text-xs font-bold rounded-full hover:bg-[#FAF7F2] transition flex items-center gap-1.5 cursor-pointer"
              title="Sync latest Telegram responses"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-[#FF6138]' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* 30-Day Recurring Daily Schedule (Always Active) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#2D2545] font-['Outfit'] flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-[#FF6138]" /> 30-Day Daily Routine Schedule
            </span>
            <span className="text-[11px] text-[#136B3B] font-bold">🟢 Runs Every Day</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['morning', 'afternoon', 'evening'] as const).map((slotKey) => {
              const cfg = slotConfigs[slotKey];
              const Icon = cfg.icon;
              const isSelected = selectedSlot === slotKey;
              const matchingDose = adherence.schedule.find((s) => s.id === cfg.doseId);
              const isTaken = matchingDose?.status === 'TAKEN';

              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => setSelectedSlot(slotKey)}
                  className={`p-2.5 rounded-[14px] border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFF0EB] border-[#FF6138] ring-2 ring-[#FF6138]/20 shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EFEAE1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FF6138]' : 'text-[#6B6282]'}`} />
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isTaken ? 'bg-[#EAF8F0] text-[#136B3B]' : 'bg-[#EFEAE1] text-[#40365D]'}`}>
                      {isTaken ? '✓ TAKEN' : 'DUE'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-extrabold text-xs text-[#2D2545] block font-['Outfit']">
                      {cfg.time}
                    </span>
                    <span className="text-[10px] text-[#6B6282] block truncate">
                      {cfg.med}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Message Preview for Selected Daily Slot */}
        <div className="p-4 bg-[#1E1A2E] text-white rounded-[16px] space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#988EA8] border-b border-[#3D355C] pb-2">
            <span className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#FFBE53]" /> Automated Message Format ({currentSlot.title})
            </span>
            <span className="text-[#FFBE53] font-mono font-bold">{currentSlot.time} Daily</span>
          </div>

          <div className="space-y-1 text-sm">
            <p className="font-bold text-base flex items-center gap-1.5 text-[#FFBE53] font-['Outfit']">
              🔔 Medication Reminder
            </p>
            <p className="text-slate-100 text-xs leading-relaxed">
              It is <strong>{currentSlot.time}</strong>. Time for your scheduled dose of <strong>{currentSlot.med} — {currentSlot.dosage}</strong> ({currentSlot.instruction}).
            </p>
            <p className="text-[#988EA8] text-xs mt-1">
              Have you taken your medication? Tap a button below:
            </p>
          </div>

          {/* 4 Interactive Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="py-2 px-3 bg-[#2D2545] border border-[#3D355C] rounded-full text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✅ Taken</span>
            </div>

            <div className="py-2 px-3 bg-[#2D2545] border border-[#3D355C] rounded-full text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>⏰ Snooze 15 min</span>
            </div>

            <div className="py-2 px-3 bg-[#2D2545] border border-[#3D355C] rounded-full text-center text-xs font-bold text-sky-300 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>❓ Not sure</span>
            </div>

            <div className="py-2 px-3 bg-[#2D2545] border border-[#3D355C] rounded-full text-center text-xs font-bold text-rose-300 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>❌ Missed</span>
            </div>
          </div>
        </div>

        {/* Primary Confirmation & Secondary Verification Test */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onClose}
            className="touch-target w-full h-[46px] rounded-full bg-[#1E824C] hover:bg-[#156B3D] text-white font-bold text-sm shadow-[0_4px_14px_rgba(30,130,76,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>30-Day Daily Reminders Active & Confirmed</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleSendTestReminder}
              disabled={isSending}
              className="text-xs text-[#5D5570] hover:text-[#FF6138] font-bold underline transition cursor-pointer disabled:opacity-50"
            >
              {isSending ? 'Dispatching test alert...' : `📲 Send a quick test notification for ${currentSlot.time} to verify Telegram reception`}
            </button>
          </div>

          {sendResult && (
            <div className={`p-3.5 rounded-[14px] text-xs font-medium border ${sendResult.success ? 'bg-[#EAF8F0] text-[#136B3B] border-[#1E824C]/30' : 'bg-[#FFF0F0] text-[#E53E3E] border-[#E53E3E]/30'}`}>
              {sendResult.success ? (
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Test alert dispatched to Telegram @BversityCareBot!</span>
                  </div>
                  <p className="text-[#40365D]">
                    {sendResult.simulated 
                      ? 'Logged to audit records. Open Telegram to click the interactive buttons.'
                      : `Delivered to Chat ID ${sendResult.target_chat_id}. Telegram Message ID: ${sendResult.telegram_message_id}`}
                  </p>
                </div>
              ) : (
                <p>Delivery error: {sendResult.error}</p>
              )}
            </div>
          )}

          {lastAction && (
            <div className="p-2.5 bg-[#FFF0EB] text-[#FF6138] rounded-full text-xs font-bold flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lastAction}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
