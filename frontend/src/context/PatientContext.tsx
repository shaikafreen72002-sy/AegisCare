import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdherenceState } from '../types/adherence';
import type { PatientProfile, NotificationAuditRecord, UrgencyLevel } from '../types/escalation';
import type { AuthUser } from '../types/auth';
import { apiService } from '../services/api';

export type ActiveTab = 'dashboard' | 'chat' | 'onboarding' | 'caregiver' | 'monographs';

interface PatientContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => Promise<AuthUser>;
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
  updateScheduleTimes: (timingUpdates: Record<string, string>) => Promise<void>;
  triggerEscalationAlert: (summary: string, urgency?: UrgencyLevel) => Promise<NotificationAuditRecord>;
  refreshState: () => Promise<void>;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  selectedCitation: any | null;
  setSelectedCitation: (citation: any | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => apiService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!apiService.getCurrentUser());

  const [profile, setProfile] = useState<PatientProfile>(() => ({
    patient_id: 'pt_lakshmi_102',
    name: 'Lakshmi',
    preferred_name: 'Lakshmi Amma',
    age: 74,
    gender: 'Female',
    height_cm: 158,
    weight_kg: 56,
    bmi: 22.4,
    condition: "Mild Cognitive Impairment / Early Alzheimer's Type",
    condition_severity: "Mild Cognitive Impairment / Early Alzheimer's Type",
    diagnosis_date: '2024-03',
    intake_completed: true,
    primary_medication: {
      name: 'Donepezil Hydrochloride',
      brand: 'Aricept',
      dosage: '5 mg',
      frequency: 'Once daily in the evening',
      instructions: 'Take with water at 8:00 PM before retiring.'
    },
    caregiver: {
      name: 'Priya',
      relation: 'Daughter & Primary Caregiver',
      phone: '+1 (555) 234-5678',
      email: 'priya.care@example.com',
      preferred_channel: 'WHATSAPP',
      alert_on_missed_dose: true,
      alert_on_symptoms: true
    },
    physician: {
      name: 'Dr. Aarav Mehta, MD',
      specialty: 'Geriatric Neurologist',
      clinic: 'Metro Memory & Cognitive Health Center',
      phone: '+1 (555) 987-6543'
    },
    accessibility_settings: {
      high_contrast: false,
      large_text: true,
      voice_auto_speak: false,
      reduced_motion: false
    }
  }));

  const [adherence, setAdherence] = useState<AdherenceState>(() => ({
    today: new Date().toISOString().split('T')[0],
    growth_stage: 4,
    garden_name: "Lakshmi's Jasmine Garden",
    routine_message: "🌱 Your medication routine is growing beautifully. 4 doses completed comfortably this week.",
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
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  // Sync state on load
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

  // Update high-contrast / large text body classes
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.body.classList.add('extra-large-text');
    } else {
      document.body.classList.remove('extra-large-text');
    }
  }, [largeText]);

  // 24/7 Automated Daily Telegram Reminder Scheduler
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

        for (const dose of adherence.schedule) {
          const doseTime = dose.scheduled_time;
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
      } catch {}
    };

    const interval = setInterval(checkAndDispatchSchedule, 5000);
    return () => clearInterval(interval);
  }, [adherence.schedule, profile]);

  // Continuous Global Telegram Callback Poller (Syncs Telegram button clicks like '✅ Taken' directly with UI)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pollTelegramCallbackLoop = async () => {
      try {
        const pollRes = await apiService.pollTelegramUpdates();
        if (pollRes && (pollRes.processed_count > 0 || (pollRes.details && pollRes.details.length > 0))) {
          const freshAdherence = await apiService.getAdherence();
          setAdherence({ ...freshAdherence });

          try {
            localStorage.setItem(`dementor_custom_schedule_${profile.patient_id || 'afreen'}`, JSON.stringify(freshAdherence.schedule));
          } catch {}

          const freshNotifications = await apiService.getNotificationHistory();
          setNotifications(freshNotifications);
        }
      } catch {}
    };

    const interval = setInterval(pollTelegramCallbackLoop, 2000);
    return () => clearInterval(interval);
  }, [profile.patient_id]);

  const login = async (identifier: string, password: string = 'demo123'): Promise<AuthUser> => {
    const user = await apiService.login(identifier, password);
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (!user.intake_completed) {
      setActiveTab('onboarding');
    } else {
      setActiveTab('dashboard');
    }
    return user;
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const calibrateIntakeWithAI = async (intakeData: any) => {
    const res = await apiService.calibrateIntake(intakeData);
    if (res.updated_profile) setProfile(res.updated_profile);
    if (res.updated_adherence) setAdherence(res.updated_adherence);
    if (currentUser) {
      setCurrentUser({ ...currentUser, intake_completed: true });
    }
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
        updateScheduleTimes,
        triggerEscalationAlert,
        refreshState,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
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
