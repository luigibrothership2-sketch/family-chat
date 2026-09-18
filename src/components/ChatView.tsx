import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { Message, MediaAttachment } from '../types';
import { SelfDestructViewerModal } from './SelfDestructViewerModal';
import { compressImageFile, readFileAsDataUrl, downloadFileFromUrl, formatBytes } from '../lib/mediaUtils';
import {
  Phone,
  Video,
  MapPin,
  Tag,
  Paperclip,
  Send,
  Mic,
  Flame,
  Shield,
  FileText,
  Lock,
  CheckCheck,
  Play,
  Pause,
  Download,
  Image as ImageIcon,
  FileUp,
} from 'lucide-react';

export function ChatView() {
  const {
    currentUser,
    activeConversationId,
    groups,
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

  const { t, isRTL } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isSelfDestructToggled, setIsSelfDestructToggled] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [activeMediaModalMessage, setActiveMediaModalMessage] = useState<Message | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  if (!currentUser) return null;

  const isGroup = !activeConversationId.startsWith('user-');
  const currentGroup = isGroup ? groups.find((g) => g.id === activeConversationId) : null;
  const directUser = !isGroup ? getUserById(activeConversationId) : null;

  // Filter messages for current active conversation
  const currentMessages = messages.filter((m) => {
    if (isGroup) {
      return m.conversationId === activeConversationId;
    }
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

  const sendVoiceNote = async () => {
    setIsRecordingVoice(false);
    clearInterval(recordingTimerRef.current);
    const duration = recordSec || 4;

    const voiceMedia: MediaAttachment = {
      id: `voice-${Date.now()}`,
      type: 'voice',
      title: `Voice Memo (${duration}s)`,
      url: '',
      fileSize: `${(duration * 16).toFixed(0)} KB`,
      isSelfDestruct: isSelfDestructToggled,
      selfDestructMinutes: 60,
      voiceDurationSec: duration,
    };

    await sendMessage({
      media: voiceMedia,
      text: isSelfDestructToggled ? '🔒 1-Hour Self-Destruct Voice Note' : undefined,
    });
    setRecordSec(0);
    setIsSelfDestructToggled(false);
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage({ text: textToSend });
  };

  // Real file & image upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowAttachmentMenu(false);

    try {
      const isImage = file.type.startsWith('image/');
      let fileDataUrl: string;

      if (isImage) {
        fileDataUrl = await compressImageFile(file, 1200, 0.8);
      } else {
        fileDataUrl = await readFileAsDataUrl(file);
      }

      const mediaAttachment: MediaAttachment = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: isImage ? 'image' : 'document',
        title: file.name,
        url: fileDataUrl,
        fileSize: formatBytes(file.size),
        isSelfDestruct: isSelfDestructToggled,
        selfDestructMinutes: 60,
      };

      await sendMessage({
        text: isSelfDestructToggled
          ? `🔒 ${isImage ? 'Photo' : 'Document'} (1-Hour Self-Destruct active)`
          : undefined,
        media: mediaAttachment,
        isImportant: isSelfDestructToggled,
      });

      setIsSelfDestructToggled(false);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process file. Please try a smaller image or document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative select-none"
    >
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Classic Chat Header (Clean & Bright iPad / iMessage / Telegram Style) */}
      <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            {isGroup ? (
              <img
                src={currentGroup?.avatarUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80'}
                alt={currentGroup?.name || 'Group'}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <img
                src={directUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={directUser?.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            )}
            {!isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  directUser?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-sm md:text-base text-slate-900 truncate">
                {isGroup
                  ? currentGroup?.name || t('familyCircles')
                  : getDisplayName(directUser?.id || '')}
              </h2>
              {!isGroup && directUser && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetAliasUserId(directUser.id);
                    setIsAliasModalOpen(true);
                  }}
                  className="text-slate-400 hover:text-blue-600 p-1 rounded transition"
                  title={t('editNickname')}
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 font-sans">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isGroup
                ? `${currentGroup?.memberIds.length || 1} ${t('membersCount')} • ${t('vaultActive')}`
                : directUser?.isOnline
                ? `${t('onlineNow')} • ${directUser.batteryLevel}% 🔋`
                : `${t('lastSeenRecently')} • ${directUser?.batteryLevel || 80}% 🔋`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold border border-slate-200/80"
            title={t('radarTab')}
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">{t('radarTab')}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              startCall(
                'audio',
                isGroup ? currentGroup?.name || 'Family Voice' : getDisplayName(directUser?.id || ''),
                isGroup ? currentGroup?.memberIds : directUser ? [directUser.id] : []
              )
            }
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200/80"
            title={t('audioCall')}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              startCall(
                'video',
                isGroup ? currentGroup?.name || 'Family Video' : getDisplayName(directUser?.id || ''),
                isGroup ? currentGroup?.memberIds : directUser ? [directUser.id] : []
              )
            }
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200/80"
            title={t('videoCall')}
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area with Clean Soft Texture */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 chat-pattern-bg">
        {/* Simple End-to-End Encrypted Pill */}
        <div className="flex justify-center">
          <div className="bg-white/90 border border-slate-200 rounded-full px-3.5 py-1 flex items-center gap-2 text-[11px] text-slate-500 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('encryptedNotice')}</span>
          </div>
        </div>

        {/* Empty chat placeholder if no messages yet */}
        {currentMessages.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white/80 rounded-2xl border border-slate-200 max-w-md mx-auto my-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-slate-900 text-base mb-1">
              {t('startFamilyConvo')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {t('chatHistoryClean')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => sendMessage({ text: t('sayHello') })}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 transition"
              >
                👋 {t('sayHello')}
              </button>
              <button
                type="button"
                onClick={() => sendMessage({ text: t('checkIn') })}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 transition"
              >
                📍 {t('checkIn')}
              </button>
            </div>
          </div>
        )}

        {/* Messages List: Classic Blue Outgoing Bubbles & Soft White/Grey Incoming Bubbles */}
        {currentMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const sender = getUserById(msg.senderId);
          const senderDisplayName = getDisplayName(msg.senderId);
          const hasMedia = !!msg.media;
          const isSelfDestruct = msg.media?.isSelfDestruct;
          const isExpired = isSelfDestruct && (msg.media?.isExpired || !msg.media?.url);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              {/* Sender Name in group chats */}
              {isGroup && !isMe && (
                <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1.5">
                  <span>{senderDisplayName}</span>
                  {sender?.role === 'child' && (
                    <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded-md font-sans">
                      Child
                    </span>
                  )}
                </span>
              )}

              {/* Message Bubble:
                  - Outgoing: Solid, vibrant classic blue bubble (like iPad/iMessage/Telegram) with crisp white text.
                  - Incoming: Soft white/grey text bubble with dark text. */}
              <div
                className={`max-w-[85%] md:max-w-lg p-3.5 relative transition shadow-2xs ${
                  isMe
                    ? `bg-[#007aff] text-white border border-[#006fe6] ${
                        isRTL ? 'rounded-2xl rounded-tl-xs' : 'rounded-2xl rounded-tr-xs'
                      }`
                    : `bg-white text-slate-900 border border-slate-200/90 ${
                        isRTL ? 'rounded-2xl rounded-tr-xs' : 'rounded-2xl rounded-tl-xs'
                      }`
                } ${msg.isImportant ? 'ring-2 ring-amber-400' : ''}`}
              >
                {/* 1-Hour Self-Destruct Tag */}
                {isSelfDestruct && (
                  <div
                    className={`mb-2 pb-1.5 border-b flex items-center justify-between gap-2 text-[11px] font-sans ${
                      isMe
                        ? 'border-white/20 text-amber-200'
                        : 'border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>1-Hour Self-Destruct</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md ${
                        isMe
                          ? 'bg-blue-900/40 text-amber-100'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isExpired ? t('autoPurged') : t('hoursRemaining')}
                    </span>
                  </div>
                )}

                {/* Message Text */}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap select-text font-normal">
                    {msg.text}
                  </p>
                )}

                {/* Media Attachment View */}
                {hasMedia && (
                  <div className="mt-2">
                    {/* Voice Memo */}
                    {msg.media!.type === 'voice' && (
                      <div
                        className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                          isMe
                            ? 'bg-blue-700/50 border-white/20'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleVoicePlayback(msg.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                            isMe
                              ? 'bg-white text-blue-600 hover:bg-slate-100'
                              : 'bg-[#007aff] text-white hover:bg-blue-600'
                          }`}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 h-4">
                            {[40, 70, 30, 90, 60, 80, 45, 100, 65, 85, 30, 70, 50, 90].map(
                              (height, idx) => (
                                <span
                                  key={idx}
                                  className={`w-1 rounded-full ${
                                    playingVoiceId === msg.id && idx % 2 === 0
                                      ? isMe
                                        ? 'bg-white'
                                        : 'bg-blue-600'
                                      : isMe
                                      ? 'bg-white/40'
                                      : 'bg-slate-300'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              )
                            )}
                          </div>
                          <div
                            className={`flex justify-between text-[10px] mt-1 font-sans ${
                              isMe ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            <span>{msg.media!.title}</span>
                            <span>{msg.media!.fileSize}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expired Media Banner */}
                    {isExpired && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700">
                            {t('mediaExpiredText')}
                          </p>
                          <p className="text-[10px] text-red-500 mt-0.5">
                            Permanently purged from cloud storage after 1 hour.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Active Document Attachment */}
                    {!isExpired && msg.media!.type === 'document' && (
                      <div
                        className={`rounded-xl overflow-hidden border p-2.5 ${
                          isMe
                            ? 'bg-blue-700/50 border-white/20'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isMe
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p
                                className={`text-xs font-medium truncate ${
                                  isMe ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {msg.media!.title}
                              </p>
                              <p
                                className={`text-[10px] ${
                                  isMe ? 'text-blue-100' : 'text-slate-500'
                                }`}
                              >
                                {msg.media!.fileSize}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelfDestruct ? (
                              <button
                                type="button"
                                onClick={() => setActiveMediaModalMessage(msg)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center gap-1 transition shadow-xs"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>{t('viewVaultDoc')}</span>
                              </button>
                            ) : (
                              msg.media!.url && (
                                <button
                                  type="button"
                                  onClick={() => downloadFileFromUrl(msg.media!.url, msg.media!.title)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                                    isMe
                                      ? 'bg-white text-blue-600 hover:bg-slate-100'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                  title={t('downloadFile')}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>{t('downloadFile')}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Image Attachment */}
                    {!isExpired && msg.media!.type === 'image' && (
                      <div className="rounded-xl overflow-hidden border border-slate-200/40 relative">
                        {isSelfDestruct ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveMediaModalMessage(msg)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setActiveMediaModalMessage(msg);
                            }}
                            className="relative cursor-pointer"
                          >
                            <img
                              src={msg.media!.url}
                              alt={msg.media!.title}
                              className="w-full max-h-72 object-cover filter blur-md transition hover:blur-none"
                            />
                            <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-4 text-center">
                              <Lock className="w-7 h-7 text-amber-300 mb-1" />
                              <span className="text-xs font-semibold text-white mb-0.5">
                                {t('confidentialView')}
                              </span>
                              <span className="text-[10px] text-amber-200">
                                1-Hour Auto-Purge Vault
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={msg.media!.url}
                              alt={msg.media!.title}
                              className="w-full max-h-80 object-cover rounded-xl"
                            />
                            <div className="absolute top-2 right-2">
                              <button
                                type="button"
                                onClick={() => downloadFileFromUrl(msg.media!.url, msg.media!.title)}
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition flex items-center gap-1 text-xs font-medium backdrop-blur-xs"
                                title={t('downloadFile')}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('downloadFile')}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp & Delivery Indicator */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    isMe ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-100" />}
                </div>
              </div>

              {/* Emoji Reactions */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => reactToMessage(msg.id, emoji)}
                      className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs flex items-center gap-1 hover:bg-slate-50 transition shadow-2xs"
                    >
                      <span>{emoji}</span>
                      <span className="text-[10px] text-slate-500 font-sans font-semibold">
                        {userIds.length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Uploading Notification */}
      {isUploading && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs text-slate-800">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span>Uploading file...</span>
        </div>
      )}

      {/* Modern Minimalist Inputs (Exact User Request 4: The text input field at the bottom must be a clean, solid white bar stretching across the chat screen with a simple blue action button next to it) */}
      <footer className="p-3 sm:p-4 bg-[#f8fafc] border-t border-slate-200 shrink-0 relative">
        {/* Attachment Options Drawer */}
        {showAttachmentMenu && (
          <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 w-64 z-30 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition border border-slate-200/80"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{t('attachPhoto')}</p>
                <p className="text-[10px] text-slate-500">Photo or camera roll</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'application/pdf,.doc,.docx,.txt,.csv';
                  fileInputRef.current.click();
                }
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition border border-slate-200/80"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <FileUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{t('attachDoc')}</p>
                <p className="text-[10px] text-slate-500">PDF or document file</p>
              </div>
            </button>
          </div>
        )}

        {/* 1-Hour Self-Destruct Active Banner */}
        {isSelfDestructToggled && (
          <div className="max-w-4xl mx-auto mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2 font-medium">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>{t('selfDestructHint')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSelfDestructToggled(false)}
              className="text-amber-700 hover:text-amber-900 text-xs font-semibold underline"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Input Controls Container */}
        <form onSubmit={handleSendText} className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Attachment Toggle */}
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border border-slate-200 shadow-2xs shrink-0"
            title="Attach file or photo"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Self-Destruct Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSelfDestructToggled(!isSelfDestructToggled)}
            className={`p-2.5 rounded-full transition border shadow-2xs shrink-0 flex items-center gap-1.5 ${
              isSelfDestructToggled
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white hover:bg-slate-100 text-slate-400 hover:text-amber-600 border-slate-200'
            }`}
            title={t('selfDestructToggle')}
          >
            <Flame className="w-5 h-5" />
            <span className="hidden lg:inline text-xs font-semibold">1-Hr</span>
          </button>

          {/* The clean, solid white bar stretching across the chat screen */}
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between bg-white border border-red-200 rounded-full px-4 py-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-600 font-medium">
                  {t('recordingVoice')}: {recordSec}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendVoiceNote}
                  className="px-3 py-1 rounded-full bg-[#007aff] text-white text-xs font-semibold hover:bg-blue-600"
                >
                  {t('send')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative flex items-center bg-white border border-slate-200/90 rounded-full px-4 py-2 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isSelfDestructToggled ? t('selfDestructToggle') + '...' : t('typeMessage')}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none pr-8"
              />
              <button
                type="button"
                onClick={startVoiceRecording}
                className="absolute right-3 text-slate-400 hover:text-blue-600 p-1 transition"
                title={t('recordingVoice')}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Simple Blue Action Button next to it */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-[#007aff] hover:bg-blue-600 active:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#007aff] text-white transition font-medium shadow-xs shrink-0 flex items-center justify-center"
            title={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>

      {/* Self-Destruct Viewer Modal */}
      {activeMediaModalMessage && (
        <SelfDestructViewerModal
          message={activeMediaModalMessage}
          onClose={() => setActiveMediaModalMessage(null)}
        />
      )}
    </div>
  );
}
