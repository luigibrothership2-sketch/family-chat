import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { Tag, Sparkles, X, Check, UserCheck, Shield } from 'lucide-react';

const SUGGESTED_ALIASES = [
  'Mom ❤️',
  'Dad 🛠️',
  'My Brother Ahmad 🎓',
  'Sister Maya ⚽',
  'Little Leo 🚀',
  'Grandma 🧶',
  'Grandpa ♟️',
  'Auntie Sarah 🌸',
  'Uncle David 🎸',
  'Big Sis ✨',
];

export function MemberAliasModal() {
  const {
    isAliasModalOpen,
    setIsAliasModalOpen,
    targetAliasUserId,
    setTargetAliasUserId,
    users,
    aliases,
    updateAlias,
    getUserById,
  } = useFamily();

  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetAliasUserId || users[0]?.id || ''
  );
  const [aliasInput, setAliasInput] = useState<string>('');

  useEffect(() => {
    if (targetAliasUserId) {
      setSelectedUserId(targetAliasUserId);
    }
  }, [targetAliasUserId]);

  useEffect(() => {
    if (selectedUserId) {
      setAliasInput(aliases[selectedUserId] || '');
    }
  }, [selectedUserId, aliases]);

  if (!isAliasModalOpen) return null;

  const targetUser = getUserById(selectedUserId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      updateAlias(selectedUserId, aliasInput);
      setIsAliasModalOpen(false);
      setTargetAliasUserId(null);
    }
  };

  const handleReset = () => {
    if (selectedUserId) {
      updateAlias(selectedUserId, '');
      setAliasInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-white">Custom Family Nickname</h3>
              <p className="text-xs text-slate-400">Replaces raw usernames across all chats & radar</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAliasModalOpen(false);
              setTargetAliasUserId(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Target user selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Family Member
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                const currentNick = aliases[u.id];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">
                        {currentNick || u.fullName.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current selected member preview card */}
          {targetUser && (
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={targetUser.avatarUrl}
                  alt={targetUser.fullName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Account:</span>
                    <span className="text-xs font-semibold text-slate-200">{targetUser.fullName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {targetUser.id} • @{targetUser.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <Shield className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          )}

          {/* Nickname input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Local Family Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder='e.g., "My Brother Ahmad", "Mom", "Dad"'
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {aliasInput && (
                <button
                  type="button"
                  onClick={() => setAliasInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              This nickname is saved privately on your device and will be shown in all conversation headers, map pins, and assigned tasks.
            </p>
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ALIASES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setAliasInput(suggestion)}
                  className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-rose-400 transition py-2 px-3"
            >
              Reset to Default Name
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAliasModalOpen(false);
                  setTargetAliasUserId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition font-heading"
              >
                <Check className="w-4 h-4" />
                Apply Nickname
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
