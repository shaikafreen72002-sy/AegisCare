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
  zoomScale: 95 | 100 | 105 | 110;
  setZoomScale: (val: 95 | 100 | 105 | 110) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  textSizeLevel: 'sm' | 'md' | 'lg' | 'xl';
  setTextSizeLevel: (level: 'sm' | 'md' | 'lg' | 'xl') => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  audioAutoSpeak: boolean;
  setAudioAutoSpeak: (val: boolean) => void;
  markDoseAsTaken: (doseId: string, notes?: string) => Promise<void>;
  updateProfileData: (updates: Partial<PatientProfile>) => Promise<void>;
  updateScheduleTimes: (timingUpdates: Record<string, string>) => Promise<void>;
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
    growth_stage: 0,
    garden_name: "Afreen's Routine Care",
    routine_message: '🌱 Welcome! Start logging your daily doses to begin your adherence streak.',
    schedule: [
      {
        id: 'dose_morning_01',
        time_slot: 'Morning (8:00 AM)',
        scheduled_time: '08:00',
        medication_name: 'Donepezil',
        dosage: '5 mg',
        status: 'DUE',
        taken_at: null,
        instructions: 'Take with a glass of water. Can be taken with breakfast or tea.',
        color: 'emerald'
      },
      {
        id: 'dose_afternoon_02',
        time_slot: 'Afternoon (1:00 PM)',
        scheduled_time: '13:00',
        medication_name: 'Vitamin D & Hydration',
        dosage: '1000 IU',
        status: 'DUE',
        taken_at: null,
        instructions: 'Gentle midday routine with lunch.',
        color: 'sky'
      },
      {
        id: 'dose_evening_03',
        time_slot: 'Evening (8:00 PM)',
        scheduled_time: '20:00',
        medication_name: 'Donepezil (Evening Maintenance)',
        dosage: '10 mg',
        status: 'DUE',
        taken_at: null,
        instructions: 'Take just prior to retiring with water or an evening snack.',
        color: 'indigo'
      }
    ],
    history: []
  }));

  const [notifications, setNotifications] = useState<NotificationAuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<95 | 100 | 105 | 110>(100);
  const [textSizeLevel, setTextSizeLevel] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [audioAutoSpeak, setAudioAutoSpeak] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const savedZoom = localStorage.getItem('aegiscare_zoom_scale');
        if (savedZoom && ['95', '100', '105', '110'].includes(savedZoom)) {
          const z = Number(savedZoom) as 95 | 100 | 105 | 110;
          setZoomScale(z);
          setLargeText(z >= 105);
        }
      }
      const p = await apiService.getProfile();
      setProfile(p);
      let a = await apiService.getAdherence();
      if (typeof window !== 'undefined') {
        try {
          const savedCustomSchedule = localStorage.getItem(`dementor_custom_schedule_${p.patient_id || 'afreen'}`);
          if (savedCustomSchedule) {
            const parsedSchedule = JSON.parse(savedCustomSchedule);
            if (Array.isArray(parsedSchedule) && parsedSchedule.length > 0) {
              a = { ...a, schedule: parsedSchedule };
            }
          }
        } catch {}
      }
      setAdherence(a);
      const n = await apiService.getNotificationHistory();
      setNotifications(n);
    };
    init();

    const handleCustomScheduleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setAdherence((prev) => ({ ...prev, schedule: e.detail }));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('dementor_schedule_updated', handleCustomScheduleUpdate);
      return () => window.removeEventListener('dementor_schedule_updated', handleCustomScheduleUpdate);
    }
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
      const root = document.documentElement;
      const body = document.body;

      root.classList.remove('zoom-95', 'zoom-100', 'zoom-105', 'zoom-110', 'text-size-sm', 'text-size-md', 'text-size-lg', 'text-size-xl');
      body.classList.remove('zoom-95', 'zoom-100', 'zoom-105', 'zoom-110', 'text-size-sm', 'text-size-md', 'text-size-lg', 'text-size-xl');

      root.classList.add(`zoom-${zoomScale}`);
      body.classList.add(`zoom-${zoomScale}`);

      const mappedLevel = zoomScale === 95 ? 'sm' : zoomScale === 100 ? 'md' : zoomScale === 105 ? 'lg' : 'xl';
      setTextSizeLevel(mappedLevel);

      if (zoomScale >= 105) {
        body.classList.add('extra-large-text');
        setLargeText(true);
      } else {
        body.classList.remove('extra-large-text');
        setLargeText(false);
      }

      try {
        localStorage.setItem('aegiscare_zoom_scale', String(zoomScale));
      } catch {}
    }
  }, [zoomScale]);

  // 24/7 Automated Daily Telegram Reminder Scheduler (Runs for the whole month)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndDispatchSchedule = async () => {
      try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        const todayDateStr = now.toISOString().split('T')[0];

        const storageKey = 'aegiscare_dispatched_scheduled_slots';
        let dispatchedSlots: Record<string, string[]> = {};
        try {
          dispatchedSlots = JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch {}

        const todayDispatched = dispatchedSlots[todayDateStr] || [];

        // Check each scheduled dose in the patient's routine (8:00 AM, 1:00 PM, 8:00 PM)
        for (const dose of adherence.schedule) {
          const doseTime = dose.scheduled_time; // "08:00", "13:00", "20:00"
          if (doseTime === currentTimeStr && !todayDispatched.includes(dose.id) && dose.status === 'DUE') {
            await apiService.sendTelegramReminder({
              medication: dose.medication_name,
              dosage: dose.dosage,
              time: dose.time_slot,
              doseId: dose.id,
              patientName: profile.preferred_name || profile.name
            });

            dispatchedSlots[todayDateStr] = [...todayDispatched, dose.id];
            localStorage.setItem(storageKey, JSON.stringify(dispatchedSlots));
          }
        }
      } catch (err) {
        console.error('Automated scheduler check error:', err);
      }
    };

    const interval = setInterval(checkAndDispatchSchedule, 30000);
    return () => clearInterval(interval);
  }, [adherence.schedule, profile]);

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

  const increaseZoom = () => {
    setZoomScale((curr) => {
      if (curr === 95) return 100;
      if (curr === 100) return 105;
      if (curr === 105) return 110;
      return 110;
    });
  };

  const decreaseZoom = () => {
    setZoomScale((curr) => {
      if (curr === 110) return 105;
      if (curr === 105) return 100;
      if (curr === 100) return 95;
      return 95;
    });
  };

  const increaseTextSize = increaseZoom;
  const decreaseTextSize = decreaseZoom;

  const toggleLargeText = () => {
    setZoomScale((curr) => {
      if (curr === 100) return 105;
      if (curr === 105) return 110;
      return 100;
    });
  };

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

  const updateScheduleTimes = async (timingUpdates: Record<string, string>) => {
    const formatTimeLabel = (timeStr: string, slotPrefix: string) => {
      if (!timeStr) return slotPrefix;
      const [h, m] = timeStr.split(':');
      const hourNum = parseInt(h, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${slotPrefix} (${displayHour}:${m || '00'} ${period})`;
    };

    const updatedSchedule = adherence.schedule.map((dose) => {
      let newTime = timingUpdates[dose.id];
      if (!newTime) {
        if (dose.id.includes('morning') || dose.time_slot.toLowerCase().includes('morning')) newTime = timingUpdates['morning'];
        else if (dose.id.includes('afternoon') || dose.time_slot.toLowerCase().includes('afternoon')) newTime = timingUpdates['afternoon'];
        else if (dose.id.includes('evening') || dose.time_slot.toLowerCase().includes('evening')) newTime = timingUpdates['evening'];
      }

      if (newTime) {
        const slotPrefix = dose.time_slot.split(' (')[0] || (dose.id.includes('morning') ? 'Morning' : dose.id.includes('afternoon') ? 'Afternoon' : 'Evening');
        return {
          ...dose,
          scheduled_time: newTime,
          time_slot: formatTimeLabel(newTime, slotPrefix)
        };
      }
      return dose;
    });

    setAdherence((prev) => ({
      ...prev,
      schedule: updatedSchedule
    }));

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dementor_custom_schedule_${profile.patient_id || currentUser?.user_id || 'afreen'}`, JSON.stringify(updatedSchedule));
        window.dispatchEvent(new CustomEvent('dementor_schedule_updated', { detail: updatedSchedule }));
      } catch {}
    }

    await apiService.updateSchedule(updatedSchedule);
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
        zoomScale,
        setZoomScale,
        increaseZoom,
        decreaseZoom,
        textSizeLevel,
        setTextSizeLevel,
        increaseTextSize,
        decreaseTextSize,
        audioAutoSpeak,
        setAudioAutoSpeak,
        markDoseAsTaken,
        updateProfileData,
        updateScheduleTimes,
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
