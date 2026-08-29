import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

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
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
          transcriptRef.current = '';
          setTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript;
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone permission was denied. You can type below instead.');
          } else if (event.error === 'no-speech') {
            setErrorMessage('No speech detected. Tap microphone and speak clearly.');
          } else {
            setErrorMessage('Voice input encountered a temporary issue. You can type directly.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const textToSend = transcriptRef.current.trim();
          if (textToSend) {
            onSendMessage(textToSend);
            transcriptRef.current = '';
            setTranscript('');
          }
        };

        recognitionRef.current = recognition;
      } catch {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSendMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      transcriptRef.current = '';
      setTranscript('');
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-[#6B6282] py-1 flex items-center gap-1.5 font-medium">
        <Volume2 className="w-4 h-4 text-[#988EA8]" />
        <span>Voice speech input not supported in this browser. Please type below.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          aria-label={isListening ? 'Stop listening and auto-send' : 'Speak by voice to auto-send'}
          className={`touch-target flex items-center gap-2 px-3.5 py-2.5 rounded-full font-bold text-xs transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
            isListening
              ? 'bg-[#FF6138] hover:bg-[#E84E27] text-white animate-pulse shadow-[0_2px_10px_rgba(255,97,56,0.35)]'
              : 'bg-[#FFF0EB] hover:bg-[#FFE0D6] text-[#FF6138] border border-[#FF6138]/25'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#FF6138]" />}
          <span>{isListening ? 'Listening... Tap to Finish & Send' : 'Speak by Voice'}</span>
        </button>

        {isListening && (
          <div className="flex items-center gap-1 h-7 px-3 bg-[#FFF0EB] rounded-full border border-[#FF6138]/25 animate-fade-in" aria-hidden="true">
            <div className="w-1 bg-[#FF6138] h-3.5 rounded-full animate-bounce" />
            <div className="w-1 bg-[#FF6138] h-2 rounded-full animate-bounce [animation-delay:0.15s]" />
            <div className="w-1 bg-[#FF6138] h-4 rounded-full animate-bounce [animation-delay:0.3s]" />
            <div className="w-1 bg-[#FF6138] h-2.5 rounded-full animate-bounce [animation-delay:0.45s]" />
            <span className="text-[11px] font-bold text-[#FF6138] ml-1">
              {transcript ? `"${transcript.slice(0, 24)}${transcript.length > 24 ? '...' : ''}"` : 'Listening...'}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2 bg-[#FFF8E7] border border-[#FFBE53]/40 rounded-[10px] text-xs text-[#8C5A00] animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#FFBE53]" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
