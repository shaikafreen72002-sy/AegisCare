'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { ShieldAlert, X, Phone, MessageSquare, CheckCircle2, User, Stethoscope, AlertTriangle, Send } from 'lucide-react';
import type { NotificationAuditRecord } from '@/lib/types/escalation';

export const CareTeamModal: React.FC = () => {
  const {
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    profile,
    triggerEscalationAlert
  } = usePatient();

  const [alertReason, setAlertReason] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'HIGH' | 'CRITICAL'>('HIGH');
  const [isSending, setIsSending] = useState(false);
  const [lastDispatchedReceipt, setLastDispatchedReceipt] = useState<NotificationAuditRecord | null>(null);

  if (!isEmergencyModalOpen) return null;

  const handleSendAlert = async () => {
    setIsSending(true);
    try {
      const summaryText = alertReason.trim() || 'Patient requested immediate check-in from Care Team.';
      const receipt = await triggerEscalationAlert(summaryText, urgencyLevel);
      setLastDispatchedReceipt(receipt);
      setAlertReason('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="careteam-modal-title"
        className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-lg w-full p-5 sm:p-6 shadow-[0_12px_32px_rgba(15,23,42,0.14)] overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                Emergency Care Team
              </span>
              <h2 id="careteam-modal-title" className="text-xl font-bold text-[#0F172A]">
                Contact Caregiver & Doctor
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEmergencyModalOpen(false);
              setLastDispatchedReceipt(null);
            }}
            aria-label="Close care team window"
            className="touch-target p-1.5 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {lastDispatchedReceipt && (
          <div className="my-3.5 p-3.5 rounded-[8px] bg-[#DCFCE7] border border-[#16A34A]/30 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#16A34A]">
                    Alert Sent to {lastDispatchedReceipt.recipient_name}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white text-[#16A34A] rounded-full border border-[#16A34A]/20">
                    {lastDispatchedReceipt.delivery_status}
                  </span>
                </div>
                <p className="text-xs text-[#334155] mt-0.5">
                  Receipt: <code className="font-mono font-bold text-[11px]">{lastDispatchedReceipt.receipt_id}</code> • Delivered at {lastDispatchedReceipt.delivered_at}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="bg-[#F8FAFC] p-3.5 rounded-[8px] border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#2F80ED]" /> Primary Caregiver
            </div>
            <h4 className="text-base font-bold text-[#0F172A] mt-1">
              {profile.caregiver.name}
            </h4>
            <p className="text-xs text-[#64748B]">
              {profile.caregiver.relation}
            </p>
            <p className="text-xs font-semibold text-[#2F80ED] mt-0.5 font-mono">
              {profile.caregiver.phone}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <a
                href={`tel:${profile.caregiver.phone.replace(/[^0-9+]/g, '')}`}
                className="touch-target flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] bg-[#2F80ED] text-white font-semibold text-xs hover:bg-[#2563D9] transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
              <button
                onClick={() => {
                  setAlertReason('Checking in with Priya regarding today\'s medication schedule.');
                  setUrgencyLevel('HIGH');
                }}
                className="touch-target flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] bg-white border border-[#CBD5E1] text-[#334155] font-semibold text-xs hover:bg-[#F1F5F9] transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#2F80ED]" /> Telegram
              </button>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3.5 rounded-[8px] border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-[#16A34A]" /> Physician
            </div>
            <h4 className="text-base font-bold text-[#0F172A] mt-1">
              {profile.physician.name}
            </h4>
            <p className="text-xs text-[#64748B] truncate">
              {profile.physician.clinic}
            </p>
            <p className="text-xs font-semibold text-[#16A34A] mt-0.5 font-mono">
              {profile.physician.phone}
            </p>
            <div className="mt-2.5">
              <a
                href={`tel:${profile.physician.phone.replace(/[^0-9+]/g, '')}`}
                className="touch-target w-full flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] bg-[#16A34A] text-white font-semibold text-xs hover:bg-[#15803D] transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call Clinic
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-3.5">
          <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#2F80ED]" /> Send Instant Verified Alert
          </h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Dispatches an automated Telegram alert to your caregiver (@BversityCareBot).
          </p>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUrgencyLevel('HIGH')}
                className={`touch-target px-2.5 py-1 rounded-[6px] text-xs font-semibold border transition cursor-pointer ${
                  urgencyLevel === 'HIGH'
                    ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                    : 'bg-white text-[#475569] border-[#CBD5E1]'
                }`}
              >
                Standard Check-in
              </button>
              <button
                type="button"
                onClick={() => setUrgencyLevel('CRITICAL')}
                className={`touch-target px-2.5 py-1 rounded-[6px] text-xs font-semibold border transition cursor-pointer ${
                  urgencyLevel === 'CRITICAL'
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-[#475569] border-[#CBD5E1]'
                }`}
              >
                Critical (Severe Symptom / Fall)
              </button>
            </div>

            <textarea
              value={alertReason}
              onChange={(e) => setAlertReason(e.target.value)}
              placeholder="Describe what you need help with (e.g. 'I am feeling dizzy after taking my evening dose')..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-[6px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
            />

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[11px] text-[#64748B]">
                Receipt ID generated on dispatch.
              </span>
              <button
                type="button"
                onClick={handleSendAlert}
                disabled={isSending}
                className="touch-target flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSending ? 'Sending...' : 'Dispatch Alert'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-[6px] text-[11px] text-[#991B1B]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>
            If the patient is unconscious, experiencing acute chest pain, or having severe breathing difficulty, please call local Emergency Services (911) immediately.
          </span>
        </div>
      </div>
    </div>
  );
};
