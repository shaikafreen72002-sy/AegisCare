import React from 'react';
import { usePatient } from '../context/PatientContext';
import type { ActiveTab } from '../context/PatientContext';
import {
  Home,
  MessageSquareText,
  ShieldAlert,
  Users,
  BookOpen,
  Sun,
  Moon,
  Type,
  Sparkles,
  Activity,
  LogOut,
  ShieldCheck
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
    setIsEmergencyModalOpen,
    profile
  } = usePatient();

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
        {/* Top Header Row */}
        <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] gap-2">
          {/* Logo & Brand */}
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

          {/* Top Caregiver Banner Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/30 rounded-[8px]">
            <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] block leading-none">
                Primary Caregiver
              </span>
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                {profile.caregiver.name} ({profile.caregiver.relation}) • <span className="text-[#16A34A] text-[11px] font-semibold">WhatsApp Active</span>
              </span>
            </div>
          </div>

          {/* Accessibility & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleHighContrast}
              aria-label={highContrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Theme'}
              title="Toggle High Contrast Mode"
              className={`touch-target flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition shadow-sm cursor-pointer ${
                highContrast
                  ? 'bg-[#F59E0B] text-black border-[#F59E0B] font-bold'
                  : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
              <span className="hidden md:inline">{highContrast ? 'High Contrast On' : 'Contrast'}</span>
            </button>

            <button
              onClick={toggleLargeText}
              aria-label={largeText ? 'Switch to Standard Font Size' : 'Switch to Extra Large Font Size'}
              title="Toggle Large Text"
              className={`touch-target flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition shadow-sm cursor-pointer ${
                largeText
                  ? 'bg-[#EAF3FF] text-[#2F80ED] border-[#2F80ED]'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              <Type className="w-4 h-4 text-[#2F80ED]" />
              <span className="hidden md:inline">Text Size</span>
            </button>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              aria-label="Open Care Team & Emergency Contact Modal"
              className="touch-target flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs sm:text-sm font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm transition active:scale-[0.98] cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Care Team</span>
            </button>

            {currentUser && (
              <button
                onClick={logout}
                aria-label="Sign out of current profile"
                title="Sign Out"
                className="touch-target flex items-center gap-1 px-2.5 py-2 rounded-[8px] text-xs font-semibold text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] border border-[#CBD5E1] transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
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
