import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { UserPlus, Search, X, Check, ShieldAlert } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function AddMemberModal({ isOpen, onClose, groupId }: AddMemberModalProps) {
  const { addMemberBySearch, groups, users, getDisplayName } = useFamily();
  const [query, setQuery] = useState('');
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const activeGroup = groups.find((g) => g.id === groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResultMsg(null);

    const res = addMemberBySearch(groupId, query);
    if (res.success) {
      setResultMsg({ type: 'success', text: res.message });
      setQuery('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setResultMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-white">Add Family Member</h3>
              <p className="text-xs text-slate-400">To {activeGroup?.name || 'Family Circle'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Search by Username, Email, or Phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. ahmad_j, sarah.j@familymail.org, or +15552345678"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Quick list of available family members not yet in this group */}
          <div>
            <span className="text-xs text-slate-400 font-medium mb-1.5 block">Quick add from registered family:</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {users.map((u) => {
                const inGroup = activeGroup?.memberIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={inGroup}
                    onClick={() => setQuery(u.username)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                      inGroup
                        ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{getDisplayName(u.id)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">(@{u.username})</span>
                    {inGroup && <Check className="w-3 h-3 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {resultMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition font-heading"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
