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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1A2E]/60 backdrop-blur-xs animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="careteam-modal-title"
        className="bg-white border border-[#EFEAE1] rounded-[20px] max-w-lg w-full p-5 sm:p-6 shadow-[0_20px_50px_rgba(45,37,69,0.25)] overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#F4EFE6] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FFF0F0] text-[#E53E3E] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E53E3E]">
                Emergency Care Team
              </span>
              <h2 id="careteam-modal-title" className="text-xl font-extrabold text-[#2D2545] font-['Outfit']">
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
            className="touch-target p-2 rounded-full text-[#6B6282] hover:text-[#2D2545] hover:bg-[#FAF7F2] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {lastDispatchedReceipt && (
          <div className="my-3.5 p-3.5 rounded-[14px] bg-[#EAF8F0] border border-[#1E824C]/30 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#1E824C] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#1E824C]">
                    Alert Sent to {lastDispatchedReceipt.recipient_name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.2 bg-white text-[#1E824C] rounded-full border border-[#1E824C]/20">
                    {lastDispatchedReceipt.delivery_status}
                  </span>
                </div>
                <p className="text-xs text-[#40365D] mt-0.5">
                  Receipt: <code className="font-mono font-bold text-[11px]">{lastDispatchedReceipt.receipt_id}</code> • Delivered at {lastDispatchedReceipt.delivered_at}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="bg-[#EAF8F0]/40 p-4 rounded-[16px] border border-[#1E824C]/20">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#136B3B] uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#1E824C]" /> Primary Caregiver
            </div>
            <h4 className="text-base font-extrabold text-[#2D2545] mt-1 font-['Outfit']">
              {profile.caregiver.name}
            </h4>
            <p className="text-xs text-[#6B6282]">
              {profile.caregiver.relation}
            </p>
            <p className="text-xs font-bold text-[#1E824C] mt-0.5 font-mono">
              {profile.caregiver.phone}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={`tel:${profile.caregiver.phone.replace(/[^0-9+]/g, '')}`}
                className="touch-target flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-full bg-[#1E824C] text-white font-bold text-xs hover:bg-[#156B3D] transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
              <button
                onClick={() => {
                  setAlertReason('Checking in with Priya regarding today\'s medication schedule.');
                  setUrgencyLevel('HIGH');
                }}
                className="touch-target flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-full bg-white border border-[#EFEAE1] text-[#40365D] font-bold text-xs hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#4E89FF]" /> Telegram
              </button>
            </div>
          </div>

          <div className="bg-[#F2EDFF]/40 p-4 rounded-[16px] border border-[#7952EC]/20">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B31D8] uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-[#7952EC]" /> Physician
            </div>
            <h4 className="text-base font-extrabold text-[#2D2545] mt-1 font-['Outfit']">
              {profile.physician.name}
            </h4>
            <p className="text-xs text-[#6B6282] truncate">
              {profile.physician.clinic}
            </p>
            <p className="text-xs font-bold text-[#7952EC] mt-0.5 font-mono">
              {profile.physician.phone}
            </p>
            <div className="mt-3">
              <a
                href={`tel:${profile.physician.phone.replace(/[^0-9+]/g, '')}`}
                className="touch-target w-full flex items-center justify-center gap-1 py-2 px-3 rounded-full bg-[#7952EC] text-white font-bold text-xs hover:bg-[#623CD6] transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call Clinic
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#EFEAE1] rounded-[16px] p-4">
          <h4 className="text-xs font-bold text-[#2D2545] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#FF6138]" /> Send Instant Verified Alert
          </h4>
          <p className="text-[11px] text-[#6B6282] mt-0.5">
            Dispatches an automated Telegram alert to your caregiver (@BversityCareBot).
          </p>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUrgencyLevel('HIGH')}
                className={`touch-target px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  urgencyLevel === 'HIGH'
                    ? 'bg-[#FFF8E7] text-[#8C5A00] border-[#FFBE53]'
                    : 'bg-white text-[#6B6282] border-[#EFEAE1]'
                }`}
              >
                High Priority
              </button>
              <button
                type="button"
                onClick={() => setUrgencyLevel('CRITICAL')}
                className={`touch-target px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  urgencyLevel === 'CRITICAL'
                    ? 'bg-[#FFF0F0] text-[#E53E3E] border-[#E53E3E]'
                    : 'bg-white text-[#6B6282] border-[#EFEAE1]'
                }`}
              >
                Critical Emergency
              </button>
            </div>

            <textarea
              value={alertReason}
              onChange={(e) => setAlertReason(e.target.value)}
              placeholder="Describe symptoms or need for immediate support..."
              className="touch-target w-full p-3 rounded-[12px] border border-[#EFEAE1] bg-white text-xs text-[#2D2545] placeholder:text-[#988EA8] focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB] resize-none h-20"
            />
            <button
              type="button"
              onClick={handleSendAlert}
              disabled={isSending}
              className="touch-target w-full py-2.5 rounded-full bg-[#E53E3E] hover:bg-[#C53030] text-white font-bold text-xs shadow-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching Alert...' : 'Dispatch Care Team Alert Now'}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 p-3 bg-[#FFF0F0] border border-[#E53E3E]/20 rounded-[12px] text-[11px] text-[#C53030] font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#E53E3E]" />
          <span>
            If the patient is unconscious, experiencing acute chest pain, or having severe breathing difficulty, please call local Emergency Services immediately.
          </span>
        </div>
      </div>
    </div>
  );
};
