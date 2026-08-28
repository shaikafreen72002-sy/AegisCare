import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { Activity, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = usePatient();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('lakshmi@example.com');
  const [password, setPassword] = useState('pass123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter your email or phone number and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoIdentifier: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(demoIdentifier, 'demo123');
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,23,42,0.08)] animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-[10px] bg-[#2F80ED] text-white flex items-center justify-center mx-auto shadow-sm">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-bold text-[#0F172A]">AegisCare</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#2F80ED] font-semibold border border-[#CBD5E1]/40">
                Clinical Portal
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Evidence-Grounded Medication Adherence Companion
            </p>
          </div>
        </div>

        {/* Method Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[8px] mb-5 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setIdentifier('lakshmi@example.com');
            }}
            className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
              loginMethod === 'email'
                ? 'bg-white text-[#2F80ED] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setIdentifier('+1 (555) 234-5678');
            }}
            className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
              loginMethod === 'phone'
                ? 'bg-white text-[#2F80ED] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone Number</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-identifier"
              className="block text-xs font-bold text-[#334155] mb-1"
            >
              {loginMethod === 'email' ? 'Email Address' : 'Mobile / WhatsApp Phone Number'}
            </label>
            <div className="relative">
              {loginMethod === 'email' ? (
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
              ) : (
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
              )}
              <input
                id="login-identifier"
                type={loginMethod === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMethod === 'email' ? 'e.g. name@example.com' : 'e.g. +1 (555) 234-5678'}
                required
                className="touch-target w-full h-[44px] pl-9 pr-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-[#334155] mb-1"
            >
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="touch-target w-full h-[44px] pl-9 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="touch-target absolute right-2 top-2 p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-[8px] bg-[#FEE2E2] border border-[#DC2626]/30 text-xs text-[#DC2626] font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="touch-target w-full h-[44px] rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to AegisCare'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Tap Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block text-center">
            Or Use 1-Tap Demo Profiles:
          </span>

          <button
            type="button"
            onClick={() => handleQuickDemo('lakshmi@example.com')}
            className="touch-target w-full p-2.5 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EAF3FF] border border-[#CBD5E1] text-left transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#2F80ED] text-white flex items-center justify-center text-xs font-bold">
                LA
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-[#2F80ED]">
                  Lakshmi Amma (Patient • 74y)
                </span>
                <span className="text-[11px] text-[#64748B]">Donepezil Adherence Dashboard</span>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F80ED]" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('priya@example.com')}
            className="touch-target w-full p-2.5 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EAF3FF] border border-[#CBD5E1] text-left transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs font-bold">
                PR
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-[#16A34A]">
                  Priya (Caregiver Portal)
                </span>
                <span className="text-[11px] text-[#64748B]">WhatsApp Alerts & Clinical Log</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A]" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('newpatient@example.com')}
            className="touch-target w-full p-2.5 rounded-[8px] bg-[#FEF3C7]/40 hover:bg-[#FEF3C7] border border-[#F59E0B]/30 text-left transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-[#B45309]">
                  New Patient Intake & AI Calibration
                </span>
                <span className="text-[11px] text-[#64748B]">Starts full 7-step clinical assessment</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
          </button>
        </div>
      </div>
    </div>
  );
};
