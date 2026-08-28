'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { Navbar } from '@/components/Navbar';
import { CareTeamModal } from '@/components/CareTeamModal';
import { SourceCitationModal } from '@/components/SourceCitationModal';
import { TelegramReminderModal } from '@/components/TelegramReminderModal';
import { PatientBottomProfile } from '@/components/PatientBottomProfile';
import { Dashboard } from '@/pages_components/Dashboard';
import { ChatAssistantPage } from '@/pages_components/ChatAssistantPage';
import { CaregiverPortal } from '@/pages_components/CaregiverPortal';
import { MonographReference } from '@/pages_components/MonographReference';
import { OnboardingWizard } from '@/pages_components/OnboardingWizard';
import { LoginPage } from '@/pages_components/LoginPage';

export default function HomePage() {
  const { isAuthenticated, activeTab, setActiveTab, isTelegramModalOpen, setIsTelegramModalOpen } = usePatient();
  const [chatInitialTopic, setChatInitialTopic] = useState<string | undefined>(undefined);

  const handleOpenChatWithTopic = (topic: string) => {
    setChatInitialTopic(topic);
    setActiveTab('chat');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F7F9FC]">
        <LoginPage />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#0F172A] relative">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard onOpenChatWithTopic={handleOpenChatWithTopic} />
        )}
        {activeTab === 'chat' && (
          <ChatAssistantPage initialTopic={chatInitialTopic} />
        )}
        {activeTab === 'caregiver' && <CaregiverPortal />}
        {activeTab === 'monographs' && <MonographReference />}
        {activeTab === 'onboarding' && <OnboardingWizard />}
      </main>

      {/* Floating Bottom-Right Patient Clinical Profile Drawer */}
      <PatientBottomProfile />

      {/* Global Modals */}
      <CareTeamModal />
      <SourceCitationModal />
      <TelegramReminderModal isOpen={isTelegramModalOpen} onClose={() => setIsTelegramModalOpen(false)} />
    </div>
  );
}
