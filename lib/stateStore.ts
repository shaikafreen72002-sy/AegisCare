import type { AdherenceState } from './types/adherence';
import type { PatientProfile, NotificationAuditRecord, UrgencyLevel } from './types/escalation';
import type { AuthUser, UserRole } from './types/auth';

export interface StoredUser {
  user_id: string;
  name: string;
  preferred_name: string;
  identifier: string;
  password?: string;
  role: UserRole;
  intake_completed: boolean;
  telegram_chat_id?: string;
}

// ONLY Afreen is pre-configured by default
export const REGISTERED_USERS: StoredUser[] = [
  {
    user_id: 'usr_afreen_01',
    name: 'Afreen',
    preferred_name: 'Afreen',
    identifier: 'afreen@example.com',
    password: 'afreen123',
    role: 'PATIENT',
    intake_completed: true
  }
];

export let CONNECTED_TELEGRAM_CHAT_ID: string | null = null;
export let ACTIVE_USER_ID: string = 'usr_afreen_01';

export function setActiveUserId(userId: string) {
  ACTIVE_USER_ID = userId;
}

export function getActiveUserId(): string {
  return ACTIVE_USER_ID;
}

export function setConnectedTelegramChatId(chatId: string) {
  CONNECTED_TELEGRAM_CHAT_ID = chatId;
}

export function getConnectedTelegramChatId(): string | null {
  return CONNECTED_TELEGRAM_CHAT_ID;
}

export function createFreshProfile(user: { user_id: string; name: string; preferred_name?: string }): PatientProfile {
  const pName = user.preferred_name || user.name;
  return {
    patient_id: user.user_id,
    name: user.name,
    preferred_name: pName,
    age: 0,
    gender: 'Not specified',
    height_cm: 0,
    weight_kg: 0,
    bmi: 0,
    diagnosis_date: 'Pending Intake Assessment',
    condition_severity: 'Under Clinical Assessment',
    condition: 'Assessment Pending',
    primary_medication: {
      name: '',
      brand: '',
      dosage: '',
      schedule_time: '',
      instructions: 'Complete intake assessment to calibrate routine.'
    },
    caregiver: {
      name: '',
      relation: '',
      phone: '',
      email: '',
      preferred_channel: 'TELEGRAM_BOT'
    },
    physician: {
      name: '',
      clinic: '',
      phone: '',
      email: ''
    },
    emergency_protocol: 'Reach out to your caregiver or local medical services if you need immediate assistance.'
  };
}

export function createFreshAdherenceState(user: { name: string; preferred_name?: string }): AdherenceState {
  const pName = user.preferred_name || user.name || 'Patient';
  return {
    today: new Date().toISOString().split('T')[0],
    growth_stage: 1,
    garden_name: `${pName}'s Routine Care`,
    routine_message: `🌱 Welcome ${pName}! Your daily medication routine is active for today.`,
    schedule: [
      {
        id: `dose_evening_${Date.now()}`,
        time_slot: 'Evening Routine (8:00 PM)',
        scheduled_time: '20:00',
        medication_name: 'Donepezil Hydrochloride',
        dosage: '10 mg',
        status: 'DUE',
        taken_at: null,
        instructions: 'Take with dinner or before retiring with water.',
        color: 'emerald'
      }
    ],
    history: [
      {
        date: new Date().toISOString().split('T')[0],
        status: 'IN_PROGRESS',
        doses_taken: 0,
        total_doses: 1
      }
    ]
  };
}

// Afreen's pre-configured initial data
export const AFREEN_PROFILE: PatientProfile = {
  patient_id: 'usr_afreen_01',
  name: 'Afreen',
  preferred_name: 'Afreen',
  age: 68,
  gender: 'Female',
  height_cm: 160,
  weight_kg: 58,
  bmi: 22.7,
  diagnosis_date: 'January 2025 (Managed)',
  condition_severity: 'Mild Cognitive Impairment (Early Stage)',
  condition: "Mild Cognitive Impairment / Early Alzheimer's Support",
  primary_medication: {
    name: 'Donepezil',
    brand: 'Aricept',
    dosage: '10 mg',
    schedule_time: '20:00',
    instructions: 'Take orally once daily at bedtime with a glass of water. Can be taken with or without food.'
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
  emergency_protocol: 'If syncope, sudden pulse drops (<50 bpm), or severe acute confusion occur, sit safely, call emergency dispatch and notify Dr. Mehta.'
};

export const AFREEN_ADHERENCE_STATE: AdherenceState = {
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
};

export const AFREEN_AUDIT_LOGS: NotificationAuditRecord[] = [
  {
    notification_id: 'notif_init_01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    channel: 'TELEGRAM_BOT',
    recipient_name: 'CareBot (@BversityCareBot)',
    recipient_contact: '@BversityCareBot',
    urgency: 'INFO',
    trigger: 'TELEGRAM_MEDICATION_REMINDER',
    message: "🔔 Medication Reminder: Time to take your Donepezil — 10 mg. Buttons: [✅ Taken] [⏰ Snooze 15 min] [❓ Not sure] [❌ Missed]",
    delivery_status: 'SENT',
    receipt_id: 'TG_MSG_887938',
    delivered_at: '08:00 PM'
  }
];

// Per-User Storage Maps
export const USER_PROFILES_MAP: Record<string, PatientProfile> = {
  usr_afreen_01: { ...AFREEN_PROFILE }
};

export const USER_ADHERENCE_MAP: Record<string, AdherenceState> = {
  usr_afreen_01: { ...AFREEN_ADHERENCE_STATE }
};

export const USER_AUDIT_LOGS_MAP: Record<string, NotificationAuditRecord[]> = {
  usr_afreen_01: [ ...AFREEN_AUDIT_LOGS ]
};

export function findOrRegisterUser(identifier: string, name?: string, role: UserRole = 'PATIENT', isRegister: boolean = false): StoredUser {
  const normId = identifier.trim().toLowerCase();
  
  const existing = REGISTERED_USERS.find(
    (u) => u.identifier.toLowerCase() === normId || u.name.toLowerCase() === normId || normId.startsWith(u.name.toLowerCase())
  );

  if (existing && !isRegister) {
    ACTIVE_USER_ID = existing.user_id;
    return existing;
  }

  const rawName = name || (normId.includes('afreen') ? 'Afreen' : normId.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'New Patient');
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).trim();
  const userId = `usr_${Date.now()}`;
  
  const newUser: StoredUser = {
    user_id: userId,
    name: formattedName,
    preferred_name: formattedName,
    identifier: identifier.trim(),
    role,
    intake_completed: false // New users start fresh and need intake
  };

  REGISTERED_USERS.push(newUser);
  ACTIVE_USER_ID = userId;

  // Initialize fresh, blank storage for this new user
  USER_PROFILES_MAP[userId] = createFreshProfile(newUser);
  USER_ADHERENCE_MAP[userId] = createFreshAdherenceState(newUser);
  USER_AUDIT_LOGS_MAP[userId] = [];

  return newUser;
}

export function getUserProfile(userId?: string): PatientProfile {
  const targetId = userId || ACTIVE_USER_ID;
  if (!USER_PROFILES_MAP[targetId]) {
    const user = REGISTERED_USERS.find((u) => u.user_id === targetId) || {
      user_id: targetId,
      name: 'Patient',
      preferred_name: 'Patient'
    };
    USER_PROFILES_MAP[targetId] = createFreshProfile(user);
  }
  return USER_PROFILES_MAP[targetId];
}

export function updateUserProfile(userId: string, updates: Partial<PatientProfile>): PatientProfile {
  const current = getUserProfile(userId);
  USER_PROFILES_MAP[userId] = {
    ...current,
    ...updates,
    caregiver: { ...current.caregiver, ...(updates.caregiver || {}) },
    physician: { ...current.physician, ...(updates.physician || {}) },
    primary_medication: { ...current.primary_medication, ...(updates.primary_medication || {}) }
  };
  return USER_PROFILES_MAP[userId];
}

export function getUserAdherence(userId?: string): AdherenceState {
  const targetId = userId || ACTIVE_USER_ID;
  if (!USER_ADHERENCE_MAP[targetId]) {
    const user = REGISTERED_USERS.find((u) => u.user_id === targetId) || {
      user_id: targetId,
      name: 'Patient',
      preferred_name: 'Patient'
    };
    USER_ADHERENCE_MAP[targetId] = createFreshAdherenceState(user);
  }
  return USER_ADHERENCE_MAP[targetId];
}

export function updateUserAdherence(userId: string, updates: Partial<AdherenceState>): AdherenceState {
  const current = getUserAdherence(userId);
  USER_ADHERENCE_MAP[userId] = { ...current, ...updates };
  return USER_ADHERENCE_MAP[userId];
}

export let COMPLETED_CALENDAR_DAYS: number[] = [];

export function getCompletedCalendarDays(): number[] {
  return COMPLETED_CALENDAR_DAYS;
}

export function setCompletedCalendarDays(days: number[]): void {
  COMPLETED_CALENDAR_DAYS = days;
}

export function toggleCalendarDayInStore(day: number): boolean {
  if (COMPLETED_CALENDAR_DAYS.includes(day)) {
    COMPLETED_CALENDAR_DAYS = COMPLETED_CALENDAR_DAYS.filter((d) => d !== day);
    return false;
  } else {
    COMPLETED_CALENDAR_DAYS = [...COMPLETED_CALENDAR_DAYS, day].sort((a, b) => a - b);
    return true;
  }
}

export function getUserAuditLogs(userId?: string): NotificationAuditRecord[] {
  const targetId = userId || ACTIVE_USER_ID;
  if (!USER_AUDIT_LOGS_MAP[targetId]) {
    USER_AUDIT_LOGS_MAP[targetId] = [];
  }
  return USER_AUDIT_LOGS_MAP[targetId];
}

export function markDoseTakenInStore(doseId: string, notes?: string, userId?: string): boolean {
  const adherence = getUserAdherence(userId);
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let matched = false;

  const targetList = [adherence, GLOBAL_ADHERENCE_STATE];
  Object.values(USER_ADHERENCE_MAP).forEach((userAdh) => {
    if (!targetList.includes(userAdh)) {
      targetList.push(userAdh);
    }
  });

  for (const target of targetList) {
    let localMatched = false;
    for (const item of target.schedule) {
      if (item.id === doseId || doseId.includes(item.id) || item.id.includes(doseId)) {
        item.status = 'TAKEN';
        item.taken_at = now;
        localMatched = true;
        matched = true;
        break;
      }
    }

    if (!localMatched && target.schedule.length > 0) {
      const dueDose = target.schedule.find((d) => d.status === 'DUE');
      if (dueDose) {
        dueDose.status = 'TAKEN';
        dueDose.taken_at = now;
        matched = true;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const takenCount = target.schedule.filter((s) => s.status === 'TAKEN').length;
    const existingToday = target.history.find((h) => h.date === todayStr);

    if (existingToday) {
      existingToday.doses_taken = takenCount;
      existingToday.status = takenCount >= target.schedule.length ? 'COMPLETED' : 'IN_PROGRESS';
    } else if (target.schedule.length > 0) {
      target.history.unshift({
        date: todayStr,
        status: takenCount >= target.schedule.length ? 'COMPLETED' : 'IN_PROGRESS',
        doses_taken: takenCount,
        total_doses: target.schedule.length
      });
    }
  }

  return matched;
}

export function markDoseSnoozedInStore(doseId: string, snoozeMinutes: number = 15, userId?: string): boolean {
  const adherence = getUserAdherence(userId);
  const targetList = [adherence, GLOBAL_ADHERENCE_STATE];
  Object.values(USER_ADHERENCE_MAP).forEach((userAdh) => {
    if (!targetList.includes(userAdh)) targetList.push(userAdh);
  });

  let matched = false;
  for (const target of targetList) {
    for (const item of target.schedule) {
      if (item.id === doseId || doseId.includes(item.id) || item.id.includes(doseId)) {
        item.status = 'SNOOZED';
        item.instructions = `⏰ Snoozed for ${snoozeMinutes} mins. Take with water when ready.`;
        matched = true;
        break;
      }
    }
    if (!matched && target.schedule.length > 0) {
      const dueDose = target.schedule.find((d) => d.status === 'DUE');
      if (dueDose) {
        dueDose.status = 'SNOOZED';
        dueDose.instructions = `⏰ Snoozed for ${snoozeMinutes} mins. Take with water when ready.`;
        matched = true;
      }
    }
  }
  return matched;
}

export function markDoseUnsureInStore(doseId: string, userId?: string): boolean {
  const adherence = getUserAdherence(userId);
  const targetList = [adherence, GLOBAL_ADHERENCE_STATE];
  Object.values(USER_ADHERENCE_MAP).forEach((userAdh) => {
    if (!targetList.includes(userAdh)) targetList.push(userAdh);
  });

  let matched = false;
  for (const target of targetList) {
    for (const item of target.schedule) {
      if (item.id === doseId || doseId.includes(item.id) || item.id.includes(doseId)) {
        item.status = 'UNSURE';
        matched = true;
        break;
      }
    }
    if (!matched && target.schedule.length > 0) {
      const dueDose = target.schedule.find((d) => d.status === 'DUE');
      if (dueDose) {
        dueDose.status = 'UNSURE';
        matched = true;
      }
    }
  }
  return matched;
}

export function markDoseMissedInStore(doseId: string, _reason?: string, userId?: string): boolean {
  const adherence = getUserAdherence(userId);
  const targetList = [adherence, GLOBAL_ADHERENCE_STATE];
  Object.values(USER_ADHERENCE_MAP).forEach((userAdh) => {
    if (!targetList.includes(userAdh)) targetList.push(userAdh);
  });

  let matched = false;
  for (const target of targetList) {
    for (const item of target.schedule) {
      if (item.id === doseId || doseId.includes(item.id) || item.id.includes(doseId)) {
        item.status = 'MISSED';
        matched = true;
        break;
      }
    }
    if (!matched && target.schedule.length > 0) {
      const dueDose = target.schedule.find((d) => d.status === 'DUE');
      if (dueDose) {
        dueDose.status = 'MISSED';
        matched = true;
      }
    }
  }
  return matched;
}

export function sendEscalationAlert(
  patientName: string,
  urgency: UrgencyLevel,
  trigger: string,
  summary: string,
  recipientType: string = 'caregiver',
  recipientContact?: string,
  channel: string = 'TELEGRAM_BOT',
  userId?: string
) {
  const receiptId = `ALERT_TX_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const nowIso = new Date().toISOString();
  const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const contact = recipientContact || (channel === 'TELEGRAM_BOT' ? '@BversityCareBot' : '+1 (555) 234-5678');
  const recipientLabel = recipientType === 'doctor_and_caregiver' || recipientType.toLowerCase().includes('doctor')
    ? 'doctor_and_caregiver'
    : 'CareBot (@BversityCareBot)';

  const messageBody = `🚨 [MEDICATION SAFETY ALERT - ${urgency}]\nPatient: ${patientName}\nTrigger: ${trigger}\nDetails: ${summary}\nTime: ${nowReadable}\nAction: Please contact patient or check in immediately.`;

  const record: NotificationAuditRecord = {
    notification_id: `notif_${Date.now()}`,
    timestamp: nowIso,
    channel: channel as any,
    recipient_name: recipientLabel === 'doctor_and_caregiver' ? 'Dr. Mehta & Caregiver Priya' : recipientLabel,
    recipient_contact: contact,
    urgency,
    trigger,
    message: messageBody,
    delivery_status: 'SENT',
    receipt_id: receiptId,
    delivered_at: nowReadable
  };

  const logs = getUserAuditLogs(userId);
  logs.unshift(record);

  return {
    notification_status: 'SENT',
    receipt_id: receiptId,
    channel,
    delivered_at: nowReadable,
    recipient: recipientLabel,
    trigger,
    summary,
    urgency,
    details: record
  };
}

// Backward compatibility exports
export const GLOBAL_PATIENT_PROFILE = AFREEN_PROFILE;
export const GLOBAL_ADHERENCE_STATE = AFREEN_ADHERENCE_STATE;
export const GLOBAL_AUDIT_LOGS = AFREEN_AUDIT_LOGS;
