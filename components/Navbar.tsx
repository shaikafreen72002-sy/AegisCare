'use client';

import React from 'react';
import { usePatient, ActiveTab } from '@/lib/context/PatientContext';
import { DeMentorLogo } from './DeMentorLogo';
import {
  Home,
  Calendar,
  MessageSquare,
  MessageSquareText,
  ShieldAlert,
  Users,
  BookOpen,
  Sun,
  Moon,
  Type,
  Minus,
  Plus,
  Sparkles,
  Activity,
  LogOut,
  ShieldCheck,
  Send,
  Stethoscope,
  Volume2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    highContrast,
    toggleHighContrast,
    largeText,
    toggleLargeText,
    zoomScale,
    increaseZoom,
    decreaseZoom,
    textSizeLevel,
    increaseTextSize,
    decreaseTextSize,
    setIsEmergencyModalOpen,
    setIsTelegramModalOpen,
    profile
  } = usePatient();

  const playVoiceReminderCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Hello ${profile.preferred_name || profile.name}. This is your DeMentor medication reminder call. It is time to take your ${profile.primary_medication?.name || 'prescribed medication'} ${profile.primary_medication?.dosage || '10 mg'} with a fresh glass of water.`
      );
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    setIsEmergencyModalOpen(true);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; ariaLabel: string }[] = [
    {
      id: 'dashboard',
      label: "Today's Routine",
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: "Go to Today's Medication Routine Dashboard"
    },
    {
      id: 'chat',
      label: 'AI Companion',
      icon: <MessageSquare className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: 'Open AI Clinical Chat Companion'
    },
    {
      id: 'caregiver',
      label: 'Caregiver Portal',
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: 'Go to Caregiver and Clinical Records Portal'
    },
    {
      id: 'monographs',
      label: 'Medication Guides',
      icon: <BookOpen className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: 'View Clinical Product Monographs'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFEAE1] shadow-[0_2px_12px_rgba(45,37,69,0.04)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 border-b border-[#F4EFE6] gap-2">
          {/* Innovative DeMentor Brand Logo */}
          <DeMentorLogo
            size="md"
            subtitle={`Medication Adherence Companion • ${profile.preferred_name || profile.name}`}
          />

          <div className="hidden xl:flex items-center gap-2">
            {/* Caregiver Badge */}
            <div
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EAF8F0] border border-[#1E824C]/25 rounded-full max-w-[180px] cursor-pointer hover:bg-[#D4F4E4] transition"
              title="Click to view Caregiver info & Call"
            >
              <div className="w-5 h-5 rounded-full bg-[#1E824C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#136B3B] block leading-none truncate">
                  Caregiver
                </span>
                <span className="text-xs font-bold text-[#2D2545] block leading-tight truncate">
                  {profile.caregiver?.name ? profile.caregiver.name : 'Setup Pending'}
                </span>
              </div>
            </div>

            {/* Doctor / Physician Badge */}
            <div
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F2EDFF] border border-[#7952EC]/25 rounded-full max-w-[190px] cursor-pointer hover:bg-[#E4D9FF] transition"
              title="Click to view Physician info & Call"
            >
              <div className="w-5 h-5 rounded-full bg-[#7952EC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <Stethoscope className="w-3 h-3" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5B31D8] block leading-none truncate">
                  Doctor
                </span>
                <span className="text-xs font-bold text-[#2D2545] block leading-tight truncate">
                  {profile.physician?.name ? profile.physician.name : 'Dr. Aarav Mehta'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap">
            <button
              onClick={toggleHighContrast}
              aria-label={highContrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Theme'}
              title="Toggle High Contrast Mode"
              className={`h-[38px] flex items-center gap-1.5 px-3 rounded-[10px] text-xs font-bold border transition shadow-xs cursor-pointer ${
                highContrast
                  ? 'bg-[#FFBE53] text-[#2D2545] border-[#FFBE53] font-black'
                  : 'border-[#EFEAE1] bg-white text-[#40365D] hover:bg-[#FAF7F2]'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4 text-[#2D2545]" /> : <Moon className="w-4 h-4 text-[#6B6282]" />}
              <span className="hidden md:inline">{highContrast ? 'Contrast On' : 'Contrast'}</span>
            </button>

            {/* Enlarged Interactive Zoom Stepper (100% -> 105% -> 110%) */}
            <div className="flex items-center h-[38px] rounded-[10px] border border-[#EFEAE1] bg-white shadow-xs overflow-hidden" title="Zoom & Text Size (100% -> 105% -> 110%)">
              <button
                type="button"
                onClick={decreaseZoom}
                disabled={zoomScale === 95}
                aria-label="Decrease Zoom Size"
                title="Decrease Zoom (Min 95%)"
                className="px-2.5 h-full hover:bg-[#FAF7F2] text-[#5D5570] hover:text-[#2D2545] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border-r border-[#EFEAE1] flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleLargeText}
                aria-label={`Current Zoom: ${zoomScale}%. Click to cycle (100% -> 105% -> 110%).`}
                title="Click to cycle zoom level (100% -> 105% -> 110%)"
                className={`px-3 h-full flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                  zoomScale >= 105
                    ? 'bg-[#FFF0EB] text-[#FF6138]'
                    : zoomScale === 95
                    ? 'bg-[#FAF7F2] text-[#6B6282]'
                    : 'bg-white text-[#2D2545] hover:bg-[#FAF7F2]'
                }`}
              >
                <Type className="w-4 h-4 text-[#FF6138]" />
                <span className="text-xs font-bold tracking-tight">
                  {zoomScale}%
                </span>
              </button>

              <button
                type="button"
                onClick={increaseZoom}
                disabled={zoomScale === 110}
                aria-label="Increase Zoom Size"
                title="Increase Zoom (Max 110%)"
                className="px-2.5 h-full hover:bg-[#FAF7F2] text-[#5D5570] hover:text-[#2D2545] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border-l border-[#EFEAE1] flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              aria-label="Open Telegram Medication Reminders"
              title="Configure Telegram @BversityCareBot Reminders"
              className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-[10px] text-xs font-bold bg-[#4E89FF] hover:bg-[#3B75EB] text-white shadow-xs transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram Reminders</span>
            </button>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              aria-label="Open Care Team & Emergency Contact Modal"
              className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-[10px] text-xs sm:text-sm font-bold bg-[#E53E3E] hover:bg-[#C53030] text-white shadow-xs transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Care Team</span>
            </button>

            {currentUser && (
              <button
                onClick={logout}
                aria-label="Sign out of current profile"
                title="Sign Out"
                className="h-[38px] flex items-center gap-1 px-2.5 rounded-[10px] text-xs font-bold text-[#6B6282] hover:text-[#E53E3E] hover:bg-[#FFF0F0] border border-[#EFEAE1] transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        <nav aria-label="Main Application Navigation" className="flex items-center justify-between gap-1 py-1.5 overflow-x-auto">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  className={`touch-target flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF6138] text-white shadow-[0_2px_8px_rgba(255,97,56,0.25)]'
                      : 'text-[#5D5570] hover:text-[#2D2545] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('onboarding')}
            aria-label="Open Setup and Onboarding Wizard"
            className={`touch-target flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#2D2545] text-white shadow-xs'
                : 'text-[#FF6138] bg-[#FFF0EB] hover:bg-[#FFE5DC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Intake Profile</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
