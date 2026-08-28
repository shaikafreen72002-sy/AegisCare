'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
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
      {isOpen && (
        <div className="mb-2 w-80 sm:w-96 bg-white border border-[#EFEAE1] rounded-[20px] p-5 shadow-[0_16px_40px_rgba(45,37,69,0.18)] animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#FF6138] to-[#FF8C6B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {profile.preferred_name ? profile.preferred_name.slice(0, 2).toUpperCase() : 'AF'}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#2D2545] font-['Outfit']">
                  {profile.preferred_name || profile.name}
                </h3>
                <span className="text-xs text-[#6B6282] font-medium">
                  Legal Name: {profile.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#6B6282] hover:text-[#2D2545] rounded-full hover:bg-[#FAF7F2] cursor-pointer transition"
              aria-label="Close Patient Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-[14px] border border-[#EFEAE1] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B6282] uppercase flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#E53E3E]" /> Age & Gender
              </span>
              <span className="font-bold text-[#2D2545] block">
                {(profile.age || 0) > 0 ? `${profile.age} Years` : 'Not set'} • {profile.gender || 'Female'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-[14px] border border-[#EFEAE1] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B6282] uppercase flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#4E89FF]" /> Height & Weight
              </span>
              <span className="font-bold text-[#2D2545] block">
                {(profile.height_cm || 0) > 0 ? `${profile.height_cm} cm` : '—'} • {(profile.weight_kg || 0) > 0 ? `${profile.weight_kg} kg` : '—'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-[14px] border border-[#EFEAE1] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B6282] uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#1E824C]" /> Body Mass Index
              </span>
              <span className="font-bold text-[#1E824C] block">
                {(profile.bmi || 0) > 0 ? `${profile.bmi} kg/m²` : 'Intake pending'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-[14px] border border-[#EFEAE1] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B6282] uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#7952EC]" /> Diagnosed Date
              </span>
              <span className="font-bold text-[#2D2545] block">
                {profile.diagnosis_date || 'August 2026'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#FFF0EB] rounded-[14px] border border-[#FF6138]/25 text-xs space-y-0.5">
            <span className="text-[10px] font-bold text-[#FF6138] uppercase block">
              Diagnosed Memory Condition & Severity
            </span>
            <span className="font-bold text-[#2D2545] block">
              {profile.condition_severity || profile.condition || 'Under Clinical Assessment'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#FAF7F2] border border-[#EFEAE1]">
              <span className="text-[#6B6282] flex items-center gap-1.5 font-medium">
                <Pill className="w-3.5 h-3.5 text-[#1E824C]" /> Primary Medication:
              </span>
              <span className="font-bold text-[#2D2545]">
                {profile.primary_medication?.name ? `${profile.primary_medication.name} (${profile.primary_medication.dosage})` : 'Not configured'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#FAF7F2] border border-[#EFEAE1]">
              <span className="text-[#6B6282] flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#4E89FF]" /> Caregiver:
              </span>
              <span className="font-bold text-[#2D2545]">
                {profile.caregiver?.name ? `${profile.caregiver.name} (${profile.caregiver.relation})` : 'Not set'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#FAF7F2] border border-[#EFEAE1]">
              <span className="text-[#6B6282] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7952EC]" /> Doctor:
              </span>
              <span className="font-bold text-[#2D2545]">
                {profile.physician?.name || 'Dr. Aarav Mehta'}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF7F2] text-[#2D2545] border-2 border-[#FF6138] shadow-[0_4px_16px_rgba(45,37,69,0.14)] font-bold text-xs transition active:scale-[0.98] cursor-pointer"
        aria-label="Toggle Patient Clinical Profile Drawer"
      >
        <div className="w-7 h-7 rounded-full bg-[#FF6138] text-white flex items-center justify-center text-xs shadow-xs font-black">
          <User className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="block text-[#2D2545] font-extrabold leading-tight font-['Outfit']">
            {profile.preferred_name || profile.name}
          </span>
          <span className="text-[10px] text-[#6B6282] font-medium block">
            {(profile.age || 0) > 0 ? `${profile.age}y` : '68y'} • BMI {bmi} • Clinical Profile
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#FF6138]" /> : <ChevronUp className="w-4 h-4 text-[#FF6138]" />}
      </button>
    </div>
  );
};
