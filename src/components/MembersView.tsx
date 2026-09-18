import { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AddMemberModal } from './AddMemberModal';
import {
  Users,
  UserPlus,
  Tag,
  Shield,
  Phone,
  Mail,
  Compass,
  BatteryMedium,
  Baby,
  Edit2,
  Check,
  MessageSquare,
  Video,
} from 'lucide-react';

export function MembersView() {
  const {
    users,
    currentUser,
    groups,
    activeGroupId,
    getDisplayName,
    aliases,
    updateAlias,
    setTargetAliasUserId,
    setIsAliasModalOpen,
    setActiveConversationId,
    setActiveTab,
    startCall,
  } = useFamily();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editAliasInput, setEditAliasInput] = useState('');

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const handleStartEditing = (userId: string) => {
    setEditingUserId(userId);
    setEditAliasInput(aliases[userId] || '');
  };

  const handleSaveInlineAlias = (userId: string) => {
    updateAlias(userId, editAliasInput);
    setEditingUserId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-white">Family Directory & Custom Nicknames</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              {users.length} Family Members
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Assign custom nicknames (e.g. &quot;My Brother Ahmad&quot;, &quot;Mom&quot;, &quot;Dad&quot;) that replace raw usernames across all chats & radar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </header>

      {/* Directory Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((member) => {
            const isMe = member.id === currentUser.id;
            const displayName = getDisplayName(member.id);
            const currentNickname = aliases[member.id];
            const isEditingThis = editingUserId === member.id;

            return (
              <div
                key={member.id}
                className={`p-5 rounded-3xl border transition-all duration-200 ${
                  isMe
                    ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 ${
                          member.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-base text-white truncate">
                          {displayName}
                        </h3>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            You
                          </span>
                        )}
                        {member.role === 'child' && (
                          <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1">
                            <Baby className="w-3 h-3" />
                            Child Account
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Account: {member.fullName} (@{member.username})
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                        <span>Battery: {member.batteryLevel}% 🔋</span>
                        <span>•</span>
                        <span>{member.location.address.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nickname Assignment Section */}
                <div className="mt-4 pt-3.5 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold flex items-center gap-1 text-slate-300">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      Local Family Nickname:
                    </span>
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={() => handleStartEditing(member.id)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{currentNickname ? 'Change Nickname' : 'Set Custom Nickname'}</span>
                      </button>
                    )}
                  </div>

                  {isEditingThis ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editAliasInput}
                        onChange={(e) => setEditAliasInput(e.target.value)}
                        placeholder='e.g. "My Brother Ahmad", "Mom"'
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineAlias(member.id)}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUserId(null)}
                        className="px-2 py-1.5 text-slate-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-emerald-300">
                        {currentNickname || '(Using default account name)'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Replaces ID {member.id}
                      </span>
                    </p>
                  )}
                </div>

                {/* Quick actions: Direct Chat & Call */}
                {!isMe && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveConversationId(member.id);
                        setActiveTab('chat');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        startCall('video', `Call with ${displayName}`, [member.id])
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groupId={activeGroupId}
      />
    </div>
  );
}
