import type { AdherenceState } from './types/adherence';
import type { PatientProfile, NotificationAuditRecord, UrgencyLevel } from './types/escalation';
import type { ChatApiResponse } from './types/chat';
import type { AuthUser, IntakeSubmission } from './types/auth';

class ApiClient {
  private user: AuthUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aegiscare_user');
      if (saved) {
        try {
          this.user = JSON.parse(saved);
        } catch {
          this.user = null;
        }
      }
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.user;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.user?.user_id) {
      headers['x-user-id'] = this.user.user_id;
    }
    return headers;
  }

  public async login(identifier: string, password: string = 'afreen123'): Promise<AuthUser> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: 'PATIENT', is_register: false })
      });
      if (res.ok) {
        const data = await res.json();
        this.user = data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('aegiscare_user', JSON.stringify(this.user));
        }
        return this.user!;
      }
    } catch {}

    // Fallback for default Afreen
    const isAfreen = identifier.toLowerCase().includes('afreen');
    const name = isAfreen ? 'Afreen' : identifier.split('@')[0] || 'User';
    this.user = {
      user_id: isAfreen ? 'usr_afreen_01' : `usr_${Date.now()}`,
      identifier,
      name,
      preferred_name: name,
      role: 'PATIENT',
      intake_completed: isAfreen,
      token: 'aegis_jwt_token'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegiscare_user', JSON.stringify(this.user));
    }
    return this.user;
  }

  public async register(name: string, identifier: string, password: string = 'password123'): Promise<AuthUser> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, identifier, password, role: 'PATIENT', is_register: true })
      });
      if (res.ok) {
        const data = await res.json();
        this.user = data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('aegiscare_user', JSON.stringify(this.user));
        }
        return this.user!;
      }
    } catch {}

    const formattedName = name.trim() || 'New Patient';
    this.user = {
      user_id: `usr_${Date.now()}`,
      identifier,
      name: formattedName,
      preferred_name: formattedName,
      role: 'PATIENT',
      intake_completed: false, // New registration requires intake
      token: 'aegis_jwt_new'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegiscare_user', JSON.stringify(this.user));
    }
    return this.user;
  }

  public logout() {
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aegiscare_user');
    }
  }

  public async getProfile(): Promise<PatientProfile> {
    const userId = this.user?.user_id;
    try {
      const url = userId ? `/api/profile?user_id=${encodeURIComponent(userId)}` : '/api/profile';
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch {}

    const name = this.user?.preferred_name || this.user?.name || 'Afreen';
    const isAfreen = name.toLowerCase().includes('afreen');

    if (isAfreen) {
      return {
        patient_id: 'usr_afreen_01',
        name: 'Afreen',
        preferred_name: 'Afreen',
        age: 68,
        gender: 'Female',
        height_cm: 160,
        weight_kg: 58,
        bmi: 22.7,
        condition: "Mild Cognitive Impairment / Early Memory Care",
        condition_severity: 'Mild Cognitive Impairment (Early Stage)',
        diagnosis_date: 'January 2025 (Managed)',
        primary_medication: {
          name: 'Donepezil',
          brand: 'Aricept',
          dosage: '10 mg',
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
      };
    }

    // Clean blank profile for new users
    return {
      patient_id: userId || `usr_${Date.now()}`,
      name: name,
      preferred_name: name,
      age: 0,
      gender: 'Not specified',
      height_cm: 0,
      weight_kg: 0,
      bmi: 0,
      condition: 'Assessment Pending',
      condition_severity: 'Under Clinical Assessment',
      diagnosis_date: 'Pending Intake Assessment',
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
      emergency_protocol: 'Reach out to your caregiver or local emergency services if you need assistance.'
    };
  }

  public async updateProfile(updates: Partial<PatientProfile>): Promise<PatientProfile> {
    const userId = this.user?.user_id;
    try {
      const url = userId ? `/api/profile?user_id=${encodeURIComponent(userId)}` : '/api/profile';
      const res = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    return this.getProfile();
  }

  public async getAdherence(): Promise<AdherenceState> {
    const userId = this.user?.user_id;
    try {
      const url = userId ? `/api/adherence?user_id=${encodeURIComponent(userId)}` : '/api/adherence';
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch {}

    const name = this.user?.preferred_name || this.user?.name || 'Patient';
    const isAfreen = name.toLowerCase().includes('afreen');

    if (isAfreen) {
      return {
        today: new Date().toISOString().split('T')[0],
        growth_stage: 0,
        garden_name: `${name}'s Routine Care`,
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
    }

    return {
      today: new Date().toISOString().split('T')[0],
      growth_stage: 1,
      garden_name: `${name}'s Routine Care`,
      routine_message: '🌱 Welcome! Complete your intake assessment to activate your personalized schedule.',
      schedule: [],
      history: []
    };
  }

  public async markDoseTaken(doseId: string, _notes?: string): Promise<any> {
    const res = await fetch('/api/adherence/mark-taken', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ dose_id: doseId, user_id: this.user?.user_id })
    });
    return await res.json();
  }

  public async sendMessage(
    message: string,
    medication: string = 'Donepezil',
    patientName: string = 'Afreen'
  ): Promise<ChatApiResponse> {
    const pName = this.user?.preferred_name || this.user?.name || patientName;
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, medication, patient_name: pName, user_id: this.user?.user_id })
    });
    if (!res.ok) {
      throw new Error(`Chat API error: ${res.statusText}`);
    }
    return await res.json();
  }

  public async getNotificationHistory(): Promise<NotificationAuditRecord[]> {
    const userId = this.user?.user_id;
    try {
      const url = userId ? `/api/escalation/history?user_id=${encodeURIComponent(userId)}` : '/api/escalation/history';
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch {}
    return [];
  }

  public async triggerEscalation(summary: string, urgency: UrgencyLevel = 'HIGH'): Promise<NotificationAuditRecord> {
    const pName = this.user?.preferred_name || this.user?.name || 'Afreen';
    const res = await fetch('/api/escalation', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        summary,
        urgency,
        patient_name: pName,
        user_id: this.user?.user_id,
        channel: 'TELEGRAM_BOT'
      })
    });
    const data = await res.json();
    return data.details;
  }

  public async calibrateIntake(submission: IntakeSubmission): Promise<any> {
    const res = await fetch('/api/intake/calibrate', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...submission, user_id: this.user?.user_id })
    });
    const data = await res.json();
    if (this.user) {
      this.user.intake_completed = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegiscare_user', JSON.stringify(this.user));
      }
    }
    return data;
  }

  public async advanceMissedDoseStep(): Promise<any> {
    const res = await fetch('/api/agent/missed-dose-step', {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return await res.json();
  }

  public async getDocuments(): Promise<any> {
    const res = await fetch('/api/documents');
    return await res.json();
  }

  public async sendTelegramReminder(payload?: { medication?: string; dosage?: string; time?: string; doseId?: string; chatId?: string }): Promise<any> {
    const res = await fetch('/api/telegram/send-reminder', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        patient_name: this.user?.preferred_name || this.user?.name || 'Afreen',
        user_id: this.user?.user_id
      })
    });
    return await res.json();
  }

  public async getTelegramStatus(): Promise<any> {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) return await res.json();
    } catch {}
    return { ok: true, bot_username: 'BversityCareBot', status: 'WAITING_FOR_USER_START' };
  }

  public async pollTelegramUpdates(): Promise<any> {
    try {
      const res = await fetch('/api/telegram/poll');
      if (res.ok) return await res.json();
    } catch {}
    return { ok: true, processed_count: 0 };
  }

  public async saveTelegramChatId(chatId: string): Promise<any> {
    const res = await fetch('/api/telegram/status', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ chat_id: chatId })
    });
    return await res.json();
  }
}

export const apiService = new ApiClient();
