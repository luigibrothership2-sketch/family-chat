import { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AddMemberModal } from './AddMemberModal';
import {
  MessageSquare,
  Radio,
  CheckSquare,
  Users,
  Plus,
  Tag,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Settings,
  Baby,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({ onCloseMobileDrawer }: SidebarProps) {
  const {
    currentUser,
    users,
    groups,
    activeGroupId,
    setActiveGroupId,
    activeConversationId,
    setActiveConversationId,
    activeTab,
    setActiveTab,
    getDisplayName,
    setIsAuthModalOpen,
    setIsAliasModalOpen,
    setTargetAliasUserId,
    createGroup,
    tasks,
    logout,
  } = useFamily();

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  if (!currentUser) return null;

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  const handleSelectConversation = (id: string, isGroup: boolean) => {
    setActiveConversationId(id);
    if (isGroup) {
      setActiveGroupId(id);
    }
    setActiveTab('chat');
    onCloseMobileDrawer?.();
  };

  const handleCreateNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    createGroup(newGroupName.trim(), newGroupDesc.trim(), [currentUser.id]);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsNewGroupModalOpen(false);
  };

  return (
    <aside className="w-full h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none">
      {/* App Header Branding */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading font-bold text-base tracking-tight text-white">Family Chat</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Private & Encrypted Circle</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTargetAliasUserId(null);
            setIsAliasModalOpen(true);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition border border-slate-700/60"
          title="Custom Family Nicknames"
        >
          <Tag className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="p-3 border-b border-slate-800/80 grid grid-cols-4 gap-1 bg-slate-950/40">
        <button
          type="button"
          onClick={() => {
            setActiveTab('chat');
            onCloseMobileDrawer?.();
          }}
          className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition ${
            activeTab === 'chat'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-1" />
          <span>Chats</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('radar');
            onCloseMobileDrawer?.();
          }}
          className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition relative ${
            activeTab === 'radar'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4 mb-1" />
          <span>Radar</span>
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('tasks');
            onCloseMobileDrawer?.();
          }}
          className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition relative ${
            activeTab === 'tasks'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-1" />
          <span>Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-1 right-1 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('members');
            onCloseMobileDrawer?.();
          }}
          className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition ${
            activeTab === 'members'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4 mb-1" />
          <span>Family</span>
        </button>
      </div>

      {/* Scrollable Conversation / Group List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Family Circle Groups */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Family Circles
            </span>
            <button
              type="button"
              onClick={() => setIsNewGroupModalOpen(true)}
              className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
              title="Create new family group"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {groups.length === 0 ? (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2">No family circles yet</p>
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                >
                  + Create Circle
                </button>
              </div>
            ) : (
              groups.map((g) => {
                const isSelected = activeConversationId === g.id && activeTab === 'chat';
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectConversation(g.id, true)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left group ${
                      isSelected
                        ? 'bg-emerald-500/15 text-white border border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={g.avatarUrl}
                        alt={g.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-heading font-semibold text-xs md:text-sm text-white truncate">
                          {g.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {g.memberIds.length} members • Vault active
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Direct Family Member Chats */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Direct Family Chats
            </span>
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              + Add
            </button>
          </div>

          <div className="space-y-1">
            {users.filter((u) => u.id !== currentUser.id).length === 0 ? (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2">No other family members yet</p>
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                >
                  + Add Member
                </button>
              </div>
            ) : (
              users
                .filter((u) => u.id !== currentUser.id)
                .map((u) => {
                  const displayName = getDisplayName(u.id);
                  const isSelected = activeConversationId === u.id && activeTab === 'chat';
                  return (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectConversation(u.id, false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectConversation(u.id, false);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-2xl transition text-left group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 text-white border border-emerald-500/40 ring-1 ring-emerald-500/30'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={u.avatarUrl}
                            alt={displayName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                              u.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <p className="font-heading font-semibold text-xs md:text-sm text-white truncate">
                              {displayName}
                            </p>
                            {u.role === 'child' && (
                              <Baby className="w-3 h-3 text-sky-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.batteryLevel}% 🔋 • {u.location.neighborhood || 'On Radar'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetAliasUserId(u.id);
                          setIsAliasModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-emerald-400 transition"
                        title="Edit Custom Nickname"
                      >
                        <Tag className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Active Logged-In Family Profile Dock */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover border border-emerald-500/50"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {getDisplayName(currentUser.id)}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {currentUser.batteryLevel}% 🔋 • @{currentUser.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Log out of Family Chat?')) {
                  logout();
                }
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Family Group Circle Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-white text-base">Create Family Circle</h3>
            <form onSubmit={handleCreateNewGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder='e.g., "Grandparents & Kids", "Vacation Planning"'
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Private updates, schedules & safety alerts"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-heading"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        groupId={activeGroupId}
      />
    </aside>
  );
}
