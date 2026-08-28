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
  const [regPhone, setRegPhone] = useState('+91 ');
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
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regPhone.trim() || cleanPhone.length < 10) {
      setErrorMessage('Mobile phone number is compulsory (India +91) because it connects with Telegram medication reminders.');
      return;
    }
    if (!regIdentifier.trim()) {
      setErrorMessage('Please enter your email address.');
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
      <div className="max-w-md w-full bg-white border border-[#EFEAE1] rounded-[20px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(45,37,69,0.06)] animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-[#FF6138] to-[#FF8C6B] text-white flex items-center justify-center mx-auto shadow-[0_4px_12px_rgba(255,97,56,0.3)]">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-extrabold text-[#2D2545] font-['Outfit']">AegisCare</h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#FF6138] font-bold border border-[#FF6138]/20">
                Clinical Companion
              </span>
            </div>
            <p className="text-xs text-[#6B6282] font-medium mt-0.5">
              Evidence-Grounded Medication Adherence Companion
            </p>
          </div>
        </div>

        {/* Primary Auth Mode Switcher: Log In (Existing) vs Sign In / Register (New User) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF7F2] rounded-full mb-5 border border-[#EFEAE1]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`touch-target flex flex-col items-center justify-center py-2 px-3 rounded-full transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#FF6138] shadow-xs font-bold'
                : 'text-[#6B6282] hover:text-[#2D2545] font-semibold'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs">
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </div>
            <span className="text-[10px] opacity-80">Existing Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`touch-target flex flex-col items-center justify-center py-2 px-3 rounded-full transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-[#FF6138] shadow-xs font-bold'
                : 'text-[#6B6282] hover:text-[#2D2545] font-semibold'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </div>
            <span className="text-[10px] opacity-80">New Intake</span>
          </button>
        </div>

        {/* ================= MODE 1: LOG IN FOR EXISTING USERS ================= */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Email vs Phone Sub-switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-full border border-[#EFEAE1]">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setIdentifier('afreen@example.com');
                  setPassword('afreen123');
                }}
                className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#FF6138] shadow-xs border border-[#EFEAE1]'
                    : 'text-[#6B6282] hover:text-[#2D2545]'
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
                className={`touch-target flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#FF6138] shadow-xs border border-[#EFEAE1]'
                    : 'text-[#6B6282] hover:text-[#2D2545]'
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
                  className="block text-xs font-bold text-[#40365D] mb-1"
                >
                  {loginMethod === 'email' ? 'Registered Email or Name' : 'Mobile / Telegram Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  ) : (
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  )}
                  <input
                    id="login-identifier"
                    type={loginMethod === 'email' ? 'text' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginMethod === 'email' ? 'e.g. afreen@example.com or Afreen' : 'e.g. +91 98765 43210'}
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-3.5 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-[#40365D] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-10 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="touch-target absolute right-3 top-2.5 p-1 text-[#988EA8] hover:text-[#2D2545] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-[12px] bg-[#FFF0F0] border border-[#E53E3E]/30 text-xs text-[#E53E3E] font-bold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="touch-target w-full h-[46px] rounded-full bg-[#FF6138] hover:bg-[#E84E27] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,97,56,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Log In to AegisCare'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Tap Pre-configured Account (Afreen) */}
            <div className="mt-5 pt-4 border-t border-[#F4EFE6] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6282] block text-center">
                1-Tap Quick Log In Profile:
              </span>

              {/* Afreen Account */}
              <button
                type="button"
                onClick={() => handleQuickDemo('afreen@example.com', 'afreen123')}
                className="touch-target w-full p-3 rounded-[14px] bg-[#FFF0EB] hover:bg-[#FFE5DC] border border-[#FF6138]/25 text-left transition flex items-center justify-between cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6138] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    AF
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#2D2545] block group-hover:text-[#FF6138]">
                      Afreen (Patient Account)
                    </span>
                    <span className="text-[11px] text-[#6B6282]">Password: afreen123</span>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#FF6138]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE 2: SIGN IN / REGISTER FOR NEW USERS ================= */}
        {authMode === 'register' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FFF0EB] border border-[#FF6138]/20 rounded-[14px] text-xs text-[#2D2545] space-y-1">
              <span className="font-bold text-[#FF6138] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Welcome New Patient!
              </span>
              <p className="text-[#5D5570]">
                Create your account below. You will be guided through a gentle 7-step clinical intake assessment to personalize your adherence routine.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-bold text-[#40365D] mb-1"
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
                  className="touch-target w-full h-[46px] px-4 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-bold text-[#40365D] mb-1 flex items-center justify-between"
                >
                  <span>Mobile Phone Number (Compulsory for Telegram)</span>
                  <span className="text-[10px] text-[#E53E3E] font-bold uppercase">Required</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-bold text-[#FF6138]">🇮🇳</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('+91')) {
                        val = '+91 ' + val.replace(/^\+?91\s*/, '');
                      }
                      setRegPhone(val);
                    }}
                    placeholder="+91 98765 43210"
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-3.5 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] font-bold placeholder:text-[#988EA8] placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                </div>
                <p className="text-[11px] text-[#6B6282] mt-0.5">
                  Used by @BversityCareBot to dispatch automated interactive medication reminders.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-identifier"
                  className="block text-xs font-bold text-[#40365D] mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  <input
                    id="reg-identifier"
                    type="email"
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder="e.g. afreen@example.com"
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-3.5 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-bold text-[#40365D] mb-1"
                >
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (e.g. afreen123)"
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-10 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="touch-target absolute right-3 top-2.5 p-1 text-[#988EA8] hover:text-[#2D2545] cursor-pointer"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-bold text-[#40365D] mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#988EA8]" />
                  <input
                    id="reg-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password..."
                    required
                    className="touch-target w-full h-[46px] pl-10 pr-3.5 rounded-full border border-[#EFEAE1] bg-[#FAF7F2] text-sm text-[#2D2545] placeholder:text-[#988EA8] focus:bg-white focus:outline-none focus:border-[#FF6138] focus:ring-2 focus:ring-[#FFF0EB]"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-[12px] bg-[#FFF0F0] border border-[#E53E3E]/30 text-xs text-[#E53E3E] font-bold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="touch-target w-full h-[46px] rounded-full bg-[#1E824C] hover:bg-[#156B3D] text-white font-bold text-sm shadow-[0_4px_14px_rgba(30,130,76,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
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
