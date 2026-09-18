import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AuthMethod, User } from '../types';
import { Mail, Phone, User as UserIcon, Shield, Baby, ArrowRight, Lock, CheckCircle2, Sparkles, X } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    users,
    currentUser,
    getDisplayName,
    login,
    signup,
    accounts,
  } = useFamily();

  const [activeMethod, setActiveMethod] = useState<AuthMethod>('username');
  const [isKidRegisterMode, setIsKidRegisterMode] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [kidUsername, setKidUsername] = useState('');
  const [kidFullName, setKidFullName] = useState('');
  const [kidPassword, setKidPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your sign-in credential.');
      return;
    }

    const res = login(identifier.trim(), password);
    if (res.success) {
      setSuccessMsg('Successfully signed in!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 500);
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  const handleKidRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kidUsername.trim() || !kidFullName.trim()) {
      setErrorMsg('Please provide both the child’s name and desired username.');
      return;
    }

    const res = signup({
      username: kidUsername.trim(),
      password: kidPassword || '1234',
      fullName: kidFullName.trim(),
      role: 'child',
    });

    if (res.success) {
      setSuccessMsg(`Welcome ${kidFullName.trim()}! Kid account created without email or phone requirement.`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setIsKidRegisterMode(false);
      }, 800);
    } else {
      setErrorMsg(res.error || 'Could not register child account. Try another username.');
    }
  };

  const handleSelectAccount = (accUsername: string, accPass: string) => {
    const res = login(accUsername, accPass);
    if (res.success) {
      setSuccessMsg(`Switched account`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 400);
    } else {
      setErrorMsg(res.error || 'Could not switch to this account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-5 top-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Family Chat Multi-Auth</h2>
              <p className="text-xs text-slate-400">Private, encrypted family authentication</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Family Profile Switcher (if accounts exist) */}
          {accounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Family Accounts on Device
                </span>
                <span className="text-[11px] text-slate-500">Quick Sign In</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {accounts.map((acc) => {
                  const isCurrent = currentUser ? acc.id === currentUser.id : false;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccount(acc.username, acc.password)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition relative group ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={acc.avatarUrl}
                          alt={acc.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-xs font-semibold truncate text-white">{acc.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          @{acc.username}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest absolute">
              or sign in with credentials
            </span>
          </div>

          {/* Toggle between Standard Auth & Kid Sign Up */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setIsKidRegisterMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                !isKidRegisterMode
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsKidRegisterMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                isKidRegisterMode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              Sign Up Young Child (No Email/Phone)
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isKidRegisterMode ? (
            /* Multi-Auth Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Auth Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('email');
                    setIdentifier('sarah.j@familymail.org');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition ${
                    activeMethod === 'email'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email + Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('phone');
                    setIdentifier('+1 (555) 234-5678');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition ${
                    activeMethod === 'phone'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Phone + Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('username');
                    setIdentifier('little_leo');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition ${
                    activeMethod === 'username'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Username (Kids)</span>
                </button>
              </div>

              {/* Input field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {activeMethod === 'email' && 'Family Member Email'}
                  {activeMethod === 'phone' && 'Verified Mobile Phone'}
                  {activeMethod === 'username' && 'Child / Member Username (No email required)'}
                </label>
                <div className="relative">
                  <input
                    type={activeMethod === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeMethod === 'email'
                        ? 'e.g. sarah.j@familymail.org'
                        : activeMethod === 'phone'
                        ? '+1 (555) 000-0000'
                        : 'e.g. little_leo or ahmad_j'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password / Family Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    defaultValue="familypass123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition font-heading mt-2"
              >
                <span>Enter Family Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Kid Account Creation Form (Zero email/phone constraint) */
            <form onSubmit={handleKidRegister} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-300 font-medium">
                  🛡️ <strong>COPPA-Compliant Kid Account:</strong> Young children can join the family circle with only a unique username and family passcode — no email address or personal phone number required!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Child Full Name or First Name
                </label>
                <input
                  type="text"
                  value={kidFullName}
                  onChange={(e) => setKidFullName(e.target.value)}
                  placeholder='e.g., "Oliver Jenkins"'
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unique Kid Username
                </label>
                <input
                  type="text"
                  value={kidUsername}
                  onChange={(e) => setKidUsername(e.target.value)}
                  placeholder='e.g., "ollie_bear"'
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">This will be used to log into their tablet or phone.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition font-heading mt-2"
              >
                <Baby className="w-4 h-4" />
                <span>Create Child Account</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
