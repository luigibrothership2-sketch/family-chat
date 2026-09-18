import React, { useState, useRef } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthMethod } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import { compressImageFile } from '../lib/mediaUtils';
import {
  Shield,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
  Baby,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Radio,
  Languages,
  Camera,
} from 'lucide-react';

export function AuthScreen() {
  const { login, signup, accounts } = useFamily();
  const { language, toggleLanguage, t, isRTL } = useLanguage();

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
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  // Loading and Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleCustomPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file, 400, 0.85);
      setCustomAvatarUrl(dataUrl);
      setSelectedAvatar(dataUrl);
    } catch (err) {
      console.warn('Error reading photo:', err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username, email, or phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success) {
        setSuccessMsg('Welcome back! Opening Family Chat...');
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      const res = await signup({
        username: signupUsername,
        password: signupPassword,
        fullName: signupFullName,
        role: signupRole,
        email: signupRole === 'child' ? undefined : signupEmail,
        phone: signupRole === 'child' ? undefined : signupPhone,
        familyName: signupFamilyName.trim() || undefined,
        avatarUrl: customAvatarUrl || selectedAvatar,
      });

      if (res.success) {
        setSuccessMsg('Family account created! Welcome to Family Chat.');
      } else {
        setErrorMsg(res.error || 'Could not create account. Try another username.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Account registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccountLogin = async (username: string, pass: string) => {
    setErrorMsg('');
    setSuccessMsg('Signing in...');
    setIsLoading(true);
    try {
      const res = await login(username, pass);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to sign in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans text-slate-900 overflow-y-auto relative"
    >
      {/* Hidden custom photo uploader */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handleCustomPhotoChange}
        accept="image/*"
        className="hidden"
      />

      {/* Language Switcher Button in Header Top Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
        >
          <Languages className="w-4 h-4" />
          <span>{language === 'en' ? 'العربية (Arabic)' : 'English'}</span>
        </button>
      </div>

      <div className="relative w-full max-w-lg my-auto z-10">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-sm mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {t('appName')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            {t('appSubtitle')}
          </p>

          {/* Privacy Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-600">
            <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
              <Lock className="w-3 h-3 text-blue-600" />
              {t('encryptedNotice')}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
              <Radio className="w-3 h-3 text-sky-600" />
              {t('radarNotice')}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
              <Baby className="w-3 h-3 text-emerald-600" />
              {t('kidNotice')}
            </span>
          </div>
        </div>

        {/* Main Auth Form Container */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-heading font-semibold transition ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-heading font-semibold transition ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('createAccount')}
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Method Switcher for Login */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod('username')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'username'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t('username')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t('email')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition ${
                    authMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('phone')}</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {authMethod === 'username' && t('username')}
                  {authMethod === 'email' && t('email')}
                  {authMethod === 'phone' && t('phone')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                        ? 'e.g. dad, ahmad, sarah'
                        : authMethod === 'email'
                        ? 'e.g. mom@family.com'
                        : 'e.g. +1 555-0199'
                    }
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('passwordOrPin')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#007aff] hover:bg-blue-600 active:bg-blue-700 text-white font-heading font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <span>{isLoading ? 'Connecting...' : t('loginButton')}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Select Accounts detected on device */}
              {accounts.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t('accountsOnDevice')}
                  </p>
                  <div className="space-y-1.5">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickAccountLogin(acc.username, acc.password)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.avatarUrl}
                            alt={acc.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{acc.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">@{acc.username}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-blue-600 font-semibold">
                          Sign In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('whoIsThisFor')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('parent')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      signupRole === 'parent'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>👨‍👩‍👧 {t('parentRole')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('child')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      signupRole === 'child'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🧒 {t('childRole')} (No Email)</span>
                  </button>
                </div>

                {signupRole === 'child' && (
                  <p className="text-[11px] text-sky-700 mt-1.5 bg-sky-50 p-2 rounded-xl border border-sky-200">
                    ℹ️ {t('childAccountNotice')}
                  </p>
                )}
              </div>

              {/* Full Name & Username Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="e.g. Ahmad Jenkins"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('username')}
                  </label>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. ahmad_j"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('passwordOrPin')}
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min. 3 characters or child PIN"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </div>

              {/* Email and Phone (Optional for Child) */}
              {signupRole !== 'child' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('email')} (Optional)
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@family.com"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('phone')} (Optional)
                    </label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              )}

              {/* Family Circle Name (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('familyNameOptional')}
                </label>
                <input
                  type="text"
                  value={signupFamilyName}
                  onChange={(e) => setSignupFamilyName(e.target.value)}
                  placeholder='e.g., "The Jenkins Family"'
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Profile Avatar Selection & Custom Photo Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    {t('selectAvatar')}
                  </label>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('uploadCustomPhoto')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {customAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar(customAvatarUrl)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedAvatar === customAvatarUrl
                          ? 'border-blue-600 ring-2 ring-blue-500/30'
                          : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={customAvatarUrl}
                        alt="Custom Photo"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}

                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(url);
                        setCustomAvatarUrl(null);
                      }}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedAvatar === url && !customAvatarUrl
                          ? 'border-blue-600 ring-2 ring-blue-500/30'
                          : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#007aff] hover:bg-blue-600 active:bg-blue-700 text-white font-heading font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Account...' : t('signupButton')}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
