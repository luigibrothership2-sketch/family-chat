import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AuthMethod } from '../types';
import { Mail, Phone, User as UserIcon, Shield, Baby, ArrowRight, Lock, CheckCircle2, X } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your sign-in credential.');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (res.success) {
      setSuccessMsg('Successfully signed in!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 500);
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  const handleKidRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kidUsername.trim() || !kidFullName.trim()) {
      setErrorMsg('Please provide both the child’s name and desired username.');
      return;
    }

    const res = await signup({
      username: kidUsername.trim(),
      password: kidPassword || '1234',
      fullName: kidFullName.trim(),
      role: 'child',
    });

    if (res.success) {
      setSuccessMsg('Child account created successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 600);
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                {isKidRegisterMode ? 'Add Child Profile' : 'Switch Family Member'}
              </h3>
              <p className="text-xs text-slate-500">
                {isKidRegisterMode
                  ? 'Private PIN setup for kids'
                  : 'Fast switch between registered accounts'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Quick profile switch list */}
          {!isKidRegisterMode && accounts.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Accounts on this device
              </label>
              <div className="space-y-1.5">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={async () => {
                      await login(acc.username, acc.password);
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition text-left"
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
                    <span className="text-xs text-blue-600 font-semibold">Select →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              {isKidRegisterMode ? 'Already have credentials?' : 'Want to add a child?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsKidRegisterMode(!isKidRegisterMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              {isKidRegisterMode ? 'Sign In Instead' : '+ Register Child'}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {isKidRegisterMode ? (
            <form onSubmit={handleKidRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child’s Full Name
                </label>
                <input
                  type="text"
                  value={kidFullName}
                  onChange={(e) => setKidFullName(e.target.value)}
                  placeholder="e.g. Leo Jenkins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child’s Username
                </label>
                <input
                  type="text"
                  value={kidUsername}
                  onChange={(e) => setKidUsername(e.target.value)}
                  placeholder="e.g. leo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4-Digit PIN or Password
                </label>
                <input
                  type="password"
                  value={kidPassword}
                  onChange={(e) => setKidPassword(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Baby className="w-4 h-4" />
                <span>Add Child</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-3">
              {/* Method Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMethod('username')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    activeMethod === 'username'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Username
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('email')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    activeMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('phone')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    activeMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Phone
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credential
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeMethod === 'username'
                      ? 'username'
                      : activeMethod === 'email'
                      ? 'name@family.com'
                      : '+1 555 000 0000'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
