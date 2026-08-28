import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import { usePatient } from '../context/PatientContext';
import { apiService } from '../services/api';
import { VoiceInput } from './VoiceInput';
import { AgentStatusPanel } from './AgentStatusPanel';
import { DemoScenarioBar } from './DemoScenarioBar';
import {
  Send,
  ShieldAlert,
  BookOpen,
  Bot,
  User
} from 'lucide-react';

interface ChatWindowProps {
  initialTopic?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialTopic }) => {
  const { profile, setSelectedCitation, setIsEmergencyModalOpen, refreshState } = usePatient();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${profile.preferred_name || profile.name}! I am your clinical medication companion powered by specialized AI agents. How can I help you today? You can ask me about taking your medicine, meal guidelines, missed doses, or side effects.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'GENERAL_QUERY',
      risk_level: 'LOW',
      safety_status: 'SAFE',
      escalation_required: false,
      ai_pipeline_events: [
        {
          agent: 'Clinical Guardrail Agent',
          role: 'Medical Information Specialist',
          status: 'SUCCESS',
          action: 'INIT',
          detail: `Profile verified for ${profile.preferred_name || profile.name}. Prohibiting medical hallucinations and dosage adjustments.`
        },
        {
          agent: 'Document Knowledge Agent',
          role: 'Clinical Knowledge Librarian',
          status: 'SUCCESS',
          action: 'RAG_READY',
          detail: 'Product monographs indexed and ready for grounded retrieval.'
        }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Special handler for Missed Dose Step Simulation
    if (text === '__STEP_MISSED_DOSE__') {
      setIsLoading(true);
      try {
        const simMsg: ChatMessage = {
          id: `user_miss_${Date.now()}`,
          sender: 'user',
          text: 'Triggering next non-acknowledgment reminder in escalation tree...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, simMsg]);

        const simResp = await apiService.simulateMissedDoseStep();
        const astSimMsg: ChatMessage = {
          id: `ast_sim_${Date.now()}`,
          sender: 'assistant',
          text: simResp.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: simResp.intent,
          risk_level: simResp.risk_level,
          safety_status: simResp.safety_status,
          escalation_required: simResp.escalation_required,
          escalation: simResp.escalation,
          sources: simResp.sources,
          ai_pipeline_events: simResp.ai_pipeline_events
        };
        setMessages((prev) => [...prev, astSimMsg]);
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

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const currentMed = profile.primary_medication.name || 'donepezil';
      const apiResp = await apiService.sendMessage(text, currentMed);

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

      setMessages((prev) => [...prev, assistantMsg]);
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
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioTrigger = (_scenarioId: string, promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[85vh] bg-white border border-[#E2E8F0] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Top Banner */}
      <div className="px-5 py-3.5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#2F80ED] text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#0F172A]">
                Clinical Adherence Companion
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED] font-semibold border border-[#CBD5E1]/40">
                4-Agent Pipeline
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Referencing {profile.primary_medication.name} Monograph & BPSD Guidelines
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

      {/* Demo Scenario Quick-Selector Bar */}
      <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <DemoScenarioBar onSelectScenario={handleScenarioTrigger} isLoading={isLoading} />
      </div>

      {/* Messages Scroll Area */}
      <div
        tabIndex={0}
        aria-label="Conversation messages"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F7F9FC] focus:outline-none"
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
                    ? 'bg-[#2F80ED] text-white rounded-br-xs'
                    : isEscalate
                    ? 'bg-[#FEF2F2] border-2 border-[#DC2626] text-[#0F172A] rounded-bl-xs'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isUser ? 'bg-white/20 text-white' : 'bg-[#EAF3FF] text-[#2F80ED]'
                    }`}
                  >
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isUser ? 'text-white/90' : 'text-[#334155]'
                    }`}
                  >
                    {isUser ? 'You' : 'AegisCare Clinical Companion'}
                  </span>
                  <span
                    className={`text-[10px] ml-auto font-medium ${
                      isUser ? 'text-white/70' : 'text-[#94A3B8]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </div>

                {/* Emergency Escalation Alert Card */}
                {isEscalate && msg.escalation && (
                  <div className="mt-3 p-3 bg-white rounded-[8px] border border-[#DC2626]/30 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[#DC2626] font-bold">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Caregiver WhatsApp & Doctor Notification Dispatched</span>
                    </div>
                    <p className="text-[#475569]">{msg.escalation.summary}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
                      <span>Recipient: {msg.escalation.recipient}</span>
                      <span className="font-semibold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                        ✓ {msg.escalation.notification_status || 'SENT'} ({msg.escalation.receipt_id || 'WA_TX_8910'})
                      </span>
                    </div>
                  </div>
                )}

                {/* Grounded Source Citations */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 mr-1">
                      <BookOpen className="w-3 h-3 text-[#2F80ED]" />
                      Sources:
                    </span>
                    {msg.sources.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCitation(src)}
                        className="touch-target inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EAF3FF] text-[#2F80ED] border border-[#CBD5E1]/60 hover:bg-[#D4E8FF] transition cursor-pointer"
                        title="Click to view official Product Monograph excerpt"
                      >
                        <span>
                          {src.document} (p. {src.page})
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Multi-Agent Safety Pipeline Status Panel */}
                {!isUser && (
                  <AgentStatusPanel events={msg.ai_pipeline_events} />
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 bg-white border border-[#E2E8F0] rounded-[10px] w-fit shadow-sm animate-pulse">
            <Bot className="w-4 h-4 text-[#2F80ED] animate-spin" />
            <span className="text-xs font-semibold text-[#475569]">
              Agents reasoning: Clinical Guardrail ➔ RAG ➔ Adherence ➔ Empathy...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      <div className="p-3 bg-white border-t border-[#E2E8F0]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <VoiceInput onSendMessage={(text: string) => handleSendMessage(text)} disabled={isLoading} />

          <input
            id="chat-user-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message or click a scenario chip..."
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
  );
};
