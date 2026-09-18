import React, { useState, useRef } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { AddMemberModal } from './AddMemberModal';
import { compressImageFile } from '../lib/mediaUtils';
import {
  Users,
  UserPlus,
  Tag,
  Baby,
  Edit2,
  Check,
  MessageSquare,
  Search,
  Camera,
  PlusCircle,
} from 'lucide-react';

export function MembersView() {
  const {
    users,
    currentUser,
    groups,
    getDisplayName,
    aliases,
    updateAlias,
    startDirectChat,
    createGroup,
    updateProfileAvatar,
  } = useFamily();

  const { t, isRTL } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editAliasInput, setEditAliasInput] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isCreatingGroupModal, setIsCreatingGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPurpose, setNewGroupPurpose] = useState('');
  const [avatarSuccessNotice, setAvatarSuccessNotice] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  // Search filter
  const query = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    return (
      u.username.toLowerCase().includes(query) ||
      u.fullName.toLowerCase().includes(query) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phone && u.phone.includes(query)) ||
      (aliases[u.id] && aliases[u.id].toLowerCase().includes(query))
    );
  });

  const handleStartEditing = (userId: string) => {
    setEditingUserId(userId);
    setEditAliasInput(aliases[userId] || '');
  };

  const handleSaveInlineAlias = (userId: string) => {
    updateAlias(userId, editAliasInput);
    setEditingUserId(null);
  };

  // Profile Avatar Upload Handler
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingAvatar(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 400, 0.85);
      await updateProfileAvatar(compressedDataUrl);
      setAvatarSuccessNotice(true);
      setTimeout(() => setAvatarSuccessNotice(false), 4000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Failed to upload avatar image. Please try a different photo.');
    } finally {
      setIsUpdatingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  // Toggle member selection for group creation
  const toggleMemberSelection = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Submit permanent group creation
  const handleCreateGroupWithSelected = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    await createGroup(
      newGroupName.trim(),
      newGroupPurpose.trim() || 'Family Circle Group',
      [currentUser.id, ...selectedMemberIds]
    );

    setNewGroupName('');
    setNewGroupPurpose('');
    setSelectedMemberIds([]);
    setIsCreatingGroupModal(false);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden select-none"
    >
      {/* Hidden file input for custom avatar upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <header className="px-4 md:px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-slate-900">
              {t('familyTab')} & {t('editNickname')}
            </h2>
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-md border border-blue-100 font-sans">
              {users.length} {t('registeredUsers')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time family directory with instant 1-on-1 private messaging and custom aliases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMemberIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCreatingGroupModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {t('createCircle')} ({selectedMemberIds.length})
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addMember')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* CURRENT USER PROFILE CARD */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Interactive Avatar with Upload Trigger */}
              <div
                role="button"
                tabIndex={0}
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    avatarInputRef.current?.click();
                  }
                }}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-xs transition group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    {getDisplayName(currentUser.id)}
                  </h3>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.2 rounded-md border border-blue-100">
                    Your Profile
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 font-sans">
                    ({currentUser.role})
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  @{currentUser.username} {currentUser.email && `• ${currentUser.email}`}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-sans font-medium">
                  <span>Battery: {currentUser.batteryLevel}% 🔋</span>
                  <span>•</span>
                  <span>GPS: {currentUser.location.address.split(',')[0]}</span>
                </p>
              </div>
            </div>

            {/* Change Profile Avatar Button */}
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <button
                type="button"
                disabled={isUpdatingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>{isUpdatingAvatar ? 'Uploading...' : t('uploadNewAvatar')}</span>
              </button>

              {avatarSuccessNotice && (
                <span className="text-[11px] text-emerald-600 font-semibold animate-in fade-in">
                  ✓ {t('avatarUpdated')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DYNAMIC SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchMembersPlaceholder')}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* DIRECTORY MEMBER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredUsers.map((member) => {
            const isMe = member.id === currentUser.id;
            const displayName = getDisplayName(member.id);
            const currentNickname = aliases[member.id];
            const isEditingThis = editingUserId === member.id;
            const isSelected = selectedMemberIds.includes(member.id);

            return (
              <div
                key={member.id}
                className={`p-4 rounded-xl border transition ${
                  isMe
                    ? 'bg-white border-slate-200 shadow-xs'
                    : isSelected
                    ? 'bg-blue-50/50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Multi-selection Checkbox */}
                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => toggleMemberSelection(member.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white hover:border-blue-500 text-transparent'
                        }`}
                        title="Select member to create family circle"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}

                    <div className="relative shrink-0">
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                          member.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-semibold text-sm md:text-base text-slate-900 truncate">
                          {displayName}
                        </h3>
                        {isMe && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.2 rounded-md">
                            You
                          </span>
                        )}
                        {member.role === 'child' && (
                          <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.2 rounded-md flex items-center gap-1 border border-sky-200">
                            <Baby className="w-3 h-3" />
                            Child
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        @{member.username} • {member.fullName}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-sans">
                        <span>{member.batteryLevel}% 🔋</span>
                        <span>•</span>
                        <span>{member.isOnline ? t('onlineNow') : t('lastSeenRecently')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Start 1-on-1 Chat */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startDirectChat(member.id)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold transition border border-blue-200 flex items-center gap-1 text-xs shadow-2xs"
                        title={t('connectChat')}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('connectChat')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Family Nickname (Local Alias) Section */}
                {!isMe && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t('editNickname')}:</span>
                      </div>
                      {!isEditingThis && (
                        <button
                          type="button"
                          onClick={() => handleStartEditing(member.id)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{currentNickname ? 'Change' : 'Assign'}</span>
                        </button>
                      )}
                    </div>

                    {isEditingThis ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={editAliasInput}
                          onChange={(e) => setEditAliasInput(e.target.value)}
                          placeholder='e.g., "Mom", "Dad", "Ahmad"'
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlineAlias(member.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('saveNickname')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        {currentNickname ? (
                          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            &quot;{currentNickname}&quot;
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No custom nickname set (shows @{member.username})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty Search Result */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">
              {t('userNotFound')} &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Ask your family member to create an account with this username, email, or phone number to connect.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-xs"
            >
              + Register or Invite Member
            </button>
          </div>
        )}
      </div>

      {/* Modal to Create Group from Selected Members */}
      {isCreatingGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-heading font-semibold text-slate-900 text-base">
              {t('createGroupTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedMemberIds.length} members will be added to this new circle.
            </p>

            <form onSubmit={handleCreateGroupWithSelected} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t('groupNamePlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={newGroupPurpose}
                  onChange={(e) => setNewGroupPurpose(e.target.value)}
                  placeholder={t('groupDescPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingGroupModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-xs"
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groupId={groups[0]?.id || ''}
      />
    </div>
  );
}
