import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { Tag, Sparkles, X, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-slate-900">Custom Family Nickname</h3>
              <p className="text-xs text-slate-500">Replaces raw usernames across all chats & radar</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAliasModalOpen(false);
              setTargetAliasUserId(null);
            }}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Target user selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Family Member
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate text-slate-900">{u.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current alias input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Set Display Nickname for {targetUser?.fullName}
            </label>
            <div className="relative">
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="e.g. Mom ❤️, Dad, Big Brother..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              {aliasInput && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-red-500 transition"
                  title="Reset to real name"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ALIASES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAliasInput(preset)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAliasModalOpen(false);
                setTargetAliasUserId(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007aff] hover:bg-blue-600 text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <Check className="w-4 h-4" />
              Save Nickname
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
