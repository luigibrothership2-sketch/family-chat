import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, FamilyGroup, Message, FamilyTask, AliasMap, CallSession, TaskStatus, MediaAttachment, AuthMethod } from '../types';
import { INITIAL_USERS, INITIAL_GROUPS, INITIAL_MESSAGES, INITIAL_TASKS, DEFAULT_ALIASES } from '../data/mockData';

interface FamilyContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  aliases: AliasMap;
  updateAlias: (userId: string, alias: string) => void;
  getDisplayName: (userId: string) => string;
  getUserById: (userId: string) => User | undefined;
  groups: FamilyGroup[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  activeConversationId: string; // group ID or user direct message ID
  setActiveConversationId: (id: string) => void;
  activeTab: 'chat' | 'radar' | 'tasks' | 'members';
  setActiveTab: (tab: 'chat' | 'radar' | 'tasks' | 'members') => void;
  messages: Message[];
  sendMessage: (content: { text?: string; media?: MediaAttachment; isImportant?: boolean }) => void;
  openSelfDestructMedia: (messageId: string) => void;
  purgeSelfDestructMedia: (messageId: string) => void;
  fastForwardTimer: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  tasks: FamilyTask[];
  createTask: (task: Omit<FamilyTask, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  createGroup: (name: string, description: string, memberIds: string[]) => string;
  addMemberBySearch: (groupId: string, query: string) => { success: boolean; message: string; user?: User };
  callSession: CallSession;
  startCall: (type: 'audio' | 'video', channelName: string, participantIds?: string[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAliasModalOpen: boolean;
  setIsAliasModalOpen: (open: boolean) => void;
  targetAliasUserId: string | null;
  setTargetAliasUserId: (id: string | null) => void;
  loginUser: (identifier: string, method: AuthMethod, fullName?: string) => boolean;
  registerChild: (username: string, fullName: string) => User;
  pingMemberLocation: (userId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // Load stored state or fall back to defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('family_chat_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('family_chat_current_user') || 'user-mom';
  });

  const [aliases, setAliases] = useState<AliasMap>(() => {
    const saved = localStorage.getItem('family_chat_aliases');
    return saved ? JSON.parse(saved) : DEFAULT_ALIASES;
  });

  const [groups, setGroups] = useState<FamilyGroup[]>(() => {
    const saved = localStorage.getItem('family_chat_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [activeGroupId, setActiveGroupId] = useState<string>('group-jenkins');
  const [activeConversationId, setActiveConversationId] = useState<string>('group-jenkins');
  const [activeTab, setActiveTab] = useState<'chat' | 'radar' | 'tasks' | 'members'>('chat');

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('family_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [tasks, setTasks] = useState<FamilyTask[]>(() => {
    const saved = localStorage.getItem('family_chat_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false);
  const [targetAliasUserId, setTargetAliasUserId] = useState<string | null>(null);

  // Call session state
  const [callSession, setCallSession] = useState<CallSession>({
    isActive: false,
    type: 'video',
    channelName: '',
    initiatorId: '',
    participantIds: [],
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    startTime: 0,
  });

  // Persist items
  useEffect(() => {
    localStorage.setItem('family_chat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('family_chat_current_user', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('family_chat_aliases', JSON.stringify(aliases));
  }, [aliases]);

  useEffect(() => {
    localStorage.setItem('family_chat_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('family_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('family_chat_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Self-destruct interval tick: checks every 5 seconds if any self-destruct media has expired
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let hasChange = false;

      const updated = messages.map(msg => {
        if (msg.media && msg.media.isSelfDestruct && !msg.media.isExpired) {
          if (msg.media.expiresAt && now >= msg.media.expiresAt) {
            hasChange = true;
            return {
              ...msg,
              media: {
                ...msg.media,
                isExpired: true,
                url: '', // masked/purged
              },
            };
          }
        }
        return msg;
      });

      if (hasChange) {
        setMessages(updated);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [messages]);

  const currentUser = useMemo(() => {
    const found = users.find(u => u.id === currentUserId);
    return found || users[0];
  }, [users, currentUserId]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };

  // Custom Family Nickname resolution: automatically replaces raw user IDs / full names across all screens
  const getDisplayName = (userId: string): string => {
    if (aliases[userId]) {
      return aliases[userId];
    }
    const user = getUserById(userId);
    return user ? user.fullName : userId;
  };

  const updateAlias = (userId: string, alias: string) => {
    setAliases(prev => {
      const trimmed = alias.trim();
      const updated = { ...prev };
      if (trimmed) {
        updated[userId] = trimmed;
      } else {
        delete updated[userId];
      }
      return updated;
    });
  };

  const sendMessage = ({ text, media, isImportant }: { text?: string; media?: MediaAttachment; isImportant?: boolean }) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: activeConversationId,
      isGroup: !activeConversationId.startsWith('user-'),
      senderId: currentUser.id,
      text: text?.trim(),
      timestamp: Date.now(),
      status: 'delivered',
      media,
      isImportant,
      reactions: {},
    };

    setMessages(prev => [...prev, newMsg]);

    // Optional simulated playful reply from brother or mom if user sends a message
    if (activeConversationId === 'group-jenkins' && text) {
      const lower = text.toLowerCase();
      let replyText = '';
      let replierId = '';

      if (lower.includes('dinner') || lower.includes('food') || lower.includes('eat')) {
        replierId = currentUser.id === 'user-mom' ? 'user-dad' : 'user-mom';
        replyText = 'Making homemade pasta tonight with fresh basil from the garden! 🍝';
      } else if (lower.includes('homework') || lower.includes('test') || lower.includes('grade')) {
        replierId = currentUser.id === 'user-ahmad' ? 'user-mom' : 'user-ahmad';
        replyText = 'Good luck on the study session! Let me know if you need help with the equations.';
      } else if (lower.includes('radar') || lower.includes('where')) {
        replierId = currentUser.id === 'user-maya' ? 'user-ahmad' : 'user-maya';
        replyText = 'Check the Family Radar tab — our real-time GPS coordinates and battery levels are updated live!';
      }

      if (replyText && replierId) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `msg-reply-${Date.now()}`,
              conversationId: 'group-jenkins',
              isGroup: true,
              senderId: replierId,
              text: replyText,
              timestamp: Date.now(),
              status: 'delivered',
            },
          ]);
        }, 1500);
      }
    }
  };

  // Recipient opens self-destruct media: exactly 1 hour countdown starts
  const openSelfDestructMedia = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && m.media && m.media.isSelfDestruct) {
          const now = Date.now();
          const durationMs = (m.media.selfDestructMinutes || 60) * 60 * 1000;
          return {
            ...m,
            media: {
              ...m.media,
              openedAt: m.media.openedAt || now,
              expiresAt: m.media.expiresAt || (now + durationMs),
            },
          };
        }
        return m;
      })
    );
  };

  // Immediate purge of self destruct media
  const purgeSelfDestructMedia = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && m.media) {
          return {
            ...m,
            media: {
              ...m.media,
              isExpired: true,
              url: '',
            },
          };
        }
        return m;
      })
    );
  };

  // Helper for testing/demo: Fast forward remaining time to test 1-hour expiration
  const fastForwardTimer = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && m.media) {
          return {
            ...m,
            media: {
              ...m.media,
              openedAt: Date.now() - 3600000,
              expiresAt: Date.now() - 1000,
              isExpired: true,
              url: '',
            },
          };
        }
        return m;
      })
    );
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          const existing = reactions[emoji] || [];
          if (existing.includes(currentUser.id)) {
            reactions[emoji] = existing.filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...existing, currentUser.id];
          }
          return { ...m, reactions };
        }
        return m;
      })
    );
  };

  // Shared Family Tasks
  const createTask = (taskData: Omit<FamilyTask, 'id' | 'createdAt'>) => {
    const newTask: FamilyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt: status === 'completed' ? Date.now() : undefined,
            }
          : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Group creation & member addition
  const createGroup = (name: string, description: string, memberIds: string[]): string => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: FamilyGroup = {
      id: newGroupId,
      name,
      description,
      avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
      memberIds: Array.from(new Set([currentUser.id, ...memberIds])),
      createdById: currentUser.id,
      createdAt: Date.now(),
    };
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupId(newGroupId);
    setActiveConversationId(newGroupId);
    return newGroupId;
  };

  const addMemberBySearch = (groupId: string, query: string): { success: boolean; message: string; user?: User } => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return { success: false, message: 'Please enter a username, email, or phone number.' };

    const found = users.find(
      u =>
        u.username.toLowerCase() === cleanQuery ||
        (u.email && u.email.toLowerCase() === cleanQuery) ||
        (u.phone && u.phone.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
        u.fullName.toLowerCase().includes(cleanQuery)
    );

    if (!found) {
      return { success: false, message: `No family member found matching "${query}". Check spelling or invite them.` };
    }

    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return { success: false, message: 'Family circle group not found.' };

    if (targetGroup.memberIds.includes(found.id)) {
      return { success: false, message: `${getDisplayName(found.id)} is already a member of this group.` };
    }

    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, memberIds: [...g.memberIds, found.id] } : g))
    );

    return {
      success: true,
      message: `Added ${getDisplayName(found.id)} to ${targetGroup.name}!`,
      user: found,
    };
  };

  // Call actions
  const startCall = (type: 'audio' | 'video', channelName: string, participantIds: string[] = []) => {
    const defaultParticipants =
      participantIds.length > 0
        ? participantIds
        : users.filter(u => u.id !== currentUser.id).map(u => u.id);

    setCallSession({
      isActive: true,
      type,
      channelName: channelName || 'Family Conference Call',
      initiatorId: currentUser.id,
      participantIds: defaultParticipants,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      startTime: Date.now(),
    });
  };

  const endCall = () => {
    setCallSession(prev => ({
      ...prev,
      isActive: false,
    }));
  };

  const toggleMute = () => {
    setCallSession(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const toggleCamera = () => {
    setCallSession(prev => ({
      ...prev,
      isCameraOff: !prev.isCameraOff,
    }));
  };

  const toggleScreenShare = () => {
    setCallSession(prev => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing,
    }));
  };

  // Multi-Auth signin
  const loginUser = (identifier: string, method: AuthMethod, fullName?: string): boolean => {
    const clean = identifier.trim().toLowerCase();
    let found = users.find(u => {
      if (method === 'email' && u.email) return u.email.toLowerCase() === clean;
      if (method === 'phone' && u.phone) return u.phone.replace(/\D/g, '') === clean.replace(/\D/g, '');
      if (method === 'username') return u.username.toLowerCase() === clean;
      return false;
    });

    if (!found && fullName) {
      // Auto-register new family account
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: method === 'username' ? clean : clean.split('@')[0],
        fullName,
        email: method === 'email' ? clean : undefined,
        phone: method === 'phone' ? clean : undefined,
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: method === 'username' && !clean.includes('@') ? 'child' : 'parent',
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        isCharging: false,
        isOnline: true,
        lastSeen: 'Active now',
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.02,
          lng: -122.4194 + (Math.random() - 0.5) * 0.02,
          address: 'Home Residence, California',
          neighborhood: 'Family District',
          speedText: 'Stationary',
          updatedAt: 'Just now',
        },
      };
      setUsers(prev => [...prev, newUser]);
      found = newUser;
    }

    if (found) {
      setCurrentUserId(found.id);
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  // Kid account sign up (no email or phone required!)
  const registerChild = (username: string, fullName: string): User => {
    const newChild: User = {
      id: `user-${username.toLowerCase().replace(/\s+/g, '_')}-${Date.now().toString(36)}`,
      username: username.toLowerCase().replace(/\s+/g, '_'),
      fullName,
      role: 'child',
      avatarUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
      batteryLevel: 88,
      isCharging: false,
      isOnline: true,
      lastSeen: 'Active now',
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: 'Home - Family Room',
        neighborhood: 'Sunset District',
        speedText: 'Stationary (At Home)',
        updatedAt: 'Just now',
      },
    };

    setUsers(prev => [...prev, newChild]);
    // Automatically add to main family group
    setGroups(prev =>
      prev.map(g => (g.id === 'group-jenkins' ? { ...g, memberIds: [...g.memberIds, newChild.id] } : g))
    );
    setCurrentUserId(newChild.id);
    setIsAuthModalOpen(false);
    return newChild;
  };

  const pingMemberLocation = (userId: string) => {
    // Simulates an instant GPS location refresh
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            isOnline: true,
            lastSeen: 'Active now',
            location: {
              ...u.location,
              updatedAt: 'Updated just now (GPS ping response)',
            },
          };
        }
        return u;
      })
    );
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
  };

  return (
    <FamilyContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        aliases,
        updateAlias,
        getDisplayName,
        getUserById,
        groups,
        activeGroupId,
        setActiveGroupId,
        activeConversationId,
        setActiveConversationId,
        activeTab,
        setActiveTab,
        messages,
        sendMessage,
        openSelfDestructMedia,
        purgeSelfDestructMedia,
        fastForwardTimer,
        reactToMessage,
        tasks,
        createTask,
        updateTaskStatus,
        deleteTask,
        createGroup,
        addMemberBySearch,
        callSession,
        startCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAliasModalOpen,
        setIsAliasModalOpen,
        targetAliasUserId,
        setTargetAliasUserId,
        loginUser,
        registerChild,
        pingMemberLocation,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
