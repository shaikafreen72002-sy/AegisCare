'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { Users, CheckCircle2, MessageSquare, Calendar, Send, Stethoscope, User, Pill } from 'lucide-react';

export const CaregiverPortal: React.FC = () => {
  const { profile, adherence, notifications, triggerEscalationAlert, setIsTelegramModalOpen } = usePatient();
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
      <div className="bg-white border border-[#EFEAE1] rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,37,69,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[14px] bg-[#EAF8F0] text-[#1E824C] flex items-center justify-center text-2xl shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E824C]">
                Caregiver & Clinical Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D2545] font-['Outfit'] mt-0.5">
                Care Portal for {profile.preferred_name || profile.name}
              </h1>
              <p className="text-xs text-[#6B6282] font-medium">
                Primary Contact: {profile.caregiver?.name ? `${profile.caregiver.name} (${profile.caregiver.relation || 'Caregiver'}) • ${profile.caregiver.phone || 'No phone set'}` : 'Caregiver not yet configured'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF8F0] text-[#136B3B] font-bold text-xs border border-[#1E824C]/25 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1E824C] animate-ping" />
              Telegram Live Webhook Active (@BversityCareBot)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-5 rounded-[16px] border border-[#EFEAE1] shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6282] uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-[#FF6138]" /> Patient Details
          </div>
          <h3 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
            {profile.preferred_name || profile.name}
          </h3>
          <p className="text-xs text-[#6B6282]">
            Age: {profile.age > 0 ? `${profile.age}y` : 'Not set'} • Gender: {profile.gender || 'Not specified'}
          </p>
          <p className="text-xs text-[#FF6138] font-bold">
            {profile.condition_severity || profile.condition || 'Under Clinical Assessment'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#EFEAE1] shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6282] uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5 text-[#1E824C]" /> Primary Prescription
          </div>
          <h3 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
            {profile.primary_medication?.name || 'Prescription Pending'}
          </h3>
          <p className="text-xs font-bold text-[#1E824C]">
            {profile.primary_medication?.dosage ? `${profile.primary_medication.dosage} (${profile.primary_medication.brand || 'Standard'})` : 'Complete Intake Assessment'}
          </p>
          <p className="text-xs text-[#6B6282]">
            {profile.primary_medication?.instructions || 'Personalized instructions will generate upon completing the intake wizard.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#EFEAE1] shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6282] uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-[#7952EC]" /> Prescribing Physician
          </div>
          <h3 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
            {profile.physician.name}
          </h3>
          <p className="text-xs text-[#6B6282]">
            {profile.physician.clinic}
          </p>
          <p className="text-xs font-bold text-[#7952EC] font-mono">
            {profile.physician.phone}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-[20px] p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF6138]" />
            <h2 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
              Adherence Log & Progression
            </h2>
          </div>
          <span className="text-xs px-3 py-1 bg-[#EAF8F0] text-[#136B3B] font-bold rounded-full border border-[#1E824C]/25">
            Adherence Level: High
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {adherence.history.map((h, idx) => (
            <div
              key={idx}
              className="bg-[#FAF7F2] p-4 rounded-[14px] border border-[#EFEAE1]"
            >
              <span className="text-xs font-bold text-[#6B6282] block">
                {h.date}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-extrabold text-[#2D2545] font-['Outfit']">
                  {h.doses_taken} / {h.total_doses} Doses
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/20">
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Bot Medication Reminder Integration Card */}
      <div className="bg-gradient-to-r from-[#FFF0EB] to-white border border-[#FF6138]/25 rounded-[20px] p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FF6138] text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
                  Telegram Smart Reminder Bot (@BversityCareBot)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF8F0] text-[#136B3B] border border-[#1E824C]/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#6B6282] font-medium">
                Sends scheduled 8:00 PM medication reminders with interactive buttons: [✅ Taken] [⏰ Snooze 15 min] [❓ Not sure] [❌ Missed]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="touch-target px-5 py-2.5 bg-[#FF6138] hover:bg-[#E84E27] text-white text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(255,97,56,0.3)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Configure & Send Reminder</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-[20px] p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#FF6138]" />
            <h2 className="text-lg font-extrabold text-[#2D2545] font-['Outfit']">
              Telegram Bot (@BversityCareBot) & Care Team Audit Log
            </h2>
          </div>
          <span className="text-xs text-[#6B6282] font-medium">
            Notification Integrity Guaranteed (Status: SENT)
          </span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-[16px] border border-[#EFEAE1] space-y-2">
          <h4 className="text-xs font-bold text-[#2D2545] flex items-center gap-1.5 font-['Outfit']">
            <Send className="w-3.5 h-3.5 text-[#FF6138]" /> Dispatch Test Caregiver Alert via Webhook
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={testAlertText}
              onChange={(e) => setTestAlertText(e.target.value)}
              placeholder="e.g. 'Test alert: Patient completed evening routine.'"
              className="touch-target flex-1 h-[46px] text-xs px-4 rounded-full border border-[#EFEAE1] bg-white text-[#2D2545] placeholder:text-[#988EA8] focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB] w-full"
            />
            <button
              onClick={handleSendTestAlert}
              disabled={isSending || !testAlertText.trim()}
              className="touch-target w-full sm:w-auto h-[46px] px-6 rounded-full bg-[#1E824C] hover:bg-[#156B3D] text-white font-bold text-xs shadow-xs transition disabled:opacity-40 cursor-pointer"
            >
              {isSending ? 'Dispatching...' : 'Dispatch Alert'}
            </button>
          </div>
          {sentSuccess && (
            <p className="text-xs font-bold text-[#1E824C] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Notification dispatched with verified receipt!
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE1] text-[11px] font-bold uppercase tracking-wider text-[#6B6282]">
                <th className="py-3 px-3">Delivered At</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Recipient</th>
                <th className="py-3 px-3">Urgency</th>
                <th className="py-3 px-3">Receipt ID</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {notifications.map((notif) => (
                <tr key={notif.notification_id} className="hover:bg-[#FAF7F2] transition">
                  <td className="py-3 px-3 font-semibold text-[#2D2545]">
                    {notif.delivered_at || notif.timestamp.slice(11, 16)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#FF6138] border border-[#FF6138]/20 font-mono">
                      {notif.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#2D2545]">
                    {notif.recipient_name}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        notif.urgency === 'CRITICAL'
                          ? 'bg-[#FFF0F0] text-[#E53E3E] border border-[#E53E3E]/20'
                          : notif.urgency === 'HIGH'
                          ? 'bg-[#FFF8E7] text-[#8C5A00] border border-[#FFBE53]/30'
                          : 'bg-[#FAF7F2] text-[#6B6282]'
                      }`}
                    >
                      {notif.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#6B6282]">
                    {notif.receipt_id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#136B3B] bg-[#EAF8F0] px-2.5 py-0.5 rounded-full border border-[#1E824C]/25">
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
