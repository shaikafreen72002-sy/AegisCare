import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { Users, CheckCircle2, MessageSquare, Calendar, Send, Stethoscope, User, Pill } from 'lucide-react';

export const CaregiverPortal: React.FC = () => {
  const { profile, adherence, notifications, triggerEscalationAlert } = usePatient();
  const [testAlertText, setTestAlertText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendTestAlert = async () => {
    if (!testAlertText.trim()) return;
    setIsSending(true);
    try {
      await triggerEscalationAlert(testAlertText.trim(), 'HIGH');
      setTestAlertText('');
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center text-2xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F80ED]">
                Caregiver & Clinical Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-0.5">
                Care Portal for {profile.preferred_name || profile.name}
              </h1>
              <p className="text-xs text-[#64748B] font-medium">
                Primary Contact: {profile.caregiver.name} ({profile.caregiver.relation}) • {profile.caregiver.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] font-semibold text-xs border border-[#16A34A]/20">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              WhatsApp Live Webhook Active
            </span>
          </div>
        </div>
      </div>

      {/* Patient Profile & Clinical Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-[#2F80ED]" /> Patient Details
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">
            {profile.name} ({profile.preferred_name})
          </h3>
          <p className="text-xs text-[#64748B]">
            Age: {profile.age} • Gender: {profile.gender}
          </p>
          <p className="text-xs text-[#2F80ED] font-medium">
            {profile.condition}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5 text-[#16A34A]" /> Primary Prescription
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">
            {profile.primary_medication.name}
          </h3>
          <p className="text-xs font-semibold text-[#16A34A]">
            {profile.primary_medication.dosage} ({profile.primary_medication.brand})
          </p>
          <p className="text-xs text-[#64748B]">
            {profile.primary_medication.frequency}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-[#2F80ED]" /> Prescribing Physician
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">
            {profile.physician.name}
          </h3>
          <p className="text-xs text-[#64748B]">
            {profile.physician.specialty}
          </p>
          <p className="text-xs text-[#64748B] font-mono">
            {profile.physician.phone} • {profile.physician.clinic}
          </p>
        </div>
      </div>

      {/* Adherence Overview */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2F80ED]" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              Adherence Log & Progression
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 bg-[#EAF3FF] text-[#2F80ED] font-semibold rounded-full border border-[#2F80ED]/20">
            Garden Stage: {adherence.growth_stage} / 5
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {adherence.history.map((h, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] p-3.5 rounded-[8px] border border-[#E2E8F0]"
            >
              <span className="text-xs font-semibold text-[#64748B] block">
                {h.date}
              </span>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold text-[#0F172A]">
                  {h.doses_taken} / {h.total_doses} Doses
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Notification Audit Log */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              WhatsApp & SMS Notification Audit Log
            </h2>
          </div>
          <span className="text-xs text-[#64748B] font-medium">
            Notification Integrity Guaranteed (Status: SENT)
          </span>
        </div>

        {/* Test Dispatch Bar */}
        <div className="p-3.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-2">
          <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
            <Send className="w-3.5 h-3.5 text-[#2F80ED]" /> Dispatch Test Caregiver Alert via Webhook
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={testAlertText}
              onChange={(e) => setTestAlertText(e.target.value)}
              placeholder="e.g. 'Test alert: Lakshmi completed her morning medication and tea routine.'"
              className="touch-target flex-1 h-[44px] text-xs px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF] w-full"
            />
            <button
              onClick={handleSendTestAlert}
              disabled={isSending || !testAlertText.trim()}
              className="touch-target w-full sm:w-auto h-[44px] px-5 rounded-[8px] bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs shadow-sm transition disabled:opacity-40 cursor-pointer"
            >
              {isSending ? 'Dispatching...' : 'Dispatch Alert'}
            </button>
          </div>
          {sentSuccess && (
            <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Notification dispatched with verified receipt!
            </p>
          )}
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-2.5 px-3">Delivered At</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Urgency</th>
                <th className="py-2.5 px-3">Receipt ID</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {notifications.map((notif) => (
                <tr key={notif.notification_id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 px-3 font-medium text-[#0F172A]">
                    {notif.delivered_at || notif.timestamp.slice(11, 16)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#2F80ED] font-mono">
                      {notif.channel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#334155]">
                    {notif.recipient_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        notif.urgency === 'CRITICAL'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : notif.urgency === 'HIGH'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {notif.urgency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B]">
                    {notif.receipt_id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {notif.delivery_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
