'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdherenceState } from '../types/adherence';
import type { PatientProfile, NotificationAuditRecord, UrgencyLevel } from '../types/escalation';
import type { AuthUser } from '../types/auth';
import { apiService } from '../apiClient';

export type ActiveTab = 'dashboard' | 'chat' | 'onboarding' | 'caregiver' | 'monographs';

interface PatientContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => Promise<AuthUser>;
  register: (name: string, identifier: string, password?: string) => Promise<AuthUser>;
  logout: () => void;
  calibrateIntakeWithAI: (intakeData: any) => Promise<any>;
  profile: PatientProfile;
  adherence: AdherenceState;
  notifications: NotificationAuditRecord[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  toggleLargeText: () => void;
  audioAutoSpeak: boolean;
  setAudioAutoSpeak: (val: boolean) => void;
  markDoseAsTaken: (doseId: string, notes?: string) => Promise<void>;
  updateProfileData: (updates: Partial<PatientProfile>) => Promise<void>;
  triggerEscalationAlert: (summary: string, urgency?: UrgencyLevel) => Promise<NotificationAuditRecord>;
  refreshState: () => Promise<void>;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  isTelegramModalOpen: boolean;
  setIsTelegramModalOpen: (open: boolean) => void;
  selectedCitation: any | null;
  setSelectedCitation: (citation: any | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => apiService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!apiService.getCurrentUser());

  const [profile, setProfile] = useState<PatientProfile>(() => ({
    patient_id: 'pt_lakshmi_102',
    name: 'Lakshmi Devi',
    preferred_name: 'Lakshmi Amma',
    age: 74,
    gender: 'Female',
    height_cm: 158,
    weight_kg: 56,
    bmi: 22.4,
    condition: "Mild Cognitive Impairment / Early Alzheimer's Disease",
    condition_severity: 'Mild Cognitive Impairment (Early Stage)',
    diagnosis_date: 'March 2024 (1.5 Years Managed)',
    primary_medication: {
      name: 'Donepezil',
      brand: 'Aricept',
      dosage: '5 mg',
      schedule_time: '20:00',
      instructions: 'Take orally once daily at bedtime with water.'
    },
    caregiver: {
      name: 'Priya',
      relation: 'Daughter & Primary Caregiver',
      phone: '+1 (555) 234-5678',
      email: 'priya.care@example.com',
      preferred_channel: 'TELEGRAM_BOT'
    },
    physician: {
      name: 'Dr. Aarav Mehta, MD',
      clinic: 'Apollo Geriatric Neurology Clinic',
      phone: '+1 (555) 890-1234',
      email: 'dr.mehta@apollogeriatrics.org'
    },
    emergency_protocol: 'If syncope or severe slow pulse occurs, sit safely and call emergency dispatch.'
  }));

  const [adherence, setAdherence] = useState<AdherenceState>(() => ({
    today: new Date().toISOString().split('T')[0],
    growth_stage: 4,
    garden_name: "Lakshmi's Routine Care",
    routine_message: '🌱 Your medication routine is progressing consistently.',
    schedule: [
      {
        id: 'dose_morning_01',
        time_slot: 'Morning (8:00 AM)',
        scheduled_time: '08:00',
        medication_name: 'Donepezil',
        dosage: '5 mg',
        status: 'TAKEN',
        taken_at: '08:15 AM',
        instructions: 'Take with a glass of water. Can be taken with breakfast or tea.',
        color: 'emerald'
      },
      {
        id: 'dose_afternoon_02',
        time_slot: 'Afternoon (1:00 PM)',
        scheduled_time: '13:00',
        medication_name: 'Vitamin D & Hydration',
        dosage: '1000 IU',
        status: 'TAKEN',
        taken_at: '01:10 PM',
        instructions: 'Gentle midday routine with lunch.',
        color: 'sky'
      },
      {
        id: 'dose_evening_03',
        time_slot: 'Evening (8:00 PM)',
        scheduled_time: '20:00',
        medication_name: 'Donepezil (Evening Maintenance)',
        dosage: '5 mg',
        status: 'DUE',
        taken_at: null,
        instructions: 'Take just prior to retiring with water or an evening snack.',
        color: 'indigo'
      }
    ],
    history: [
      { date: '2026-08-27', status: 'COMPLETED', doses_taken: 3, total_doses: 3 },
      { date: '2026-08-26', status: 'COMPLETED', doses_taken: 3, total_doses: 3 },
      { date: '2026-08-25', status: 'COMPLETED', doses_taken: 3, total_doses: 3 }
    ]
  }));

  const [notifications, setNotifications] = useState<NotificationAuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [audioAutoSpeak, setAudioAutoSpeak] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      const p = await apiService.getProfile();
      setProfile(p);
      const a = await apiService.getAdherence();
      setAdherence(a);
      const n = await apiService.getNotificationHistory();
      setNotifications(n);
    };
    init();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }
  }, [highContrast]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (largeText) {
        document.body.classList.add('extra-large-text');
      } else {
        document.body.classList.remove('extra-large-text');
      }
    }
  }, [largeText]);

  const login = async (identifier: string, password?: string): Promise<AuthUser> => {
    const user = await apiService.login(identifier, password);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Load this user's specific profile, adherence, and notifications
    const p = await apiService.getProfile();
    setProfile(p);
    const a = await apiService.getAdherence();
    setAdherence(a);
    const n = await apiService.getNotificationHistory();
    setNotifications(n);

    if (!user.intake_completed) {
      setActiveTab('onboarding');
    } else {
      setActiveTab('dashboard');
    }
    return user;
  };

  const register = async (name: string, identifier: string, password: string = 'demo123'): Promise<AuthUser> => {
    const user = await apiService.register(name, identifier, password);
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Fetch fresh user profile and empty adherence
    const p = await apiService.getProfile();
    setProfile(p);
    const a = await apiService.getAdherence();
    setAdherence(a);
    setNotifications([]);

    setActiveTab('onboarding');
    return user;
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const calibrateIntakeWithAI = async (intakeData: any) => {
    const res = await apiService.calibrateIntake(intakeData);
    if (res.profile) setProfile(res.profile);
    const p = await apiService.getProfile();
    setProfile(p);
    const a = await apiService.getAdherence();
    setAdherence(a);
    const n = await apiService.getNotificationHistory();
    setNotifications(n);

    if (currentUser) {
      setCurrentUser({ ...currentUser, intake_completed: true });
    }
    setActiveTab('dashboard');
    return res;
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleLargeText = () => setLargeText((prev) => !prev);

  const markDoseAsTaken = async (doseId: string, notes?: string) => {
    const res = await apiService.markDoseTaken(doseId, notes);
    if (res.success) {
      setAdherence({ ...res.adherence });
    }
  };

  const updateProfileData = async (updates: Partial<PatientProfile>) => {
    const updated = await apiService.updateProfile(updates);
    setProfile(updated);
  };

  const triggerEscalationAlert = async (summary: string, urgency: UrgencyLevel = 'HIGH') => {
    const record = await apiService.triggerEscalation(summary, urgency);
    setNotifications((prev) => [record, ...prev]);
    return record;
  };

  const refreshState = async () => {
    const a = await apiService.getAdherence();
    setAdherence(a);
    const n = await apiService.getNotificationHistory();
    setNotifications(n);
  };

  return (
    <PatientContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        calibrateIntakeWithAI,
        profile,
        adherence,
        notifications,
        activeTab,
        setActiveTab,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        largeText,
        setLargeText,
        toggleLargeText,
        audioAutoSpeak,
        setAudioAutoSpeak,
        markDoseAsTaken,
        updateProfileData,
        triggerEscalationAlert,
        refreshState,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isTelegramModalOpen,
        setIsTelegramModalOpen,
        selectedCitation,
        setSelectedCitation
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
