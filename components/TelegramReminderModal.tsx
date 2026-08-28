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
  Sparkles,
  ExternalLink,
  RefreshCw,
  X,
  MessageSquare
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

  // Periodic polling for button callbacks when modal is open
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

  const handleSendReminder = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await apiService.sendTelegramReminder({
        medication: profile.primary_medication.name || 'Donepezil',
        dosage: profile.primary_medication.dosage || '10 mg',
        time: profile.primary_medication.schedule_time || '8:00 PM',
        doseId: 'dose_evening_03',
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

  const handleSaveChatId = async () => {
    if (!chatIdInput.trim()) return;
    await apiService.saveTelegramChatId(chatIdInput.trim());
    await fetchStatus();
  };

  const eveningDose = adherence.schedule.find((s) => s.id === 'dose_evening_03') || adherence.schedule[adherence.schedule.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1A2E]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-6 border border-[#EFEAE1] shadow-[0_20px_50px_rgba(45,37,69,0.25)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F4EFE6] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#4E89FF] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
                  Telegram Medication Reminders
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2FF] text-[#1D5BD8] border border-[#4E89FF]/20">
                  @BversityCareBot
                </span>
              </div>
              <p className="text-xs text-[#6B6282] font-medium">
                Live interactive reminders with 4-button adherence response
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

        {/* Telegram Bot Link & Step 1 */}
        <div className="p-4 bg-[#FAF7F2] border border-[#EFEAE1] rounded-[16px] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2D2545] flex items-center gap-1.5 font-['Outfit']">
              <Sparkles className="w-4 h-4 text-[#FF6138]" /> Step 1: Connect to Telegram Bot
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${botStatus.connected_chat_id ? 'bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/25' : 'bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/40'}`}>
              {botStatus.connected_chat_id ? `✓ Connected (ID: ${botStatus.connected_chat_id})` : 'Waiting for /start'}
            </span>
          </div>

          <p className="text-xs text-[#5D5570] leading-relaxed">
            Open the bot in Telegram and tap <strong>Start</strong> (or send <code>/start</code>).
          </p>

          <div className="flex items-center gap-2 pt-1">
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

        {/* Step 2: Custom Chat ID (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="telegram-chat-id-input" className="block text-xs font-bold text-[#40365D]">
            Telegram Chat ID (Auto-detected or enter manually):
          </label>
          <div className="flex items-center gap-2">
            <input
              id="telegram-chat-id-input"
              type="text"
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              placeholder="e.g. 123456789 (Auto-detected upon /start)"
              className="touch-target flex-1 h-[42px] px-4 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-xs text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
            />
            <button
              onClick={handleSaveChatId}
              className="touch-target h-[42px] px-4 bg-white border border-[#EFEAE1] text-xs font-bold rounded-full hover:bg-[#FAF7F2] text-[#40365D] cursor-pointer"
            >
              Save ID
            </button>
          </div>
        </div>

        {/* Interactive Reminder Preview Box (Exact Telegram Output) */}
        <div className="p-4 bg-[#1E1A2E] text-white rounded-[16px] space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#988EA8] border-b border-[#3D355C] pb-2">
            <span>📱 Telegram Message Preview</span>
            <span className="text-[#FFBE53] font-mono">8:00 PM Daily Schedule</span>
          </div>

          <div className="space-y-1 text-sm">
            <p className="font-bold text-base flex items-center gap-1.5 text-[#FFBE53] font-['Outfit']">
              🔔 Medication Reminder
            </p>
            <p className="text-slate-100 text-xs">
              It's time to take your <strong>{profile.primary_medication.name || 'Donepezil'} — {profile.primary_medication.dosage || '10 mg'}</strong>.
            </p>
            <p className="text-[#988EA8] text-xs mt-1">
              Have you taken your medication?
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

        {/* Action Trigger Button */}
        <div className="space-y-2">
          <button
            onClick={handleSendReminder}
            disabled={isSending}
            className="touch-target w-full h-[46px] rounded-full bg-[#1E824C] hover:bg-[#156B3D] text-white font-bold text-sm shadow-[0_4px_14px_rgba(30,130,76,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Dispatching to Telegram...' : 'Send Telegram Reminder Now'}</span>
          </button>

          {sendResult && (
            <div className={`p-3.5 rounded-[14px] text-xs font-medium border ${sendResult.success ? 'bg-[#EAF8F0] text-[#136B3B] border-[#1E824C]/30' : 'bg-[#FFF0F0] text-[#E53E3E] border-[#E53E3E]/30'}`}>
              {sendResult.success ? (
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reminder successfully dispatched via @BversityCareBot!</span>
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

        {/* Live Adherence Status Box */}
        <div className="p-3.5 bg-[#FAF7F2] rounded-[16px] border border-[#EFEAE1] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#6B6282] block font-medium">Current Evening Dose Status:</span>
            <span className="font-bold text-[#2D2545]">
              {profile.primary_medication.name} (10 mg) • {eveningDose?.time_slot || 'Evening 8:00 PM'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full font-bold text-xs ${eveningDose?.status === 'TAKEN' ? 'bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/20' : 'bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/30'}`}>
            {eveningDose?.status === 'TAKEN' ? `✓ TAKEN (${eveningDose.taken_at || '8:00 PM'})` : 'PENDING / DUE'}
          </span>
        </div>
      </div>
    </div>
  );
};
