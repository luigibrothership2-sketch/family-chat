import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, FamilyGroup, Message, FamilyTask, AliasMap, CallSession, TaskStatus, MediaAttachment, UserAccount } from '../types';
import { INITIAL_USERS, INITIAL_GROUPS, INITIAL_MESSAGES, INITIAL_TASKS, DEFAULT_ALIASES, AVATAR_PRESETS } from '../data/mockData';

const STORAGE_VERSION = 'family_chat_clean_v2';

// Check and clear old dummy data from prior iterations if present
function purgeOldMockStorage() {
  try {
    const version = localStorage.getItem('family_chat_storage_ver');
    const oldUser = localStorage.getItem('family_chat_current_user');
    const oldGroups = localStorage.getItem('family_chat_groups');
    const hasOldMock = oldUser === 'user-mom' || (oldGroups && oldGroups.includes('Jenkins Household'));

    if (version !== STORAGE_VERSION || hasOldMock) {
      localStorage.removeItem('family_chat_users');
      localStorage.removeItem('family_chat_current_user');
      localStorage.removeItem('family_chat_groups');
      localStorage.removeItem('family_chat_messages');
      localStorage.removeItem('family_chat_tasks');
      localStorage.removeItem('family_chat_aliases');
      localStorage.removeItem('family_chat_accounts');
      localStorage.setItem('family_chat_storage_ver', STORAGE_VERSION);
    }
  } catch (err) {
    console.error('Storage purge error:', err);
  }
}

purgeOldMockStorage();

interface FamilyContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  accounts: UserAccount[];
  aliases: AliasMap;
  updateAlias: (userId: string, alias: string) => void;
  getDisplayName: (userId: string) => string;
  getUserById: (userId: string) => User | undefined;
  groups: FamilyGroup[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  activeConversationId: string;
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
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  signup: (params: {
    username: string;
    password: string;
    fullName: string;
    role: 'parent' | 'child' | 'teen' | 'guardian';
    email?: string;
    phone?: string;
    familyName?: string;
    avatarUrl?: string;
  }) => { success: boolean; error?: string };
  registerChild: (username: string, password: string, fullName: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  pingMemberLocation: (userId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // Accounts (credentials)
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Users directory
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return [];
    }
  });

  // Current session user ID (null if not logged in)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('family_chat_current_user') || null;
  });

  const [aliases, setAliases] = useState<AliasMap>(() => {
    try {
      const saved = localStorage.getItem('family_chat_aliases');
      return saved ? JSON.parse(saved) : DEFAULT_ALIASES;
    } catch {
      return {};
    }
  });

  const [groups, setGroups] = useState<FamilyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return [];
    }
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return groups[0]?.id || '';
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return groups[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'chat' | 'radar' | 'tasks' | 'members'>('chat');

  // Messages: starts completely empty for fresh real family use
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return [];
    }
  });

  // Tasks: starts completely empty for real family use
  const [tasks, setTasks] = useState<FamilyTask[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return [];
    }
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false);
  const [targetAliasUserId, setTargetAliasUserId] = useState<string | null>(null);

  // Call session
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('family_chat_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('family_chat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('family_chat_current_user', currentUserId);
    } else {
      localStorage.removeItem('family_chat_current_user');
    }
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

  // Self-destruct interval tick: checks every 3 seconds if any self-destruct media has expired
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let hasChange = false;

      const updated = messages.map((msg) => {
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
    }, 3000);

    return () => clearInterval(timer);
  }, [messages]);

  // Keep active conversation aligned if groups change
  useEffect(() => {
    if (!activeGroupId && groups.length > 0) {
      setActiveGroupId(groups[0].id);
    }
    if (!activeConversationId && groups.length > 0) {
      setActiveConversationId(groups[0].id);
    }
  }, [groups, activeGroupId, activeConversationId]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const getUserById = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  // Custom Family Nickname resolution: replaces raw IDs/usernames everywhere
  const getDisplayName = (userId: string): string => {
    if (aliases[userId]) {
      return aliases[userId];
    }
    const user = getUserById(userId);
    return user ? user.fullName : userId;
  };

  const updateAlias = (userId: string, alias: string) => {
    setAliases((prev) => {
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

  const sendMessage = ({
    text,
    media,
    isImportant,
  }: {
    text?: string;
    media?: MediaAttachment;
    isImportant?: boolean;
  }) => {
    if (!currentUser) return;
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

    setMessages((prev) => [...prev, newMsg]);
  };

  // Recipient opens self-destruct media: exactly 1 hour countdown starts
  const openSelfDestructMedia = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.media && m.media.isSelfDestruct) {
          const now = Date.now();
          const durationMs = (m.media.selfDestructMinutes || 60) * 60 * 1000;
          return {
            ...m,
            media: {
              ...m.media,
              openedAt: m.media.openedAt || now,
              expiresAt: m.media.expiresAt || now + durationMs,
            },
          };
        }
        return m;
      })
    );
  };

  const purgeSelfDestructMedia = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
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

  const fastForwardTimer = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
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
    if (!currentUser) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          const existing = reactions[emoji] || [];
          if (existing.includes(currentUser.id)) {
            reactions[emoji] = existing.filter((id) => id !== currentUser.id);
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
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
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
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Group creation & member addition
  const createGroup = (name: string, description: string, memberIds: string[]): string => {
    if (!currentUser) return '';
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
    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroupId);
    setActiveConversationId(newGroupId);
    return newGroupId;
  };

  const addMemberBySearch = (groupId: string, query: string): { success: boolean; message: string; user?: User } => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return { success: false, message: 'Please enter a username, email, or phone number.' };

    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanQuery ||
        (u.email && u.email.toLowerCase() === cleanQuery) ||
        (u.phone && u.phone.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
        u.fullName.toLowerCase().includes(cleanQuery)
    );

    if (!found) {
      return { success: false, message: `No registered family member found matching "${query}". Ask them to sign up with this username!` };
    }

    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup) return { success: false, message: 'Family circle group not found.' };

    if (targetGroup.memberIds.includes(found.id)) {
      return { success: false, message: `${getDisplayName(found.id)} is already a member of this group.` };
    }

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, memberIds: [...g.memberIds, found.id] } : g))
    );

    return {
      success: true,
      message: `Added ${getDisplayName(found.id)} to ${targetGroup.name}!`,
      user: found,
    };
  };

  // Call actions
  const startCall = (type: 'audio' | 'video', channelName: string, participantIds: string[] = []) => {
    if (!currentUser) return;
    const defaultParticipants =
      participantIds.length > 0
        ? participantIds
        : users.filter((u) => u.id !== currentUser.id).map((u) => u.id);

    setCallSession({
      isActive: true,
      type,
      channelName: channelName || 'Family Call',
      initiatorId: currentUser.id,
      participantIds: defaultParticipants,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      startTime: Date.now(),
    });
  };

  const endCall = () => {
    setCallSession((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  const toggleMute = () => {
    setCallSession((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const toggleCamera = () => {
    setCallSession((prev) => ({
      ...prev,
      isCameraOff: !prev.isCameraOff,
    }));
  };

  const toggleScreenShare = () => {
    setCallSession((prev) => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing,
    }));
  };

  // Login: authenticate with username, email, or phone + password
  const login = (identifier: string, password?: string): { success: boolean; error?: string } => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return { success: false, error: 'Please enter your username, email, or phone number.' };

    // Check existing accounts
    const account = accounts.find((acc) => {
      const matchUsername = acc.username.toLowerCase() === clean;
      const matchEmail = acc.email && acc.email.toLowerCase() === clean;
      const matchPhone = acc.phone && acc.phone.replace(/\D/g, '') === clean.replace(/\D/g, '');
      return matchUsername || matchEmail || matchPhone;
    });

    if (!account) {
      return {
        success: false,
        error: 'No account found matching this credential. Please switch to the "Sign Up" tab to create your family account.',
      };
    }

    if (password && account.password && account.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    // Account matched! Ensure user object is present in users
    let userObj = users.find((u) => u.id === account.id);
    if (!userObj) {
      userObj = {
        id: account.id,
        username: account.username,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        avatarUrl: account.avatarUrl || AVATAR_PRESETS[0],
        role: account.role,
        batteryLevel: 85,
        isCharging: false,
        isOnline: true,
        lastSeen: 'Active now',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: 'Home Residence',
          neighborhood: 'Family Circle',
          speedText: 'Stationary',
          updatedAt: 'Active now',
        },
      };
      setUsers((prev) => [...prev, userObj!]);
    } else {
      // Mark as online
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userObj!.id ? { ...u, isOnline: true, lastSeen: 'Active now' } : u
        )
      );
    }

    setCurrentUserId(account.id);

    // Set active conversation to first group or user's group
    const targetGroup = groups.find((g) => g.memberIds.includes(account.id)) || groups[0];
    if (targetGroup) {
      setActiveGroupId(targetGroup.id);
      setActiveConversationId(targetGroup.id);
    }

    setIsAuthModalOpen(false);
    return { success: true };
  };

  // Signup: Register family member and optionally create the initial Family Group Circle
  const signup = ({
    username,
    password,
    fullName,
    role,
    email,
    phone,
    familyName,
    avatarUrl,
  }: {
    username: string;
    password: string;
    fullName: string;
    role: 'parent' | 'child' | 'teen' | 'guardian';
    email?: string;
    phone?: string;
    familyName?: string;
    avatarUrl?: string;
  }): { success: boolean; error?: string } => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) return { success: false, error: 'Username is required.' };
    if (!password || password.length < 3) return { success: false, error: 'Password must be at least 3 characters.' };
    if (!fullName.trim()) return { success: false, error: 'Full name is required.' };

    const exists = accounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: 'That username is already taken. Please choose another one.' };
    }

    const newId = `user-${cleanUsername}-${Date.now().toString(36)}`;
    const chosenAvatar =
      avatarUrl ||
      AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];

    const newAccount: UserAccount = {
      id: newId,
      username: cleanUsername,
      password,
      fullName: fullName.trim(),
      role,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      avatarUrl: chosenAvatar,
    };

    const newUser: User = {
      id: newId,
      username: cleanUsername,
      fullName: fullName.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      avatarUrl: chosenAvatar,
      role,
      batteryLevel: 92,
      isCharging: false,
      isOnline: true,
      lastSeen: 'Active now',
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: 'Home Residence',
        neighborhood: 'Family Circle',
        speedText: 'Stationary',
        updatedAt: 'Just now',
      },
    };

    // Save account & user
    setAccounts((prev) => [...prev, newAccount]);
    setUsers((prev) => [...prev, newUser]);

    // Create or join family group circle
    let groupIdToSelect = activeGroupId;
    const groupTitle = familyName?.trim() || (groups.length === 0 ? `${fullName.trim()}'s Family 🏡` : null);

    if (groupTitle) {
      const newGroupId = `group-${Date.now()}`;
      const newGroup: FamilyGroup = {
        id: newGroupId,
        name: groupTitle,
        description: 'Our private family circle for daily updates, tasks, and safety radar.',
        avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
        memberIds: [newId],
        createdById: newId,
        createdAt: Date.now(),
      };
      setGroups((prev) => [...prev, newGroup]);
      groupIdToSelect = newGroupId;
    } else if (groups.length > 0) {
      // Add member to existing first group
      setGroups((prev) =>
        prev.map((g, idx) => (idx === 0 ? { ...g, memberIds: [...g.memberIds, newId] } : g))
      );
      groupIdToSelect = groups[0].id;
    }

    setCurrentUserId(newId);
    setActiveGroupId(groupIdToSelect);
    setActiveConversationId(groupIdToSelect);
    setIsAuthModalOpen(false);

    return { success: true };
  };

  // Register Child: COPPA-safe kid account requiring ONLY username + password (no email or phone)
  const registerChild = (
    username: string,
    password: string,
    fullName: string
  ): { success: boolean; user?: User; error?: string } => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) return { success: false, error: 'Child username is required.' };
    if (!fullName.trim()) return { success: false, error: 'Child name is required.' };

    const exists = accounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: 'That username is already taken. Please choose another.' };
    }

    const childId = `user-child-${cleanUsername}-${Date.now().toString(36)}`;
    const childAvatar = 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80';

    const childAccount: UserAccount = {
      id: childId,
      username: cleanUsername,
      password: password || '1234',
      fullName: fullName.trim(),
      role: 'child',
      avatarUrl: childAvatar,
    };

    const childUser: User = {
      id: childId,
      username: cleanUsername,
      fullName: fullName.trim(),
      role: 'child',
      avatarUrl: childAvatar,
      batteryLevel: 95,
      isCharging: true,
      isOnline: true,
      lastSeen: 'Active now',
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: 'Home Residence',
        neighborhood: 'Family Circle',
        speedText: 'Stationary',
        updatedAt: 'Active now',
      },
    };

    setAccounts((prev) => [...prev, childAccount]);
    setUsers((prev) => [...prev, childUser]);

    // Add child to all current family groups
    if (groups.length > 0) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          memberIds: Array.from(new Set([...g.memberIds, childId])),
        }))
      );
    }

    return { success: true, user: childUser };
  };

  const logout = () => {
    if (currentUser) {
      // Mark as offline
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, isOnline: false, lastSeen: 'Offline' } : u))
      );
    }
    setCurrentUserId(null);
  };

  const pingMemberLocation = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
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

  return (
    <FamilyContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        accounts,
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
        login,
        signup,
        registerChild,
        logout,
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
