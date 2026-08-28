'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import {
  Activity,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  UserCheck,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = usePatient();
  
  // Auth Mode: 'login' (existing user) vs 'register' (new user)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('afreen@example.com');
  const [password, setPassword] = useState('afreen123');
  const [showPassword, setShowPassword] = useState(false);

  // Register (New User) State
  const [regName, setRegName] = useState('Afreen');
  const [regIdentifier, setRegIdentifier] = useState('afreen@example.com');
  const [regPassword, setRegPassword] = useState('afreen123');
  const [regConfirmPassword, setRegConfirmPassword] = useState('afreen123');
  const [showRegPassword, setShowRegPassword] = useState(false);

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regIdentifier.trim()) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }
    if (!regPassword.trim()) {
      setErrorMessage('Please create a secure password.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await register(regName.trim(), regIdentifier.trim(), regPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoIdentifier: string, demoPassword: string = 'demo123') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(demoIdentifier, demoPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-[14px] p-6 sm:p-8 shadow-[0_4px_16px_rgba(15,23,42,0.08)] animate-fade-in">
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

        {/* Primary Auth Mode Switcher: Log In (Existing) vs Sign In / Register (New User) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#F1F5F9] rounded-[10px] mb-5 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`touch-target flex flex-col items-center justify-center py-2 px-3 rounded-[8px] transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#2F80ED] shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#0F172A] font-semibold'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs">
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-normal mt-0.5">
              Already have an account
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`touch-target flex flex-col items-center justify-center py-2 px-3 rounded-[8px] transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-[#2F80ED] shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#0F172A] font-semibold'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-normal mt-0.5">
              For new users
            </span>
          </button>
        </div>

        {/* ================= MODE 1: LOG IN FOR EXISTING USERS ================= */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Email vs Phone Sub-switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setIdentifier('afreen@example.com');
                  setPassword('afreen123');
                }}
                className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#2F80ED] shadow-2xs border border-[#CBD5E1]/40'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone');
                  setIdentifier('+91 98765 43210');
                  setPassword('afreen123');
                }}
                className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#2F80ED] shadow-2xs border border-[#CBD5E1]/40'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Number</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-bold text-[#334155] mb-1"
                >
                  {loginMethod === 'email' ? 'Registered Email or Name' : 'Mobile / Telegram Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  ) : (
                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  )}
                  <input
                    id="login-identifier"
                    type={loginMethod === 'email' ? 'text' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginMethod === 'email' ? 'e.g. afreen@example.com or Afreen' : 'e.g. +91 98765 43210'}
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
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
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
                <span>{isLoading ? 'Signing In...' : 'Log In to AegisCare'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Tap Pre-configured Account (Afreen) */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block text-center">
                1-Tap Quick Log In Profile:
              </span>

              {/* Afreen Account */}
              <button
                type="button"
                onClick={() => handleQuickDemo('afreen@example.com', 'afreen123')}
                className="touch-target w-full p-2.5 rounded-[8px] bg-[#EAF3FF] hover:bg-[#D4E8FF] border border-[#2F80ED]/30 text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#2F80ED] text-white flex items-center justify-center text-xs font-bold">
                    AF
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block group-hover:text-[#2F80ED]">
                      Afreen (Patient Account)
                    </span>
                    <span className="text-[11px] text-[#64748B]">Password: afreen123</span>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#2F80ED]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE 2: SIGN IN / REGISTER FOR NEW USERS ================= */}
        {authMode === 'register' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#EAF3FF] border border-[#2F80ED]/20 rounded-[8px] text-xs text-[#0F172A] space-y-1">
              <span className="font-bold text-[#2F80ED] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Welcome New Patient!
              </span>
              <p className="text-[#475569]">
                Create your account below. You will be guided through a gentle 7-step clinical intake assessment to personalize your adherence routine.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-bold text-[#334155] mb-1"
                >
                  Full Name / Patient Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Afreen"
                  required
                  className="touch-target w-full h-[44px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-identifier"
                  className="block text-xs font-bold text-[#334155] mb-1"
                >
                  Email Address or Mobile Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  <input
                    id="reg-identifier"
                    type="text"
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder="e.g. afreen@example.com or +91 98765 43210"
                    required
                    className="touch-target w-full h-[44px] pl-9 pr-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-bold text-[#334155] mb-1"
                >
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (e.g. afreen123)"
                    required
                    className="touch-target w-full h-[44px] pl-9 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="touch-target absolute right-2 top-2 p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-bold text-[#334155] mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#94A3B8]" />
                  <input
                    id="reg-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password..."
                    required
                    className="touch-target w-full h-[44px] pl-9 pr-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
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
                className="touch-target w-full h-[44px] rounded-[8px] bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Sign In / Register New Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
