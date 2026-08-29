'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { apiService } from '@/lib/apiClient';
import {
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  X,
  MessageSquare,
  ShieldCheck,
  Bell,
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
  const { profile, adherence, refreshState, setActiveTab } = usePatient();
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

  // Selected dose from user's actual profile schedule
  const activeSchedule = adherence.schedule && adherence.schedule.length > 0
    ? adherence.schedule
    : [
        {
          id: 'dose_default_01',
          time_slot: 'Evening Routine',
          scheduled_time: profile.primary_medication.schedule_time || '20:00',
          medication_name: profile.primary_medication.name || 'Donepezil Hydrochloride',
          dosage: profile.primary_medication.dosage || '10 mg',
          instructions: profile.primary_medication.instructions || 'Take with water before bedtime.',
          status: 'DUE' as const
        }
      ];

  const [selectedDoseId, setSelectedDoseId] = useState<string>(activeSchedule[0]?.id || 'dose_default_01');

  useEffect(() => {
    if (activeSchedule.length > 0 && !activeSchedule.some((s) => s.id === selectedDoseId)) {
      setSelectedDoseId(activeSchedule[0].id);
    }
  }, [activeSchedule, selectedDoseId]);

  const selectedDose = activeSchedule.find((s) => s.id === selectedDoseId) || activeSchedule[0];

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

  // Periodic polling for button callbacks & /start updates when modal is open
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

  const isConnected = !!botStatus.connected_chat_id;
  const formattedTime = format12Hour(selectedDose.scheduled_time);

  const handleSendTestReminder = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await apiService.sendTelegramReminder({
        medication: selectedDose.medication_name,
        dosage: selectedDose.dosage,
        time: formattedTime,
        doseId: selectedDose.id,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-[0_20px_60px_rgba(45,37,69,0.2)] border border-[#EFEAE1] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-[#4E89FF] text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2545] font-['Outfit']">
                Telegram Daily Reminders
              </h3>
              <p className="text-xs text-[#6B6282]">
                Automated 30-day notifications for your prescribed routine
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

        {/* Telegram Connection Status */}
        <div className={`p-3.5 border rounded-[16px] space-y-2 ${isConnected ? 'bg-[#EAF8F0] border-[#1E824C]/30' : 'bg-[#FFF8E7] border-[#FFBE53]/40'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 font-['Outfit'] ${isConnected ? 'text-[#136B3B]' : 'text-[#8C5A00]'}`}>
              {isConnected ? <CheckCircle2 className="w-4 h-4 text-[#1E824C]" /> : <AlertCircle className="w-4 h-4 text-[#FFBE53]" />}
              {isConnected ? 'Telegram Connected' : 'Telegram Connection Needed'}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isConnected ? 'bg-white text-[#136B3B] border border-[#1E824C]/25' : 'bg-white text-[#8C5A00] border border-[#FFBE53]/50'}`}>
              {isConnected ? `🟢 Connected (Chat ID: ${botStatus.connected_chat_id})` : 'Waiting for /start'}
            </span>
          </div>

          {!isConnected ? (
            <div className="space-y-2 text-xs text-[#5D5570]">
              <p className="leading-relaxed">
                Click below to start <strong>@BversityCareBot</strong> in Telegram to receive reminders directly on your phone:
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href="https://t.me/BversityCareBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4E89FF] hover:bg-[#3B75EB] text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  <span>Open @BversityCareBot & Tap START</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleManualPoll}
                  disabled={isPolling}
                  className="touch-target py-2.5 px-4 bg-white border border-[#EFEAE1] text-[#40365D] text-xs font-bold rounded-full hover:bg-[#FAF7F2] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-[#FF6138]' : ''}`} />
                  <span>Verify</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#2D503C] leading-relaxed">
              ✓ Automated reminders will arrive directly in your Telegram at your scheduled times ({activeSchedule.map((s) => format12Hour(s.scheduled_time)).join(', ')}).
            </p>
          )}
        </div>

        {/* User's Actual Prescribed Routine from Profile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#2D2545] font-['Outfit'] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6138]" /> Your Profile Medication Timings
            </span>
            <span className="text-[11px] text-[#6B6282]">
              {activeSchedule.length} {activeSchedule.length === 1 ? 'Dose' : 'Doses'} Scheduled
            </span>
          </div>

          <div className={`grid gap-2 ${activeSchedule.length === 1 ? 'grid-cols-1' : activeSchedule.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {activeSchedule.map((doseItem) => {
              const isSelected = selectedDoseId === doseItem.id;
              const isTaken = doseItem.status === 'TAKEN';
              const doseTime = format12Hour(doseItem.scheduled_time);

              return (
                <button
                  key={doseItem.id}
                  type="button"
                  onClick={() => setSelectedDoseId(doseItem.id)}
                  className={`p-3 rounded-[14px] border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFF0EB] border-[#FF6138] ring-2 ring-[#FF6138]/20 shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EFEAE1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-[#2D2545] font-['Outfit']">
                      {doseTime}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isTaken ? 'bg-[#EAF8F0] text-[#136B3B]' : 'bg-[#FFF0EB] text-[#FF6138]'}`}>
                      {isTaken ? '✓ TAKEN' : 'DUE'}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span className="font-bold text-xs text-[#2D2545] block truncate">
                      {doseItem.medication_name}
                    </span>
                    <span className="text-[10px] text-[#6B6282] block truncate">
                      {doseItem.dosage}
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
              <Bell className="w-3.5 h-3.5 text-[#FFBE53]" /> Automated Telegram Message Format
            </span>
            <span className="text-[#FFBE53] font-mono font-bold">{formattedTime} Daily</span>
          </div>

          <div className="space-y-1 text-sm">
            <p className="font-bold text-base flex items-center gap-1.5 text-[#FFBE53] font-['Outfit']">
              🔔 Medication Reminder
            </p>
            <p className="text-slate-100 text-xs leading-relaxed">
              It is <strong>{formattedTime}</strong>. Time for your scheduled dose of <strong>{selectedDose.medication_name} — {selectedDose.dosage}</strong> ({selectedDose.instructions}).
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

        {/* Start Reminders Action Button */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onClose}
            className="touch-target w-full h-[46px] rounded-full bg-[#1E824C] hover:bg-[#156B3D] text-white font-bold text-sm shadow-[0_4px_14px_rgba(30,130,76,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Start 30-Day Daily Reminders</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleSendTestReminder}
              disabled={isSending}
              className="text-xs text-[#5D5570] hover:text-[#FF6138] font-bold underline transition cursor-pointer disabled:opacity-50"
            >
              {isSending ? 'Dispatching test alert...' : `📲 Send a quick test notification for ${formattedTime} to verify Telegram reception`}
            </button>
          </div>

          {sendResult && (
            <div className={`p-3 rounded-[12px] text-xs font-medium border ${sendResult.success ? 'bg-[#EAF8F0] text-[#136B3B] border-[#1E824C]/30' : 'bg-[#FFF0F0] text-[#E53E3E] border-[#E53E3E]/30'}`}>
              {sendResult.success ? (
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Test alert dispatched to Telegram @BversityCareBot!</span>
                  </div>
                  <p className="text-[#40365D]">
                    {sendResult.simulated 
                      ? 'No active Telegram Chat ID connected yet. Please click "Open @BversityCareBot & Tap START" above.'
                      : `Delivered directly to Telegram Chat ID ${sendResult.target_chat_id}! Check your Telegram app.`}
                  </p>
                </div>
              ) : (
                <p>Delivery error: {sendResult.error}</p>
              )}
            </div>
          )}

          {lastAction && (
            <div className="p-2 bg-[#FFF0EB] text-[#FF6138] rounded-full text-xs font-bold flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lastAction}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
