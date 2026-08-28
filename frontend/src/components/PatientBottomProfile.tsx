import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import {
  User,
  ChevronUp,
  ChevronDown,
  X,
  Heart,
  Scale,
  Calendar,
  Pill,
  Phone,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const PatientBottomProfile: React.FC = () => {
  const { profile } = usePatient();
  const [isOpen, setIsOpen] = useState(false);

  const bmi = profile.bmi || (profile.weight_kg && profile.height_cm
    ? Number((profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1))
    : 22.4);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Expanded Profile Card Popover */}
      {isOpen && (
        <div className="mb-2 w-80 sm:w-96 bg-white border border-[#CBD5E1] rounded-[12px] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.18)] animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#2F80ED] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {profile.preferred_name ? profile.preferred_name.slice(0, 2).toUpperCase() : 'LA'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {profile.preferred_name || profile.name}
                </h3>
                <span className="text-xs text-[#64748B]">
                  Legal Name: {profile.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-[6px] hover:bg-[#F1F5F9] cursor-pointer"
              aria-label="Close Patient Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clinical & Physical Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#DC2626]" /> Age & Gender
              </span>
              <span className="font-bold text-[#0F172A] block">
                {profile.age} Years • {profile.gender || 'Female'}
              </span>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#2F80ED]" /> Height & Weight
              </span>
              <span className="font-bold text-[#0F172A] block">
                {profile.height_cm} cm • {profile.weight_kg} kg
              </span>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#16A34A]" /> Body Mass Index
              </span>
              <span className="font-bold text-[#16A34A] block">
                {bmi} kg/m² (Normal)
              </span>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8B5CF6]" /> Diagnosed Date
              </span>
              <span className="font-bold text-[#0F172A] block">
                {profile.diagnosis_date || 'March 2024'}
              </span>
            </div>
          </div>

          {/* Condition Severity */}
          <div className="p-2.5 bg-[#EAF3FF] rounded-[8px] border border-[#2F80ED]/30 text-xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#2F80ED] uppercase block">
              Diagnosed Memory Condition & Severity
            </span>
            <span className="font-bold text-[#0F172A] block">
              {profile.condition_severity || profile.condition}
            </span>
          </div>

          {/* Daily Prescriptions */}
          <div className="p-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] text-xs space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
              <Pill className="w-3 h-3 text-[#2F80ED]" /> Everyday Medications
            </span>
            <div className="font-bold text-[#0F172A]">
              {profile.primary_medication.name} ({profile.primary_medication.brand}) — {profile.primary_medication.dosage}
            </div>
            <div className="text-[11px] text-[#64748B]">
              {profile.primary_medication.instructions}
            </div>
          </div>

          {/* Caregiver & Doctor */}
          <div className="pt-2 border-t border-[#E2E8F0] text-xs space-y-1">
            <div className="flex items-center justify-between text-[#475569]">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#16A34A]" /> Caregiver: <strong>{profile.caregiver.name} ({profile.caregiver.relation})</strong>
              </span>
              <span className="text-[11px] text-[#64748B]">{profile.caregiver.phone}</span>
            </div>
            <div className="flex items-center justify-between text-[#475569]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2F80ED]" /> Neurologist: <strong>{profile.physician.name}</strong>
              </span>
              <span className="text-[11px] text-[#64748B]">{profile.physician.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Right Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-2 border-[#2F80ED] shadow-[0_4px_16px_rgba(15,23,42,0.14)] font-bold text-xs transition active:scale-[0.98] cursor-pointer"
        aria-label="Toggle Patient Clinical Profile Drawer"
      >
        <div className="w-6 h-6 rounded-full bg-[#2F80ED] text-white flex items-center justify-center text-[11px]">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <span className="block text-[#0F172A] leading-tight">
            {profile.preferred_name || profile.name}
          </span>
          <span className="text-[10px] text-[#64748B] font-medium block">
            {profile.age}y • BMI {bmi} • Clinical Profile
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#2F80ED]" /> : <ChevronUp className="w-4 h-4 text-[#2F80ED]" />}
      </button>
    </div>
  );
};
