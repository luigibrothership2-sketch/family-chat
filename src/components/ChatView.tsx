import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { Message, MediaAttachment } from '../types';
import { SelfDestructViewerModal } from './SelfDestructViewerModal';
import {
  Phone,
  Video,
  MapPin,
  Tag,
  Paperclip,
  Send,
  Mic,
  MicOff,
  Flame,
  Clock,
  Shield,
  FileText,
  Lock,
  Sparkles,
  Check,
  CheckCheck,
  Play,
  Pause,
  AlertCircle,
  Users,
} from 'lucide-react';

export function ChatView() {
  const {
    currentUser,
    activeConversationId,
    groups,
    users,
    messages,
    sendMessage,
    getDisplayName,
    getUserById,
    startCall,
    setActiveTab,
    setIsAliasModalOpen,
    setTargetAliasUserId,
    reactToMessage,
  } = useFamily();

  const [inputText, setInputText] = useState('');
  const [isSelfDestructToggled, setIsSelfDestructToggled] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [activeMediaModalMessage, setActiveMediaModalMessage] = useState<Message | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  const isGroup = !activeConversationId.startsWith('user-');
  const currentGroup = isGroup ? groups.find((g) => g.id === activeConversationId) : null;
  const directUser = !isGroup ? getUserById(activeConversationId) : null;

  // Filter messages for current active conversation
  const currentMessages = messages.filter((m) => {
    if (isGroup) {
      return m.conversationId === activeConversationId;
    }
    // Direct message between currentUser and directUser
    return (
      (m.conversationId === activeConversationId && m.senderId === currentUser.id) ||
      (m.conversationId === currentUser.id && m.senderId === activeConversationId) ||
      (m.conversationId === activeConversationId && !m.isGroup)
    );
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  // Voice recording simulation
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordSec(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordSec((prev) => prev + 1);
    }, 1000);
  };

  const cancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    clearInterval(recordingTimerRef.current);
    setRecordSec(0);
  };

  const sendVoiceNote = () => {
    setIsRecordingVoice(false);
    clearInterval(recordingTimerRef.current);
    const duration = recordSec || 4;

    const voiceMedia: MediaAttachment = {
      id: `voice-${Date.now()}`,
      type: 'voice',
      title: `Family Voice Memo (${duration}s)`,
      url: '',
      fileSize: `${(duration * 18).toFixed(0)} KB`,
      isSelfDestruct: isSelfDestructToggled,
      selfDestructMinutes: 60,
      voiceDurationSec: duration,
    };

    sendMessage({
      media: voiceMedia,
      text: isSelfDestructToggled ? '🔒 1-Hour Self-Destruct Voice Note' : undefined,
    });
    setRecordSec(0);
    setIsSelfDestructToggled(false);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage({ text: inputText.trim() });
    setInputText('');
  };

  // Send sensitive self-destruct document
  const sendSensitiveDocument = (docType: 'medical' | 'passport' | 'id_card' | 'key') => {
    let title = 'Confidential Identity Document';
    let url = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';
    let fileSize = '1.4 MB';

    if (docType === 'passport') {
      title = 'Official Passport Copy (Identity Verification)';
      url = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80';
      fileSize = '2.1 MB';
    } else if (docType === 'medical') {
      title = 'Health Insurance Policy Card';
      url = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';
      fileSize = '1.8 MB';
    } else if (docType === 'key') {
      title = 'House Smart Lock Emergency Passcode';
      url = 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80';
      fileSize = '890 KB';
    }

    const media: MediaAttachment = {
      id: `media-destruct-${Date.now()}`,
      type: 'document',
      title,
      url,
      fileSize,
      isSelfDestruct: true,
      selfDestructMinutes: 60,
      documentType: docType as any,
    };

    sendMessage({
      text: `🔒 Sent sensitive ${title} with 1-Hour Self-Destruct enabled. It will be permanently purged 1 hour after opening.`,
      media,
      isImportant: true,
    });
    setShowAttachmentMenu(false);
    setIsSelfDestructToggled(false);
  };

  const toggleVoicePlayback = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 5000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Chat Header */}
      <header className="h-16 px-4 md:px-6 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            {isGroup ? (
              <img
                src={currentGroup?.avatarUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80'}
                alt={currentGroup?.name || 'Group'}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
              />
            ) : (
              <img
                src={directUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={directUser?.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
              />
            )}
            {!isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                  directUser?.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-sm md:text-base text-white truncate">
                {isGroup
                  ? currentGroup?.name || 'Family Circle'
                  : getDisplayName(directUser?.id || '')}
              </h2>
              {!isGroup && directUser && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetAliasUserId(directUser.id);
                    setIsAliasModalOpen(true);
                  }}
                  className="text-slate-400 hover:text-emerald-400 p-1 rounded transition"
                  title="Assign Custom Family Nickname"
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 truncate flex items-center gap-2">
              {isGroup ? (
                <>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3 h-3 text-emerald-400" />
                    {currentGroup?.memberIds.length || 0} family members
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400/90 font-medium text-[11px]">End-to-End Encrypted</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-medium">
                    {directUser?.isOnline ? 'Active on Radar' : directUser?.lastSeen || 'Offline'}
                  </span>
                  {directUser && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                        {directUser.batteryLevel}% 🔋
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              startCall(
                'audio',
                isGroup ? currentGroup?.name || 'Family Voice' : `Call with ${getDisplayName(directUser?.id || '')}`,
                isGroup ? currentGroup?.memberIds : [directUser?.id || '']
              )
            }
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700/60"
            title="Start Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              startCall(
                'video',
                isGroup ? currentGroup?.name || 'Family Video' : `Video with ${getDisplayName(directUser?.id || '')}`,
                isGroup ? currentGroup?.memberIds : [directUser?.id || '']
              )
            }
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition border border-emerald-500/30"
            title="Start Video Call (WebRTC)"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700/60"
            title="View on Family Radar Map"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* WhatsApp-Style Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        {/* Encryption notice banner */}
        <div className="flex justify-center">
          <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 max-w-md shadow-sm text-center">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-slate-400">
              Messages and shared documents are end-to-end encrypted inside this family circle. Self-destruct media auto-purges 1 hour after first viewing.
            </p>
          </div>
        </div>

        {currentMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const senderDisplayName = getDisplayName(msg.senderId);
          const senderUser = getUserById(msg.senderId);
          const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group transition duration-150`}
            >
              {/* Sender Name with Custom Nickname */}
              {!isMe && (
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <span className="text-xs font-semibold text-emerald-400">
                    {senderDisplayName}
                  </span>
                  {senderUser?.role === 'child' && (
                    <span className="text-[9px] bg-sky-500/15 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                      Child
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    {senderUser?.batteryLevel ? `${senderUser.batteryLevel}% 🔋` : ''}
                  </span>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-3.5 shadow-md relative ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Media Attachment: Self-Destructing Document or Photo */}
                {msg.media && (
                  <div className="mb-2.5">
                    {msg.media.isSelfDestruct ? (
                      /* Self Destruct Card */
                      <div
                        onClick={() => setActiveMediaModalMessage(msg)}
                        className={`cursor-pointer rounded-xl p-3 border transition ${
                          msg.media.isExpired
                            ? 'bg-rose-950/40 border-rose-800/50 hover:bg-rose-950/60'
                            : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500 shadow-lg'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              msg.media.isExpired
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {msg.media.isExpired ? <Lock className="w-5 h-5" /> : <Flame className="w-5 h-5 animate-pulse" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                  msg.media.isExpired
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {msg.media.isExpired ? 'Media Expired & Masked' : '1-Hour Self-Destruct Vault'}
                              </span>
                              {!msg.media.isExpired && (
                                <span className="text-[11px] text-amber-300 font-mono font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Active
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-white mt-1 truncate">
                              {msg.media.title}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {msg.media.isExpired
                                ? 'Purged 1 hour after first open. No copy remains.'
                                : 'Tap to reveal • Exactly 1 hr countdown upon viewing'}
                            </p>
                          </div>
                        </div>

                        {!msg.media.isExpired && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                            <span>Open Encrypted Document</span>
                            <span className="text-slate-400 font-mono">{msg.media.fileSize}</span>
                          </div>
                        )}
                      </div>
                    ) : msg.media.type === 'voice' ? (
                      /* Voice Note Player */
                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-700/40">
                        <button
                          type="button"
                          onClick={() => toggleVoicePlayback(msg.id)}
                          className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition shadow"
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 h-5">
                            {[16, 24, 12, 28, 20, 32, 14, 22, 18, 26, 12, 24, 20, 16].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-200 ${
                                  playingVoiceId === msg.id
                                    ? 'bg-emerald-400 animate-pulse'
                                    : isMe
                                    ? 'bg-white/70'
                                    : 'bg-slate-400'
                                }`}
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1 font-mono">
                            <span>0:0{msg.media.voiceDurationSec || 4}</span>
                            <span>Voice Memo</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Normal Photo/Doc */
                      <div className="rounded-xl overflow-hidden border border-slate-700">
                        <img
                          src={msg.media.url}
                          alt={msg.media.title}
                          className="w-full h-auto max-h-60 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text */}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Delivery status */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isMe ? 'text-emerald-100/80' : 'text-slate-400'
                  }`}
                >
                  <span>{timeFormatted}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reactions badge */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 -mb-1">
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <button
                        key={emoji}
                        onClick={() => reactToMessage(msg.id, emoji)}
                        className={`text-xs px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          userIds.includes(currentUser.id)
                            ? 'bg-emerald-500/20 border-emerald-400 text-white'
                            : 'bg-slate-900/80 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px]">{userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Quick Reaction bar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                {['❤️', '👍', '👏', '😂', '⭐'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => reactToMessage(msg.id, emoji)}
                    className="text-xs hover:scale-125 transition p-1 rounded hover:bg-slate-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Popover */}
      {showAttachmentMenu && (
        <div className="absolute bottom-20 left-4 md:left-6 z-30 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl w-72 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Share Media / Vault Files
            </span>
            <button
              onClick={() => setShowAttachmentMenu(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={() => sendSensitiveDocument('medical')}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Health Insurance & ID Card</p>
              <p className="text-[10px] text-amber-300">Auto-destructs in 1 hour</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => sendSensitiveDocument('passport')}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Government ID / Passport</p>
              <p className="text-[10px] text-slate-400">1-Hour Privacy Auto-Purge</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => sendSensitiveDocument('key')}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">House Lock Passcode</p>
              <p className="text-[10px] text-slate-400">Auto-wipes after viewing</p>
            </div>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800">
        {/* Active 1-Hour Self Destruct indicator bar */}
        {isSelfDestructToggled && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-semibold">1-Hour Self-Destruct Mode Active:</span>
              <span className="text-amber-200/90 text-[11px]">Media will purge exactly 1 hr after opened.</span>
            </div>
            <button
              onClick={() => setIsSelfDestructToggled(false)}
              className="text-[11px] underline hover:text-white"
            >
              Turn Off
            </button>
          </div>
        )}

        <form onSubmit={handleSendText} className="flex items-center gap-2">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
            title="Attach file or secure document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Self-Destruct Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSelfDestructToggled((prev) => !prev)}
            className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition shrink-0 border ${
              isSelfDestructToggled
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-amber-400 border-slate-700 hover:border-amber-500/40'
            }`}
            title="Toggle 1-Hour Self-Destruct Mode"
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">1-Hr Purge</span>
          </button>

          {/* Text Input or Voice Recording Bar */}
          {isRecordingVoice ? (
            <div className="flex-1 bg-slate-950 border border-rose-500/40 rounded-2xl px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-400 font-mono">
                  Recording Voice Note: 0:{recordSec.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendVoiceNote}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold"
                >
                  Send Memo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isSelfDestructToggled
                    ? 'Type secure note with 1-hr purge...'
                    : `Message ${isGroup ? currentGroup?.name || 'Family' : getDisplayName(directUser?.id || '')}...`
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          )}

          {/* Mic or Send Button */}
          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition font-bold shadow-lg shadow-emerald-500/20 shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={isRecordingVoice ? sendVoiceNote : startVoiceRecording}
              className={`p-2.5 rounded-xl transition shrink-0 ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Record Voice Memo"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      {/* Modal for viewing active self-destruct media */}
      <SelfDestructViewerModal
        message={activeMediaModalMessage}
        onClose={() => setActiveMediaModalMessage(null)}
      />
    </div>
  );
}
