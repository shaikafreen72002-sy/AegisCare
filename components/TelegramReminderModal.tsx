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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[14px] max-w-lg w-full p-6 border border-[#E2E8F0] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#2F80ED] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Telegram Medication Reminders
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED]">
                  @BversityCareBot
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">
                Live interactive reminders with 4-button adherence response
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-1.5 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            aria-label="Close Telegram Reminder modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Bot Link & Step 1 */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2F80ED]" /> Step 1: Connect to Telegram Bot
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${botStatus.connected_chat_id ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
              {botStatus.connected_chat_id ? `✓ Connected (ID: ${botStatus.connected_chat_id})` : 'Waiting for /start'}
            </span>
          </div>

          <p className="text-xs text-[#475569] leading-relaxed">
            Open the bot in Telegram and tap <strong>Start</strong> (or send <code>/start</code>).
          </p>

          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://t.me/BversityCareBot"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#2F80ED] hover:bg-[#2563D9] text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
            >
              <span>Open @BversityCareBot in Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleManualPoll}
              disabled={isPolling}
              className="touch-target py-2 px-3 bg-white border border-[#CBD5E1] text-[#334155] text-xs font-semibold rounded-[8px] hover:bg-[#F8FAFC] transition flex items-center gap-1 cursor-pointer"
              title="Sync latest Telegram responses"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Step 2: Custom Chat ID (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="telegram-chat-id-input" className="block text-xs font-bold text-[#334155]">
            Telegram Chat ID (Auto-detected or enter manually):
          </label>
          <div className="flex items-center gap-2">
            <input
              id="telegram-chat-id-input"
              type="text"
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              placeholder="e.g. 123456789 (Auto-detected upon /start)"
              className="touch-target flex-1 h-[40px] px-3 rounded-[8px] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
            />
            <button
              onClick={handleSaveChatId}
              className="touch-target h-[40px] px-3.5 bg-white border border-[#CBD5E1] text-xs font-semibold rounded-[8px] hover:bg-[#F8FAFC] cursor-pointer"
            >
              Save ID
            </button>
          </div>
        </div>

        {/* Interactive Reminder Preview Box (Exact Telegram Output) */}
        <div className="p-4 bg-[#0F172A] text-white rounded-[10px] space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-700 pb-2">
            <span>📱 Telegram Message Preview</span>
            <span className="text-emerald-400 font-mono">8:00 PM Daily Schedule</span>
          </div>

          <div className="space-y-1 text-sm font-sans">
            <p className="font-bold text-base flex items-center gap-1.5 text-amber-300">
              🔔 Medication Reminder
            </p>
            <p className="text-slate-200">
              It's time to take your <strong>{profile.primary_medication.name || 'Donepezil'} — {profile.primary_medication.dosage || '10 mg'}</strong>.
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Have you taken your medication?
            </p>
          </div>

          {/* 4 Interactive Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-[6px] text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✅ Taken</span>
            </div>

            <div className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-[6px] text-center text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>⏰ Snooze 15 min</span>
            </div>

            <div className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-[6px] text-center text-xs font-bold text-sky-400 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>❓ Not sure</span>
            </div>

            <div className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-[6px] text-center text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
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
            className="touch-target w-full h-[46px] rounded-[8px] bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Dispatching to Telegram...' : 'Send Telegram Reminder Now'}</span>
          </button>

          {sendResult && (
            <div className={`p-3 rounded-[8px] text-xs font-medium border ${sendResult.success ? 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30' : 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30'}`}>
              {sendResult.success ? (
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reminder successfully dispatched via @BversityCareBot!</span>
                  </div>
                  <p className="text-[#334155]">
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
            <div className="p-2 bg-[#EAF3FF] text-[#2F80ED] rounded-[6px] text-xs font-semibold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lastAction}</span>
            </div>
          )}
        </div>

        {/* Live Adherence Status Box */}
        <div className="p-3 bg-[#F1F5F9] rounded-[8px] border border-[#E2E8F0] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#64748B] block font-medium">Current Evening Dose Status:</span>
            <span className="font-bold text-[#0F172A]">
              {profile.primary_medication.name} (10 mg) • {eveningDose?.time_slot || 'Evening 8:00 PM'}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${eveningDose?.status === 'TAKEN' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
            {eveningDose?.status === 'TAKEN' ? `✓ TAKEN (${eveningDose.taken_at || '8:00 PM'})` : 'PENDING / DUE'}
          </span>
        </div>
      </div>
    </div>
  );
};
