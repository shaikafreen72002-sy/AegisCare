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
  HeartHandshake,
  CalendarCheck2,
  SlidersHorizontal,
  Check,
  AlertCircle
} from 'lucide-react';

interface TelegramReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const format12Hour = (time24: string) => {
  if (!time24) return '8:00 PM';
  const [h, m] = time24.split(':');
  const hourNum = parseInt(h, 10);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${m || '00'} ${period}`;
};

export const TelegramReminderModal: React.FC<TelegramReminderModalProps> = ({ isOpen, onClose }) => {
  const { profile, adherence, refreshState, updateScheduleTimes } = usePatient();
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
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [timingSavedSuccess, setTimingSavedSuccess] = useState(false);
  const [showManualIdInput, setShowManualIdInput] = useState(false);

  // Extract current dose times from schedule
  const morningDose = adherence.schedule.find((s) => s.id.includes('morning') || s.time_slot.toLowerCase().includes('morning'));
  const afternoonDose = adherence.schedule.find((s) => s.id.includes('afternoon') || s.time_slot.toLowerCase().includes('afternoon'));
  const eveningDose = adherence.schedule.find((s) => s.id.includes('evening') || s.time_slot.toLowerCase().includes('evening'));

  const [morningTime, setMorningTime] = useState(morningDose?.scheduled_time || '08:00');
  const [afternoonTime, setAfternoonTime] = useState(afternoonDose?.scheduled_time || '13:00');
  const [eveningTime, setEveningTime] = useState(eveningDose?.scheduled_time || '20:00');

  useEffect(() => {
    if (morningDose?.scheduled_time) setMorningTime(morningDose.scheduled_time);
    if (afternoonDose?.scheduled_time) setAfternoonTime(afternoonDose.scheduled_time);
    if (eveningDose?.scheduled_time) setEveningTime(eveningDose.scheduled_time);
  }, [adherence.schedule]);

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
        if (pollRes.processed_count > 0 || pollRes.connected_chat_id) {
          await refreshState();
          await fetchStatus();
          setLastAction(`Updated from Telegram at ${new Date().toLocaleTimeString()}`);
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCustomTimes = async () => {
    await updateScheduleTimes({
      morning: morningTime,
      afternoon: afternoonTime,
      evening: eveningTime
    });
    setTimingSavedSuccess(true);
    setIsEditingTimes(false);
    setTimeout(() => setTimingSavedSuccess(false), 4000);
  };

  const handleSaveChatId = async () => {
    if (!chatIdInput.trim()) return;
    await apiService.saveTelegramChatId(chatIdInput.trim());
    await fetchStatus();
    setShowManualIdInput(false);
  };

  const slotConfigs = {
    morning: {
      title: 'Morning Dose Routine',
      time: format12Hour(morningTime),
      rawTime: morningTime,
      icon: Sunrise,
      med: morningDose?.medication_name || 'Donepezil',
      dosage: morningDose?.dosage || '5 mg',
      doseId: morningDose?.id || 'dose_morning_01',
      instruction: morningDose?.instructions || 'Take with breakfast or morning tea',
      preview: `🔔 Scheduled Morning Medication Reminder (${format12Hour(morningTime)})\n\nGood morning, ${profile.preferred_name || profile.name}! 🌸 It is ${format12Hour(morningTime)}. Time for your scheduled morning dose of ${morningDose?.medication_name || 'Donepezil'} (${morningDose?.dosage || '5 mg'}) with breakfast and a glass of water.`
    },
    afternoon: {
      title: 'Midday Routine & Hydration',
      time: format12Hour(afternoonTime),
      rawTime: afternoonTime,
      icon: Sun,
      med: afternoonDose?.medication_name || 'Vitamin D & Hydration',
      dosage: afternoonDose?.dosage || '1000 IU',
      doseId: afternoonDose?.id || 'dose_afternoon_02',
      instruction: afternoonDose?.instructions || 'Take with lunch and a fresh glass of water',
      preview: `☀️ Scheduled Midday Routine (${format12Hour(afternoonTime)})\n\nGood afternoon, ${profile.preferred_name || profile.name}! 🌿 It is ${format12Hour(afternoonTime)}. Time for your midday routine and hydration check.`
    },
    evening: {
      title: 'Evening Primary Dose',
      time: format12Hour(eveningTime),
      rawTime: eveningTime,
      icon: Moon,
      med: eveningDose?.medication_name || profile.primary_medication.name || 'Donepezil',
      dosage: eveningDose?.dosage || profile.primary_medication.dosage || '10 mg',
      doseId: eveningDose?.id || 'dose_evening_03',
      instruction: eveningDose?.instructions || 'Take with dinner or evening snack before bedtime',
      preview: `🌙 Scheduled Evening Medication Reminder (${format12Hour(eveningTime)})\n\nGood evening, ${profile.preferred_name || profile.name}! 🌙 It is ${format12Hour(eveningTime)}. Time for your scheduled evening dose of ${profile.primary_medication.name || 'Donepezil'} (${profile.primary_medication.dosage || '10 mg'}) with dinner or an evening snack.`
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
        chatId: chatIdInput.trim() || undefined,
        patientName: profile.preferred_name || profile.name
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

  const isConnected = !!botStatus.connected_chat_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-[0_20px_60px_rgba(45,37,69,0.2)] border border-[#EFEAE1] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-[#4E89FF] text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2545] font-['Outfit']">
                Telegram Automated Medication Reminders
              </h3>
              <p className="text-xs text-[#6B6282]">
                Personalized Timings • Set Once, Auto-Runs Daily for 30 Days
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

        {/* Telegram Bot Connection Status & Activation Guide */}
        <div className={`p-4 border rounded-[16px] space-y-2.5 ${isConnected ? 'bg-[#EAF8F0] border-[#1E824C]/30' : 'bg-[#FFF8E7] border-[#FFBE53]/40'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 font-['Outfit'] ${isConnected ? 'text-[#136B3B]' : 'text-[#8C5A00]'}`}>
              {isConnected ? <CheckCircle2 className="w-4 h-4 text-[#1E824C]" /> : <AlertCircle className="w-4 h-4 text-[#FFBE53]" />}
              {isConnected ? 'Step 1: Telegram Connected & Ready' : 'Step 1: Activate Telegram Notifications'}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isConnected ? 'bg-white text-[#136B3B] border border-[#1E824C]/25' : 'bg-white text-[#8C5A00] border border-[#FFBE53]/50'}`}>
              {isConnected ? `🟢 Connected (Chat ID: ${botStatus.connected_chat_id})` : '🟡 Action Needed: Tap START in Telegram'}
            </span>
          </div>

          {!isConnected ? (
            <div className="space-y-2 text-xs text-[#5D5570]">
              <p className="leading-relaxed">
                👉 <strong>How to activate:</strong> Telegram requires you to start the bot once so it has permission to send reminders to your device. Click the button below, then tap <strong>START</strong> in Telegram.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://t.me/BversityCareBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4E89FF] hover:bg-[#3B75EB] text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  <span>1. Open @BversityCareBot & Tap START</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleManualPoll}
                  disabled={isPolling}
                  className="touch-target py-2.5 px-4 bg-white border border-[#EFEAE1] text-[#40365D] text-xs font-bold rounded-full hover:bg-[#FAF7F2] transition flex items-center gap-1.5 cursor-pointer"
                  title="Check if /start was clicked"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-[#FF6138]' : ''}`} />
                  <span>2. Verify Connection</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualIdInput(!showManualIdInput)}
                  className="text-[11px] text-[#4E89FF] hover:underline font-semibold"
                >
                  {showManualIdInput ? 'Hide manual Chat ID entry' : 'Or enter Telegram Chat ID manually'}
                </button>

                {showManualIdInput && (
                  <div className="flex items-center gap-2 mt-1.5 animate-fade-in">
                    <input
                      type="text"
                      placeholder="e.g. 123456789"
                      value={chatIdInput}
                      onChange={(e) => setChatIdInput(e.target.value)}
                      className="flex-1 h-[36px] px-3 text-xs bg-white border border-[#EFEAE1] rounded-[10px] focus:outline-none focus:border-[#4E89FF]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveChatId}
                      className="h-[36px] px-3 bg-[#4E89FF] hover:bg-[#3B75EB] text-white text-xs font-bold rounded-[10px] cursor-pointer"
                    >
                      Save ID
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#2D503C] leading-relaxed">
              ✓ <strong>Automatic Dispatch Active:</strong> Your Telegram account is successfully connected. Interactive reminders will be delivered straight to your Telegram at your scheduled times ({format12Hour(morningTime)}, {format12Hour(afternoonTime)}, and {format12Hour(eveningTime)}).
            </p>
          )}
        </div>

        {/* 30-Day Recurring Daily Schedule with Custom Timing Editor */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#2D2545] font-['Outfit'] flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-[#FF6138]" /> Your Daily Medication Timings
            </span>
            <button
              type="button"
              onClick={() => setIsEditingTimes(!isEditingTimes)}
              className="text-xs font-bold text-[#FF6138] hover:text-[#E84E27] flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{isEditingTimes ? 'Cancel Edit' : 'Edit Timings'}</span>
            </button>
          </div>

          {/* Interactive Time Editor Drawer */}
          {isEditingTimes && (
            <div className="p-3.5 bg-[#FFF0EB] border border-[#FF6138]/25 rounded-[16px] space-y-3 animate-fade-in">
              <div className="text-xs font-bold text-[#2D2545]">
                Customize Exact Dose Timings (24h/IST):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B6282] mb-1">
                    🌅 Morning
                  </label>
                  <input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-full h-[38px] text-xs font-bold px-2 rounded-[10px] border border-[#EFEAE1] bg-white text-[#2D2545] focus:outline-none focus:border-[#FF6138]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B6282] mb-1">
                    ☀️ Afternoon / Midday
                  </label>
                  <input
                    type="time"
                    value={afternoonTime}
                    onChange={(e) => setAfternoonTime(e.target.value)}
                    className="w-full h-[38px] text-xs font-bold px-2 rounded-[10px] border border-[#EFEAE1] bg-white text-[#2D2545] focus:outline-none focus:border-[#FF6138]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B6282] mb-1">
                    🌙 Evening
                  </label>
                  <input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="w-full h-[38px] text-xs font-bold px-2 rounded-[10px] border border-[#EFEAE1] bg-white text-[#2D2545] focus:outline-none focus:border-[#FF6138]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCustomTimes}
                  className="touch-target py-2 px-4 bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-xs rounded-full shadow-xs transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Sync Timings Everywhere</span>
                </button>
              </div>
            </div>
          )}

          {timingSavedSuccess && (
            <div className="p-2.5 bg-[#EAF8F0] border border-[#1E824C]/30 text-[#136B3B] rounded-[12px] text-xs font-bold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1E824C]" />
              <span>✓ Timings updated and synced across Today's Routine, 30-Day Plan & Telegram scheduler!</span>
            </div>
          )}

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
                      ? 'No active Telegram Chat ID connected yet. Please click "Open @BversityCareBot & Tap START" above so Telegram allows notifications.'
                      : `Delivered directly to Telegram Chat ID ${sendResult.target_chat_id}! Check your Telegram app.`}
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
