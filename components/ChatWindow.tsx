import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, ChatSession } from '@/lib/types/chat';
import { usePatient } from '@/lib/context/PatientContext';
import { apiService } from '@/lib/apiClient';
import { VoiceInput } from './VoiceInput';
import { DemoScenarioBar } from './DemoScenarioBar';
import {
  Send,
  ShieldAlert,
  BookOpen,
  Bot,
  User,
  Plus,
  MessageSquare,
  History,
  Trash2,
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react';

interface ChatWindowProps {
  initialTopic?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialTopic }) => {
  const { profile, currentUser, setSelectedCitation, setIsEmergencyModalOpen, refreshState } = usePatient();
  const userId = currentUser?.user_id || 'patient_afreen';
  const storageKey = `aegiscare_chat_sessions_${userId}`;

  const createInitialWelcome = (name: string): ChatMessage => ({
    id: `msg_welcome_${Date.now()}`,
    sender: 'assistant',
    text: `Hello ${name}! I am your clinical medication companion. How can I help you today? You can ask me about taking your medicine, meal guidelines, missed doses, or side effects.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intent: 'GENERAL_QUERY',
    risk_level: 'LOW',
    safety_status: 'SAFE',
    escalation_required: false
  });

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  // Initialize sessions from localStorage or provide clean default history
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatSession[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load chat sessions:', e);
      }
    }

    const todayDate = getTodayDateStr();
    const patientName = profile.preferred_name || profile.name || 'Afreen';

    return [
      {
        id: `sess_today_${Date.now()}`,
        title: "Today's Clinical Consultation",
        date_label: 'Today',
        created_at: new Date().toISOString(),
        messages: [createInitialWelcome(patientName)],
        last_snippet: 'Hello! How can I help you today with your medication?'
      },
      {
        id: `sess_yesterday_${Date.now() - 86400000}`,
        title: 'Evening Donepezil Guidance & Meal Rules',
        date_label: 'Yesterday',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        messages: [
          {
            id: 'm_hist_1',
            sender: 'user',
            text: 'Should I take Donepezil before or after dinner?',
            timestamp: '08:15 PM'
          },
          {
            id: 'm_hist_2',
            sender: 'assistant',
            text: 'Donepezil can be taken with dinner or an evening snack with a glass of water to minimize stomach upset.',
            timestamp: '08:15 PM',
            risk_level: 'LOW',
            safety_status: 'SAFE'
          }
        ],
        last_snippet: 'Donepezil can be taken with dinner or an evening snack...'
      },
      {
        id: `sess_past_${Date.now() - 172800000}`,
        title: 'Mild Dizziness Side-Effect Review',
        date_label: '2 Days Ago',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        messages: [
          {
            id: 'm_hist_3',
            sender: 'user',
            text: 'I felt mild dizziness after taking my tablet yesterday.',
            timestamp: '09:30 AM'
          },
          {
            id: 'm_hist_4',
            sender: 'assistant',
            text: 'Mild dizziness is documented in the product monograph during early therapy. Sit or stand up slowly and drink plenty of water.',
            timestamp: '09:31 AM',
            risk_level: 'MEDIUM',
            safety_status: 'SAFE'
          }
        ],
        last_snippet: 'Mild dizziness is documented in the monograph...'
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'sess_default');
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save sessions to localStorage on state change
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save chat sessions:', e);
      }
    }
  }, [sessions, storageKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialTopic) {
      handleSendMessage(initialTopic);
    }
  }, [initialTopic]);

  // Create a fresh new chat session
  const handleCreateNewChat = () => {
    const patientName = profile.preferred_name || profile.name || 'Afreen';
    const newId = `sess_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `New Consultation (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      date_label: 'Today',
      created_at: new Date().toISOString(),
      messages: [createInitialWelcome(patientName)],
      last_snippet: 'Fresh session started.'
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowHistoryMobile(false);
  };

  // Delete a past session
  const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleCreateNewChat();
      return;
    }
    const remaining = sessions.filter((s) => s.id !== idToDelete);
    setSessions(remaining);
    if (activeSessionId === idToDelete) {
      setActiveSessionId(remaining[0]?.id || '');
    }
  };

  // Append message to active session
  const appendMessageToActive = (newMsg: ChatMessage) => {
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === activeSessionId) {
          const updatedMsgs = [...sess.messages, newMsg];
          const firstUserMsg = updatedMsgs.find((m) => m.sender === 'user');
          const autoTitle = firstUserMsg ? (firstUserMsg.text.slice(0, 36) + (firstUserMsg.text.length > 36 ? '...' : '')) : sess.title;
          return {
            ...sess,
            title: sess.title.startsWith('New Consultation') && autoTitle ? autoTitle : sess.title,
            messages: updatedMsgs,
            last_snippet: newMsg.text.slice(0, 50) + (newMsg.text.length > 50 ? '...' : '')
          };
        }
        return sess;
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (text === '__STEP_MISSED_DOSE__') {
      setIsLoading(true);
      try {
        const simMsg: ChatMessage = {
          id: `user_miss_${Date.now()}`,
          sender: 'user',
          text: 'Triggering missed dose escalation sequence...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        appendMessageToActive(simMsg);

        const simResp = await apiService.advanceMissedDoseStep();
        const decision = simResp.decision;
        const count = decision.acknowledgement_count;

        let responseText = `Hi ${profile.preferred_name || profile.name} 😊 It looks like your evening medicine reminder was missed. When you have a moment, please take your scheduled tablet with water.`;
        if (count === 2) {
          responseText = `⚠️ URGENT CAREGIVER ALERT: Hello ${profile.preferred_name || profile.name}, you have missed your medication for 2 consecutive days. I have automatically dispatched a Telegram alert to your caregiver (${profile.caregiver?.name || 'Priya'}) to check in on you.`;
        } else if (count >= 3) {
          responseText = `🚨 CLINICAL ESCALATION: Patient has missed medication for 3+ consecutive days with no response. Telemetry logs have been forwarded to Dr. Aarav Mehta (Physician) for medical review.`;
        }

        const astSimMsg: ChatMessage = {
          id: `ast_sim_${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'MISSED_DOSE',
          risk_level: count >= 3 ? 'CRITICAL' : count === 2 ? 'HIGH' : 'MEDIUM',
          safety_status: 'SAFE_WITH_STRICT_NO_DOUBLE_DOSE',
          escalation_required: count >= 2,
          escalation: simResp.escalation_details ? {
            recipient: simResp.escalation_details.recipient,
            urgency: simResp.escalation_details.urgency,
            trigger: simResp.escalation_details.trigger,
            summary: simResp.escalation_details.summary,
            notification_status: 'SENT',
            receipt_id: simResp.escalation_details.receipt_id
          } : null,
          sources: [
            {
              document: 'Donepezil Hydrochloride Product Monograph',
              medication: 'donepezil',
              page: 49,
              section: 'Missed Dose Guidelines',
              content: 'Never double dose. Resume normal scheduled evening dose.'
            }
          ]
        };

        appendMessageToActive(astSimMsg);
        await refreshState();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendMessageToActive(userMsg);
    setInputText('');
    setIsLoading(true);

    try {
      const currentMed = profile.primary_medication.name || 'donepezil';
      const apiResp = await apiService.sendMessage(text, currentMed, profile.preferred_name || profile.name);

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: apiResp.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: apiResp.intent,
        risk_level: apiResp.risk_level,
        safety_status: apiResp.safety_status,
        escalation_required: apiResp.escalation_required,
        escalation: apiResp.escalation,
        sources: apiResp.sources,
        ai_pipeline_events: apiResp.ai_pipeline_events
      };

      appendMessageToActive(assistantMsg);
      await refreshState();
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ast_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I am here with you. Please take your medicine as prescribed on the bottle or reach out to your doctor if you have doubts.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk_level: 'LOW',
        safety_status: 'SAFE'
      };
      appendMessageToActive(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioTrigger = (_scenarioId: string, promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[650px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* ================= LEFT SIDEBAR: CHAT HISTORY LIST ================= */}
      <div className={`w-full md:w-64 lg:w-72 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-[#E2E8F0] flex flex-col ${showHistoryMobile ? 'block' : 'hidden md:flex'}`}>
        {/* Top Action: + New Chat */}
        <div className="p-3.5 border-b border-[#E2E8F0] space-y-2">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="touch-target w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Chat Consultation</span>
          </button>

          <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Past Chat History
            </span>
            <span className="bg-[#E2E8F0] text-[#334155] px-1.5 py-0.2 rounded-full text-[10px]">
              {sessions.length}
            </span>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[300px] md:max-h-[600px]">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => {
                  setActiveSessionId(sess.id);
                  setShowHistoryMobile(false);
                }}
                className={`group relative p-2.5 rounded-[8px] border text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-white border-[#2F80ED] ring-1 ring-[#2F80ED]/30 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-white hover:border-[#CBD5E1] text-[#475569]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#2F80ED]' : 'text-[#94A3B8]'}`} />
                    <h4 className={`text-xs truncate font-bold ${isActive ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                      {sess.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    title="Delete this chat history"
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-[#DC2626] rounded transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1.5">
                  <span className="truncate max-w-[130px]">{sess.last_snippet || 'Consultation record'}</span>
                  <span className="font-semibold text-[9px] px-1.5 py-0.2 rounded bg-[#E2E8F0]/70 text-[#475569] shrink-0">
                    {sess.date_label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RIGHT MAIN: ACTIVE CONVERSATION ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="px-5 py-3.5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile History Toggle */}
            <button
              type="button"
              onClick={() => setShowHistoryMobile(!showHistoryMobile)}
              className="md:hidden touch-target p-1.5 rounded-[6px] border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]"
              title="Toggle Chat History Sidebar"
            >
              <History className="w-4 h-4 text-[#2F80ED]" />
            </button>

            <div className="w-9 h-9 rounded-[8px] bg-[#2F80ED] text-white flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F172A]">
                  Clinical Adherence Companion
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-semibold border border-[#16A34A]/30">
                  Verified Assistant
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">
                Grounded in official {profile.primary_medication.name} Monograph & Clinical Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            aria-label="Open emergency care team contact"
            className="touch-target hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#FEF3C7] text-[#D97706] font-semibold text-xs hover:bg-[#FDE68A] transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <span>Care Team Hub</span>
          </button>
        </div>

        {/* Sticky Scenario Options Bar - always visible when scrolling up and down */}
        <div className="sticky top-0 z-20 px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
          <DemoScenarioBar onSelectScenario={handleScenarioTrigger} isLoading={isLoading} />
        </div>

        {/* Single-scroll natural messages container */}
        <div
          tabIndex={0}
          aria-label="Conversation messages"
          className="flex-1 p-4 sm:p-5 space-y-4 bg-[#F7F9FC] focus:outline-none min-h-[400px]"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isEscalate = msg.escalation_required || msg.risk_level === 'CRITICAL' || msg.risk_level === 'HIGH';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-[12px] p-4 shadow-sm ${
                    isUser
                      ? 'bg-[#2F80ED] text-white rounded-br-[2px]'
                      : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-[2px]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isUser ? (
                        <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> You
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#2F80ED] flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" /> AegisCare Clinical AI
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-white/70' : 'text-[#64748B]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Sources citation link for assistant replies */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#64748B]">
                        Verified Grounding:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedCitation(src)}
                          aria-label={`View clinical citation for ${src.document}`}
                          className="touch-target inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#EAF3FF] hover:bg-[#D4E8FF] text-[#2F80ED] text-xs font-medium transition cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{src.section}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Urgent escalation alert banner */}
                  {!isUser && isEscalate && (
                    <div className="mt-3 p-2.5 rounded-[8px] bg-[#FEE2E2] border border-[#DC2626]/30 text-xs text-[#DC2626] font-semibold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0" />
                        <span>Care Team Alert Triggered</span>
                      </div>
                      <button
                        onClick={() => setIsEmergencyModalOpen(true)}
                        className="touch-target px-2 py-1 rounded bg-[#DC2626] text-white text-[11px] font-bold hover:bg-[#B91C1C]"
                      >
                        View Alert
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-[#2F80ED] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-3.5 text-xs text-[#64748B] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2F80ED] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#2F80ED] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#2F80ED] animate-bounce [animation-delay:0.4s]" />
                <span>Checking verified product monograph...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Message Input Bar */}
        <div className="sticky bottom-0 z-20 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <VoiceInput
              onSendMessage={(text: string) => {
                setInputText(text);
                handleSendMessage(text);
              }}
              disabled={isLoading}
            />

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or select an option above..."
              disabled={isLoading}
              className="touch-target flex-1 h-[44px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send message to assistant"
              className="touch-target w-[44px] h-[44px] rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white flex items-center justify-center shadow-sm transition active:scale-[0.98] disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
