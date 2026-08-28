export type IntentType =
  | 'MISSED_DOSE'
  | 'MEDICATION_WITH_FOOD'
  | 'SIDE_EFFECT'
  | 'SEVERE_SYMPTOM'
  | 'POSSIBLE_OVERDOSE'
  | 'TREATMENT_FATIGUE'
  | 'PERSISTENT_CONFUSION'
  | 'MARK_TAKEN'
  | 'ADHERENCE_QUERY'
  | 'REMINDER_SETUP'
  | 'CONTACT_CARE_TEAM'
  | 'DRUG_INFO'
  | 'GENERAL_QUERY';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SafetyStatus = 'SAFE' | 'SAFE_WITH_STRICT_NO_DOUBLE_DOSE' | 'INSUFFICIENT_EVIDENCE' | 'ESCALATE';

export interface SourceCitation {
  document: string;
  medication: string;
  page: number;
  section: string;
  content?: string;
}

export interface EscalationInfo {
  recipient: string;
  channel?: string;
  urgency: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trigger: string;
  summary: string;
  recommended_action?: string;
  notification_status?: string;
  receipt_id?: string;
}

export interface PipelineEvent {
  agent: string;
  role?: string;
  status: 'SUCCESS' | 'CAUTION' | 'ESCALATED' | 'BLOCKED' | 'NOTICE' | 'SENT';
  action: string;
  detail: string;
}

export interface ChatApiResponse {
  response: string;
  intent: IntentType;
  risk_level: RiskLevel;
  safety_status: SafetyStatus;
  escalation_required: boolean;
  escalation?: EscalationInfo | null;
  sources: SourceCitation[];
  ai_pipeline_events?: PipelineEvent[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: IntentType;
  risk_level?: RiskLevel;
  safety_status?: SafetyStatus;
  escalation_required?: boolean;
  escalation?: EscalationInfo | null;
  sources?: SourceCitation[];
  ai_pipeline_events?: PipelineEvent[];
}
