import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
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
  Languages,
  Baby,
  Search,
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
    setIsAliasModalOpen,
    setTargetAliasUserId,
    createGroup,
    tasks,
    logout,
  } = useFamily();

  const { language, toggleLanguage, t, isRTL } = useLanguage();

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

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

  const handleCreateNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    await createGroup(newGroupName.trim(), newGroupDesc.trim(), [currentUser.id]);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsNewGroupModalOpen(false);
  };

  // Filtered lists
  const query = searchFilter.trim().toLowerCase();

  const filteredGroups = groups.filter((g) => {
    if (!query) return true;
    return g.name.toLowerCase().includes(query) || (g.description && g.description.toLowerCase().includes(query));
  });

  const filteredMembers = users
    .filter((u) => u.id !== currentUser.id)
    .filter((u) => {
      if (!query) return true;
      const displayName = getDisplayName(u.id).toLowerCase();
      return (
        displayName.includes(query) ||
        u.fullName.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      );
    });

  return (
    <aside
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full h-full flex flex-col bg-white border-r border-slate-200 select-none text-slate-900"
    >
      {/* App Header Branding (Clean, Light, Classic iMessage/Telegram style) */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-base text-slate-900 tracking-tight">
                {t('appName')}
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 font-normal">{t('encryptedNotice')}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition border border-slate-200/80 flex items-center gap-1"
            title={t('changeLanguage')}
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Nicknames Tag Modal button */}
          <button
            type="button"
            onClick={() => {
              setTargetAliasUserId(null);
              setIsAliasModalOpen(true);
            }}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200/80"
            title={t('editNickname')}
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Segmented Control */}
      <div className="px-3 pt-2.5 pb-2 bg-white shrink-0">
        <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-4 gap-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chat');
              onCloseMobileDrawer?.();
            }}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'chat'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-1" />
            <span>{t('chatsTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('radar');
              onCloseMobileDrawer?.();
            }}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-medium transition relative ${
              activeTab === 'radar'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 mb-1" />
            <span>{t('radarTab')}</span>
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-blue-600" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('tasks');
              onCloseMobileDrawer?.();
            }}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-medium transition relative ${
              activeTab === 'tasks'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-1" />
            <span>{t('tasksTab')}</span>
            {pendingTasksCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
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
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'members'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 mb-1" />
            <span>{t('familyTab')}</span>
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="px-3 pb-2 bg-white shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search family chats..."
            className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-blue-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable Conversation / Contact List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Direct Family Member Chats (Exact User Request 2: Clear, simple rectangular cards with plenty of breathing space, soft grey borders, and clean circular avatar placeholders) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('directChats')}
            </span>
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 font-semibold"
            >
              + {t('addMember')}
            </button>
          </div>

          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-2">{t('noDirectChatsYet')}</p>
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                >
                  + {t('addMember')}
                </button>
              </div>
            ) : (
              filteredMembers.map((u) => {
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
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50/70 text-slate-900 border-blue-500 ring-1 ring-blue-500/25 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Clean circular avatar placeholder with online status */}
                      <div className="relative shrink-0">
                        <img
                          src={u.avatarUrl}
                          alt={displayName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                            u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="font-heading font-semibold text-sm text-slate-900 truncate">
                            {displayName}
                          </p>
                          {u.role === 'child' && (
                            <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-1.5 py-0.2 rounded-md shrink-0">
                              Kid
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {u.isOnline ? 'Online' : 'Last seen recently'} • {u.batteryLevel}% 🔋
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetAliasUserId(u.id);
                          setIsAliasModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                        title={t('editNickname')}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Family Circle Groups */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('familyCircles')}
            </span>
            <button
              type="button"
              onClick={() => setIsNewGroupModalOpen(true)}
              className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
              title={t('createCircle')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {filteredGroups.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-2">{t('noCirclesYet')}</p>
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                >
                  + {t('createCircle')}
                </button>
              </div>
            ) : (
              filteredGroups.map((g) => {
                const isSelected = activeConversationId === g.id && activeTab === 'chat';
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectConversation(g.id, true)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left group border ${
                      isSelected
                        ? 'bg-blue-50/70 text-slate-900 border-blue-500 ring-1 ring-blue-500/25 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={g.avatarUrl}
                        alt={g.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-heading font-semibold text-sm text-slate-900 truncate">
                          {g.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {g.memberIds.length} {t('membersCount')} • {t('vaultActive')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ${
                        isRTL ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Logged-In Family Profile Dock */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover border border-blue-500"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {getDisplayName(currentUser.id)}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-sans">
                @{currentUser.username} • {currentUser.batteryLevel}% 🔋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('logoutConfirm'))) {
                  logout();
                }
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition border border-slate-200"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Family Group Circle Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-heading font-bold text-slate-900 text-base">
              {t('createCircle')}
            </h3>
            <form onSubmit={handleCreateNewGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Circle Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t('groupNamePlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder={t('groupDescPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
                >
                  {t('createCircleSubmit')}
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
        groupId={activeGroupId || groups[0]?.id || ''}
      />
    </aside>
  );
}
