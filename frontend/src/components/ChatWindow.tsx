import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, ChatSession } from '../types/chat';
import { usePatient } from '../context/PatientContext';
import { apiService } from '../services/api';
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
  Clock
} from 'lucide-react';

interface ChatWindowProps {
  initialTopic?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialTopic }) => {
  const { profile, currentUser, setSelectedCitation, setIsEmergencyModalOpen, refreshState } = usePatient();
  const userId = currentUser?.user_id || 'patient_afreen';
  const storageKey = `aegiscare_chat_sessions_${userId}`;

  const createInitialWelcome = (name: string): ChatMessage => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return {
      id: `msg_welcome_${Date.now()}`,
      sender: 'assistant',
      text: `${timeGreeting}, ${name} 😊 I am your clinical medication companion. How can I help you today? You can ask me about taking your medicine, meal guidelines, missed doses, or side effects.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'GENERAL_QUERY',
      risk_level: 'LOW',
      safety_status: 'SAFE',
      escalation_required: false
    };
  };

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  // Initialize sessions from localStorage or provide clean default history
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const patientName = profile.preferred_name || profile.name || 'Afreen';
    let loadedSessions: ChatSession[] = [];

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatSession[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedSessions = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load chat sessions:', e);
      }
    }

    if (loadedSessions.length === 0) {
      loadedSessions = [
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
    }

    // Ensure we start with a clean fresh session for today's opening
    const firstSess = loadedSessions[0];
    if (firstSess && firstSess.messages.some((m) => m.sender === 'user')) {
      const freshTodaySession: ChatSession = {
        id: `sess_fresh_${Date.now()}`,
        title: "Today's Clinical Consultation",
        date_label: 'Today',
        created_at: new Date().toISOString(),
        messages: [createInitialWelcome(patientName)],
        last_snippet: 'Ready for consultation...'
      };
      return [freshTodaySession, ...loadedSessions];
    } else if (!firstSess) {
      const freshTodaySession: ChatSession = {
        id: `sess_fresh_${Date.now()}`,
        title: "Today's Clinical Consultation",
        date_label: 'Today',
        created_at: new Date().toISOString(),
        messages: [createInitialWelcome(patientName)],
        last_snippet: 'Ready for consultation...'
      };
      return [freshTodaySession];
    }

    return loadedSessions;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'sess_default');
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col md:flex-row min-h-[650px] bg-white border border-[#EFEAE1] rounded-[16px] shadow-[0_4px_20px_rgba(45,37,69,0.04)] overflow-hidden">
      {/* Left Sidebar: Chat History List */}
      <div className={`w-full md:w-64 lg:w-72 bg-[#FAF7F2] border-b md:border-b-0 md:border-r border-[#EFEAE1] flex flex-col ${showHistoryMobile ? 'block' : 'hidden md:flex'}`}>
        <div className="p-3.5 border-b border-[#EFEAE1] space-y-2">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="touch-target w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-xs shadow-[0_2px_8px_rgba(255,97,56,0.3)] transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Chat Consultation</span>
          </button>

          <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-[#6B6282]">
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Past Chat History
            </span>
            <span className="bg-[#EFEAE1] text-[#2D2545] px-2 py-0.2 rounded-full text-[10px] font-bold">
              {sessions.length}
            </span>
          </div>
        </div>

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
                className={`group relative p-3 rounded-[12px] border text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-white border-[#FF6138] ring-2 ring-[#FF6138]/15 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-white hover:border-[#EFEAE1] text-[#5D5570]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FF6138]' : 'text-[#988EA8]'}`} />
                    <h4 className={`text-xs truncate font-bold font-['Outfit'] ${isActive ? 'text-[#2D2545]' : 'text-[#40365D]'}`}>
                      {sess.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    title="Delete this chat history"
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#988EA8] hover:text-[#E53E3E] rounded transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#6B6282] mt-1.5">
                  <span className="truncate max-w-[130px]">{sess.last_snippet || 'Consultation record'}</span>
                  <span className="font-bold text-[9px] px-2 py-0.2 rounded-full bg-[#EFEAE1] text-[#2D2545] shrink-0">
                    {sess.date_label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main: Active Conversation */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="px-5 py-3.5 bg-white border-b border-[#EFEAE1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistoryMobile(!showHistoryMobile)}
              className="md:hidden touch-target p-1.5 rounded-[8px] border border-[#EFEAE1] text-[#40365D] hover:bg-[#FAF7F2]"
              title="Toggle Chat History Sidebar"
            >
              <History className="w-4 h-4 text-[#FF6138]" />
            </button>

            <div className="w-9 h-9 rounded-[10px] bg-[#FF6138] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#2D2545] font-['Outfit']">
                  Clinical Adherence Companion
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF8F0] text-[#136B3B] font-bold border border-[#1E824C]/25">
                  Verified Assistant
                </span>
              </div>
              <p className="text-xs text-[#6B6282] font-medium">
                Grounded in official {profile.primary_medication.name} Monograph & Clinical Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            aria-label="Open emergency care team contact"
            className="touch-target hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF8E7] text-[#8C5A00] font-bold text-xs hover:bg-[#FFECC2] border border-[#FFBE53]/30 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#8C5A00]" />
            <span>Care Team Hub</span>
          </button>
        </div>

        <div className="sticky top-0 z-20 px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-[#EFEAE1] shadow-2xs">
          <DemoScenarioBar onSelectScenario={handleScenarioTrigger} isLoading={isLoading} />
        </div>

        <div
          tabIndex={0}
          aria-label="Conversation messages"
          className="flex-1 p-4 sm:p-5 space-y-4 bg-[#F7F4EE] focus:outline-none min-h-[400px]"
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
                  className={`max-w-[92%] sm:max-w-[82%] rounded-[16px] p-4 shadow-xs ${
                    isUser
                      ? 'bg-[#FF6138] text-white rounded-br-[3px]'
                      : 'bg-white text-[#2D2545] border border-[#EFEAE1] rounded-bl-[3px]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isUser ? (
                        <span className="text-xs font-bold text-white/90 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> You
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#FF6138] flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" /> DeMentor Clinical AI
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-white/70' : 'text-[#988EA8]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.text}
                  </p>

                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#EFEAE1] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-[#6B6282]">
                        Verified Grounding:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedCitation(src)}
                          aria-label={`View clinical citation for ${src.document}`}
                          className="touch-target inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F2EDFF] hover:bg-[#E4D9FF] text-[#5B31D8] text-xs font-bold border border-[#7952EC]/20 transition cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{src.section}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {!isUser && isEscalate && (
                    <div className="mt-3 p-3 rounded-[12px] bg-[#FFF0F0] border border-[#E53E3E]/30 text-xs text-[#E53E3E] font-bold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#E53E3E] shrink-0" />
                        <span>Care Team Alert Triggered</span>
                      </div>
                      <button
                        onClick={() => setIsEmergencyModalOpen(true)}
                        className="touch-target px-3 py-1 rounded-full bg-[#E53E3E] text-white text-[11px] font-bold hover:bg-[#C53030]"
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
              <div className="w-8 h-8 rounded-[10px] bg-[#FF6138] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#EFEAE1] rounded-[14px] p-3.5 text-xs text-[#6B6282] font-semibold flex items-center gap-2 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-[#FF6138] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#FF6138] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#FF6138] animate-bounce [animation-delay:0.4s]" />
                <span>Consulting verified product monograph...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 z-20 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#EFEAE1]">
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
              className="touch-target flex-1 h-[46px] px-4 rounded-full border border-[#EFEAE1] bg-white text-[#2D2545] text-sm font-medium placeholder:text-[#988EA8] focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send message to assistant"
              className="touch-target w-[46px] h-[46px] rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(255,97,56,0.3)] transition active:scale-[0.98] disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
