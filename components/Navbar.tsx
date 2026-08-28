'use client';

import React from 'react';
import { usePatient, ActiveTab } from '@/lib/context/PatientContext';
import {
  Home,
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
        `Hello ${profile.preferred_name || profile.name}. This is your AegisCare medication reminder call. It is time to take your ${profile.primary_medication?.name || 'prescribed medication'} ${profile.primary_medication?.dosage || '10 mg'} with a fresh glass of water.`
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
      icon: <Home className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: "Go to Today's Routine Dashboard"
    },
    {
      id: 'chat',
      label: 'AI Companion',
      icon: <MessageSquareText className="w-5 h-5" aria-hidden="true" />,
      ariaLabel: 'Go to Conversational Medication Assistant'
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
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#2F80ED] flex items-center justify-center text-white shadow-sm font-bold text-lg shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#0F172A]">
                  AegisCare
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED] font-semibold border border-[#CBD5E1]/40 hidden sm:inline-block">
                  Verified Clinical AI
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">
                Medication Adherence Coach • {profile.preferred_name || profile.name}
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2">
            {/* Caregiver Badge */}
            <div
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF4] border border-[#16A34A]/30 rounded-[8px] max-w-[170px] cursor-pointer hover:bg-[#DCFCE7] transition"
              title="Click to view Caregiver info & Call"
            >
              <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#16A34A] block leading-none truncate">
                  Caregiver
                </span>
                <span className="text-xs font-bold text-[#0F172A] block leading-tight truncate">
                  {profile.caregiver?.name ? profile.caregiver.name : 'Setup Pending'}
                </span>
              </div>
            </div>

            {/* Doctor / Physician Badge */}
            <div
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF3FF] border border-[#2F80ED]/30 rounded-[8px] max-w-[180px] cursor-pointer hover:bg-[#D4E8FF] transition"
              title="Click to view Physician info & Call"
            >
              <div className="w-5 h-5 rounded-full bg-[#2F80ED] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <Stethoscope className="w-3 h-3" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#2F80ED] block leading-none truncate">
                  Doctor
                </span>
                <span className="text-xs font-bold text-[#0F172A] block leading-tight truncate">
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
              className={`h-[38px] flex items-center gap-1.5 px-3 rounded-[8px] text-xs font-semibold border transition shadow-sm cursor-pointer ${
                highContrast
                  ? 'bg-[#F59E0B] text-black border-[#F59E0B] font-bold'
                  : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
              <span className="hidden md:inline">{highContrast ? 'Contrast On' : 'Contrast'}</span>
            </button>

            {/* Enlarged Interactive Zoom Stepper (100% -> 105% -> 110%) */}
            <div className="flex items-center h-[38px] rounded-[8px] border border-[#CBD5E1] bg-white shadow-sm overflow-hidden" title="Zoom & Text Size (100% -> 105% -> 110%)">
              <button
                type="button"
                onClick={decreaseZoom}
                disabled={zoomScale === 95}
                aria-label="Decrease Zoom Size"
                title="Decrease Zoom (Min 95%)"
                className="px-2.5 h-full hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border-r border-[#CBD5E1]/60 flex items-center justify-center"
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
                    ? 'bg-[#EAF3FF] text-[#2F80ED]'
                    : zoomScale === 95
                    ? 'bg-[#F8FAFC] text-[#64748B]'
                    : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <Type className="w-4 h-4 text-[#2F80ED]" />
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
                className="px-2.5 h-full hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border-l border-[#CBD5E1]/60 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              aria-label="Open Telegram Medication Reminders"
              title="Configure Telegram @BversityCareBot Reminders"
              className="h-[38px] flex items-center gap-1.5 px-3 rounded-[8px] text-xs font-semibold bg-[#2F80ED] hover:bg-[#2563D9] text-white shadow-sm transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram Reminders</span>
            </button>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              aria-label="Open Care Team & Emergency Contact Modal"
              className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-[8px] text-xs sm:text-sm font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Care Team</span>
            </button>

            {currentUser && (
              <button
                onClick={logout}
                aria-label="Sign out of current profile"
                title="Sign Out"
                className="h-[38px] flex items-center gap-1 px-2.5 rounded-[8px] text-xs font-semibold text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] border border-[#CBD5E1] transition cursor-pointer"
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
                  className={`touch-target flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-semibold text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF3FF] text-[#2F80ED] font-bold'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
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
            className={`touch-target flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#2F80ED] text-white'
                : 'text-[#2F80ED] hover:bg-[#EAF3FF]'
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
