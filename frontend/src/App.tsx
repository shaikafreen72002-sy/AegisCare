import React, { useState } from 'react';
import { PatientProvider, usePatient } from './context/PatientContext';
import { Navbar } from './components/Navbar';
import { CareTeamModal } from './components/CareTeamModal';
import { SourceCitationModal } from './components/SourceCitationModal';
import { PatientBottomProfile } from './components/PatientBottomProfile';
import { Dashboard } from './pages/Dashboard';
import { ChatAssistantPage } from './pages/ChatAssistantPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { CaregiverPortal } from './pages/CaregiverPortal';
import { MonographReference } from './pages/MonographReference';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, activeTab, setActiveTab } = usePatient();
  const [chatInitialTopic, setChatInitialTopic] = useState<string | undefined>(undefined);

  const handleOpenChatWithTopic = (topic: string) => {
    setChatInitialTopic(topic);
    setActiveTab('chat');
  };

  // If user is not authenticated, display Apollo-styled Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF3FF] selection:text-[#2F80ED]">
        <LoginPage />
      </div>
    );
  }

  // If user is authenticated but needs clinical intake assessment
  if (currentUser && !currentUser.intake_completed && activeTab !== 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF3FF] selection:text-[#2F80ED]">
        <Navbar />
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <OnboardingWizard />
        </main>
        <CareTeamModal />
        <SourceCitationModal />
        <PatientBottomProfile />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF3FF] selection:text-[#2F80ED]">
      {/* Navigation Header */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard onOpenChatWithTopic={handleOpenChatWithTopic} />
        )}
        {activeTab === 'chat' && (
          <ChatAssistantPage initialTopic={chatInitialTopic} />
        )}
        {activeTab === 'onboarding' && (
          <OnboardingWizard />
        )}
        {activeTab === 'caregiver' && (
          <CaregiverPortal />
        )}
        {activeTab === 'monographs' && (
          <MonographReference />
        )}
      </main>

      {/* Global Modals & Fixed Patient Profile Drawer */}
      <CareTeamModal />
      <SourceCitationModal />
      <PatientBottomProfile />
    </div>
  );
};

export function App() {
  return (
    <PatientProvider>
      <AppContent />
    </PatientProvider>
  );
}

export default App;
