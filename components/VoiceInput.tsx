'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, RotateCcw, Volume2, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onSendMessage, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone permission was denied. You can type below instead.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please tap the microphone and speak clearly.');
        } else {
          setErrorMessage('Voice input encountered a temporary issue. You can type directly.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const handleConfirmSend = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      setTranscript('');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setErrorMessage(null);
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-[#64748B] py-1 flex items-center gap-1.5 font-medium">
        <Volume2 className="w-4 h-4 text-[#94A3B8]" />
        <span>Voice speech input not supported in this browser. Please use keyboard typing.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          aria-label={isListening ? 'Stop listening to voice' : 'Speak using microphone voice input'}
          className={`touch-target flex items-center gap-2 px-3.5 py-2 rounded-[8px] font-semibold text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
            isListening
              ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white animate-pulse'
              : 'bg-[#EAF3FF] hover:bg-[#D3E5FF] text-[#2F80ED] border border-[#2F80ED]/30'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? 'Listening... Tap to Stop' : 'Speak by Voice'}</span>
        </button>

        {isListening && (
          <div className="flex items-center gap-1 h-6 px-2.5 bg-[#FEE2E2] rounded-[6px] border border-[#DC2626]/20" aria-hidden="true">
            <div className="w-1 bg-[#DC2626] h-4 rounded-full" />
            <div className="w-1 bg-[#DC2626] h-2.5 rounded-full" />
            <div className="w-1 bg-[#DC2626] h-5 rounded-full" />
            <div className="w-1 bg-[#DC2626] h-3 rounded-full" />
            <div className="w-1 bg-[#DC2626] h-4 rounded-full" />
            <span className="text-[11px] font-semibold text-[#DC2626] ml-1.5">Listening clearly...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-[8px] text-xs text-[#B45309]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {transcript && !isListening && (
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-3 shadow-sm animate-fade-in">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F80ED] flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Voice Transcription Preview:
            </span>
            <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
              "{transcript}"
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={handleConfirmSend}
              className="touch-target flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="touch-target flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-white border border-[#CBD5E1] text-[#475569] font-medium text-xs hover:bg-[#F1F5F9] transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
