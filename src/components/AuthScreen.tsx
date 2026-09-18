import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AuthMethod } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import {
  Shield,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
  Baby,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Radio,
  Sparkles,
} from 'lucide-react';

export function AuthScreen() {
  const { login, signup, accounts, users } = useFamily();

  const [mode, setMode] = useState<'login' | 'signup'>(accounts.length > 0 ? 'login' : 'signup');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('username');

  // Sign in state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'parent' | 'child' | 'teen' | 'guardian'>('parent');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupFamilyName, setSignupFamilyName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username, email, or phone number.');
      return;
    }

    const res = login(loginIdentifier, loginPassword);
    if (res.success) {
      setSuccessMsg('Welcome back! Loading your family vault...');
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMsg('Please choose a unique username.');
      return;
    }
    if (!signupPassword || signupPassword.length < 3) {
      setErrorMsg('Please enter a password (at least 3 characters).');
      return;
    }

    const res = signup({
      username: signupUsername,
      password: signupPassword,
      fullName: signupFullName,
      role: signupRole,
      email: signupRole === 'child' ? undefined : signupEmail,
      phone: signupRole === 'child' ? undefined : signupPhone,
      familyName: signupFamilyName.trim() || undefined,
      avatarUrl: selectedAvatar,
    });

    if (res.success) {
      setSuccessMsg('Family account created! Welcome to Family Chat.');
    } else {
      setErrorMsg(res.error || 'Could not create account. Try another username.');
    }
  };

  const handleQuickAccountLogin = (username: string, pass: string) => {
    setErrorMsg('');
    setSuccessMsg('Signing in...');
    const res = login(username, pass);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans text-slate-100 overflow-y-auto">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl my-auto">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Family Chat
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
            Private, encrypted family communications, real-time safety radar, and self-destructing documents.
          </p>

          {/* Privacy Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              End-to-End Encrypted
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-teal-400" />
              Live Family Radar
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Baby className="w-3 h-3 text-sky-400" />
              COPPA-Safe Kid Accounts
            </span>
          </div>
        </div>

        {/* Main Auth Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Family Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Method Switcher for Login */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod('username')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'username'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Username</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'email'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'phone'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {authMethod === 'username' && 'Family Username'}
                  {authMethod === 'email' && 'Email Address'}
                  {authMethod === 'phone' && 'Mobile Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    {authMethod === 'username' && <UserIcon className="w-4 h-4" />}
                    {authMethod === 'email' && <Mail className="w-4 h-4" />}
                    {authMethod === 'phone' && <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type={authMethod === 'email' ? 'email' : 'text'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={
                      authMethod === 'username'
                        ? 'e.g. dad, sarah, leo'
                        : authMethod === 'email'
                        ? 'e.g. mom@family.com'
                        : 'e.g. +1 (555) 000-0000'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password or Child PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98"
              >
                <span>Log In to Family Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Device Accounts Quick Picker (if accounts exist on this device) */}
              {accounts.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Accounts on this device:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickAccountLogin(acc.username, acc.password)}
                        className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left transition group"
                      >
                        <img
                          src={acc.avatarUrl}
                          alt={acc.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="truncate min-w-0">
                          <p className="text-xs font-bold text-white truncate">{acc.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">@{acc.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Who is this account for?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('parent')}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition ${
                      signupRole === 'parent'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Parent / Adult</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('teen')}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition ${
                      signupRole === 'teen'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Teen / Sibling</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('child')}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition ${
                      signupRole === 'child'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Baby className="w-4 h-4" />
                    <span>Child (COPPA)</span>
                  </button>
                </div>
                {signupRole === 'child' && (
                  <p className="text-[11px] text-sky-400 bg-sky-950/40 p-2 rounded-xl border border-sky-800/40 mt-2">
                    Child accounts do not require an email address or phone number.
                  </p>
                )}
              </div>

              {/* Name & Username Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="e.g. Sarah, Dad, Ahmad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unique Username
                  </label>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. sarah_j, dad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 3 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Optional Email & Phone (hidden if child) */}
              {signupRole !== 'child' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="mom@family.org"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Family Circle Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Family Circle Name <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={signupFamilyName}
                  onChange={(e) => setSignupFamilyName(e.target.value)}
                  placeholder="e.g. Our Family Circle 🏡, The Garcia Family"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Avatar Preset Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Family Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 transition shrink-0 ${
                        selectedAvatar === url
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98"
              >
                <span>Create Family & Start Chatting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-5">
          Family Chat is client-encrypted and local-first. Your private messages and locations never leave your family circle.
        </p>
      </div>
    </div>
  );
}
