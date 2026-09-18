import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from '../lib/firebase';
import {
  User,
  FamilyGroup,
  Message,
  FamilyTask,
  AliasMap,
  CallSession,
  TaskStatus,
  MediaAttachment,
  UserAccount,
} from '../types';
import { AVATAR_PRESETS } from '../data/mockData';

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
  sendMessage: (content: { text?: string; media?: MediaAttachment; isImportant?: boolean }) => Promise<void>;
  openSelfDestructMedia: (messageId: string) => void;
  purgeSelfDestructMedia: (messageId: string) => void;
  fastForwardTimer: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  tasks: FamilyTask[];
  createTask: (task: Omit<FamilyTask, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  createGroup: (name: string, description: string, memberIds: string[]) => Promise<string>;
  addMemberBySearch: (groupId: string, query: string) => Promise<{ success: boolean; message: string; user?: User }>;
  startDirectChat: (targetUserId: string) => void;
  updateProfileAvatar: (newAvatarUrl: string) => Promise<void>;
  isGpsActive: boolean;
  enableGpsRadar: () => void;
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
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    username: string;
    password: string;
    fullName: string;
    role: 'parent' | 'child' | 'teen' | 'guardian';
    email?: string;
    phone?: string;
    familyName?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  registerChild: (username: string, password: string, fullName: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  pingMemberLocation: (userId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // Local cached state for immediate responsiveness
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('family_chat_current_user') || null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [groups, setGroups] = useState<FamilyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_groups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState<FamilyTask[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aliases, setAliases] = useState<AliasMap>(() => {
    try {
      const saved = localStorage.getItem('family_chat_aliases');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('family_chat_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'radar' | 'tasks' | 'members'>('chat');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAliasModalOpen, setIsAliasModalOpen] = useState<boolean>(false);
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

  // Ensure Firebase Auth is initialized on startup
  useEffect(() => {
    ensureFirebaseAuth().catch((err) => console.warn('Firebase auth check:', err));
  }, []);

  // 1. Real-Time Firestore Sync: USERS
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const remoteUsers: User[] = [];
          const remoteAccounts: UserAccount[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as User & { password?: string };
            const u: User = {
              id: docSnap.id,
              username: data.username || docSnap.id,
              fullName: data.fullName || 'Family Member',
              email: data.email,
              phone: data.phone,
              avatarUrl: data.avatarUrl || AVATAR_PRESETS[0],
              role: data.role || 'parent',
              batteryLevel: typeof data.batteryLevel === 'number' ? data.batteryLevel : 90,
              isCharging: data.isCharging ?? false,
              isOnline: data.isOnline ?? false,
              lastSeen: data.lastSeen || 'Recently active',
              location: data.location || {
                lat: 37.7749,
                lng: -122.4194,
                address: 'Home',
                neighborhood: 'Family Area',
                updatedAt: 'Just now',
              },
            };
            remoteUsers.push(u);

            remoteAccounts.push({
              id: docSnap.id,
              username: data.username || docSnap.id,
              password: data.password || '1234',
              fullName: data.fullName || 'Family Member',
              role: data.role || 'parent',
              email: data.email,
              phone: data.phone,
              avatarUrl: data.avatarUrl || AVATAR_PRESETS[0],
            });
          });

          setUsers(remoteUsers);
          setAccounts(remoteAccounts);
          localStorage.setItem('family_chat_users', JSON.stringify(remoteUsers));
          localStorage.setItem('family_chat_accounts', JSON.stringify(remoteAccounts));
        },
        (error) => {
          console.warn('Firestore users listener fallback to local:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Could not bind users listener:', e);
    }
  }, []);

  // 2. Real-Time Firestore Sync: GROUPS
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'groups'),
        (snapshot) => {
          const remoteGroups: FamilyGroup[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as FamilyGroup;
            remoteGroups.push({
              id: docSnap.id,
              name: data.name || 'Family Circle',
              description: data.description || '',
              avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
              memberIds: data.memberIds || [],
              createdById: data.createdById || '',
              createdAt: data.createdAt || Date.now(),
              emergencyNotice: data.emergencyNotice,
            });
          });

          // Sort by creation date
          remoteGroups.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          setGroups(remoteGroups);
          localStorage.setItem('family_chat_groups', JSON.stringify(remoteGroups));
        },
        (error) => {
          console.warn('Firestore groups listener note:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Could not bind groups listener:', e);
    }
  }, []);

  // 3. Real-Time Firestore Sync: MESSAGES
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'messages'),
        (snapshot) => {
          const remoteMessages: Message[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Message;
            remoteMessages.push({
              id: docSnap.id,
              conversationId: data.conversationId,
              isGroup: data.isGroup ?? false,
              senderId: data.senderId,
              text: data.text,
              timestamp: data.timestamp || Date.now(),
              status: data.status || 'delivered',
              media: data.media,
              reactions: data.reactions || {},
              isImportant: data.isImportant ?? false,
            });
          });

          // Sort chronologically ascending
          remoteMessages.sort((a, b) => a.timestamp - b.timestamp);

          setMessages(remoteMessages);
          localStorage.setItem('family_chat_messages', JSON.stringify(remoteMessages));
        },
        (error) => {
          console.warn('Firestore messages listener note:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Could not bind messages listener:', e);
    }
  }, []);

  // 4. Real-Time Firestore Sync: TASKS
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'tasks'),
        (snapshot) => {
          const remoteTasks: FamilyTask[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as FamilyTask;
            remoteTasks.push({
              id: docSnap.id,
              groupId: data.groupId || '',
              title: data.title || '',
              description: data.description,
              assignedToId: data.assignedToId || '',
              createdById: data.createdById || '',
              status: data.status || 'pending',
              priority: data.priority || 'medium',
              dueDate: data.dueDate || '',
              category: data.category || 'chores',
              createdAt: data.createdAt || Date.now(),
              completedAt: data.completedAt,
            });
          });

          remoteTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setTasks(remoteTasks);
          localStorage.setItem('family_chat_tasks', JSON.stringify(remoteTasks));
        },
        (error) => {
          console.warn('Firestore tasks listener note:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Could not bind tasks listener:', e);
    }
  }, []);

  // 5. Real-Time Firestore Sync: NICKNAMES
  useEffect(() => {
    if (!currentUserId) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'nicknames'),
        (snapshot) => {
          const newAliases: AliasMap = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as { ownerId: string; targetId: string; alias: string };
            if (data.ownerId === currentUserId && data.targetId && data.alias) {
              newAliases[data.targetId] = data.alias;
            }
          });
          setAliases(newAliases);
          localStorage.setItem('family_chat_aliases', JSON.stringify(newAliases));
        },
        (error) => {
          console.warn('Firestore nicknames listener note:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Could not bind nicknames listener:', e);
    }
  }, [currentUserId]);

  // Ensure current user is tracked
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('family_chat_current_user', currentUserId);
    } else {
      localStorage.removeItem('family_chat_current_user');
    }
  }, [currentUserId]);

  // Set default active conversation if none selected
  useEffect(() => {
    if (!activeConversationId && groups.length > 0) {
      setActiveGroupId(groups[0].id);
      setActiveConversationId(groups[0].id);
    }
  }, [groups, activeConversationId]);

  // 1-Hour Self-Destruct Periodic Auto-Purge:
  // Verifies every 2 seconds. When 1 hour has elapsed, permanently deletes media from Firestore!
  useEffect(() => {
    const checkExpiry = async () => {
      const now = Date.now();
      for (const msg of messages) {
        if (msg.media && msg.media.isSelfDestruct && !msg.media.isExpired) {
          if (msg.media.expiresAt && now >= msg.media.expiresAt) {
            // Permanently purge from Firestore
            try {
              const msgRef = doc(db, 'messages', msg.id);
              await updateDoc(msgRef, {
                'media.url': '',
                'media.isExpired': true,
                'media.destroyedAt': now,
              });
            } catch (err) {
              console.warn('Error purging self destruct media in Firestore:', err);
              // Fallback local purge
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msg.id && m.media
                    ? { ...m, media: { ...m.media, url: '', isExpired: true } }
                    : m
                )
              );
            }
          }
        }
      }
    };

    const interval = setInterval(checkExpiry, 2000);
    return () => clearInterval(interval);
  }, [messages]);

  // GENUINE LIVE GPS TRACKING RADAR STREAMING
  const enableGpsRadar = useCallback(() => {
    if (!currentUserId || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    setIsGpsActive(true);

    // Initial position
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        try {
          const userRef = doc(db, 'users', currentUserId);
          await updateDoc(userRef, {
            location: {
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy || 10),
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              neighborhood: 'Live GPS Broadcast',
              speedText: speed ? `${Math.round(speed * 3.6)} km/h` : 'Live',
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            isOnline: true,
            lastSeen: 'Active now',
          });
        } catch (e) {
          console.warn('Could not update initial GPS in Firestore:', e);
        }
      },
      (err) => {
        console.warn('Geolocation initial prompt notice:', err.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  }, [currentUserId]);

  // Active continuous GPS & Battery streaming while logged in
  useEffect(() => {
    if (!currentUserId) {
      setIsGpsActive(false);
      return;
    }

    let watchId: number | null = null;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          setIsGpsActive(true);
          const { latitude, longitude, accuracy, speed } = pos.coords;
          try {
            const userRef = doc(db, 'users', currentUserId);
            await updateDoc(userRef, {
              location: {
                lat: latitude,
                lng: longitude,
                accuracy: Math.round(accuracy || 10),
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                neighborhood: 'Live GPS Broadcast',
                speedText: speed ? `${Math.round(speed * 3.6)} km/h` : 'Live',
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              isOnline: true,
            });
          } catch (e) {
            console.warn('Error streaming GPS position to Firestore:', e);
          }
        },
        (err) => {
          console.warn('GPS watchPosition notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 15000 }
      );
    }

    // Battery streaming
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          const syncBattery = async () => {
            const level = Math.round(battery.level * 100);
            const isCharging = Boolean(battery.charging);
            try {
              const userRef = doc(db, 'users', currentUserId);
              await updateDoc(userRef, {
                batteryLevel: level,
                isCharging: isCharging,
              });
            } catch (e) {
              console.warn('Battery sync error:', e);
            }
          };

          syncBattery();
          battery.addEventListener('levelchange', syncBattery);
          battery.addEventListener('chargingchange', syncBattery);
        })
        .catch((e: any) => console.warn('Battery API notice:', e));
    }

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [currentUserId]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const getUserById = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  const getDisplayName = (userId: string): string => {
    if (aliases[userId]) {
      return aliases[userId];
    }
    const user = getUserById(userId);
    return user ? user.fullName : userId;
  };

  const updateAlias = async (userId: string, alias: string) => {
    if (!currentUserId) return;
    const trimmed = alias.trim();
    const aliasDocId = `${currentUserId}_${userId}`;

    try {
      const aliasRef = doc(db, 'nicknames', aliasDocId);
      if (trimmed) {
        await setDoc(aliasRef, {
          ownerId: currentUserId,
          targetId: userId,
          alias: trimmed,
          updatedAt: Date.now(),
        });
      } else {
        await deleteDoc(aliasRef);
      }
    } catch (err) {
      console.warn('Nickname Firestore sync error:', err);
    }

    setAliases((prev) => {
      const updated = { ...prev };
      if (trimmed) {
        updated[userId] = trimmed;
      } else {
        delete updated[userId];
      }
      return updated;
    });
  };

  // SEND MESSAGE: Inserts into Firestore `messages` collection
  const sendMessage = async ({
    text,
    media,
    isImportant,
  }: {
    text?: string;
    media?: MediaAttachment;
    isImportant?: boolean;
  }) => {
    if (!currentUser) return;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const conversationId = activeConversationId || activeGroupId;

    const newMsg: Message = {
      id: msgId,
      conversationId: conversationId,
      isGroup: !conversationId.startsWith('user-'),
      senderId: currentUser.id,
      text: text?.trim(),
      timestamp: Date.now(),
      status: 'delivered',
      media: media || undefined,
      isImportant: Boolean(isImportant),
      reactions: {},
    };

    // Optimistic local add
    setMessages((prev) => [...prev, newMsg]);

    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);
    } catch (err) {
      console.warn('Error sending message to Firestore:', err);
    }
  };

  // RECIPIENT OPENS SELF-DESTRUCT MEDIA: Initiates the 1-hour countdown in Firestore
  const openSelfDestructMedia = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || !msg.media || !msg.media.isSelfDestruct || msg.media.openedAt) {
      return;
    }

    const now = Date.now();
    const durationMs = (msg.media.selfDestructMinutes || 60) * 60 * 1000;
    const expiresAt = now + durationMs;

    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        'media.openedAt': now,
        'media.expiresAt': expiresAt,
      });
    } catch (err) {
      console.warn('Error updating openedAt in Firestore:', err);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.media
          ? {
              ...m,
              media: {
                ...m.media,
                openedAt: now,
                expiresAt: expiresAt,
              },
            }
          : m
      )
    );
  };

  // PURGE SELF-DESTRUCT MEDIA: Permanently removes the media payload from the cloud database
  const purgeSelfDestructMedia = async (messageId: string) => {
    const now = Date.now();
    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        'media.url': '',
        'media.isExpired': true,
        'media.destroyedAt': now,
      });
    } catch (err) {
      console.warn('Error purging media from Firestore:', err);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.media
          ? {
              ...m,
              media: {
                ...m.media,
                url: '',
                isExpired: true,
                destroyedAt: now,
              },
            }
          : m
      )
    );
  };

  // FAST FORWARD 1-HOUR (TESTING HELPER)
  const fastForwardTimer = async (messageId: string) => {
    const expiredTime = Date.now() - 1000;
    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        'media.openedAt': Date.now() - 3600000,
        'media.expiresAt': expiredTime,
        'media.isExpired': true,
        'media.url': '',
      });
    } catch (err) {
      console.warn('Fast forward Firestore error:', err);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.media
          ? {
              ...m,
              media: {
                ...m.media,
                openedAt: Date.now() - 3600000,
                expiresAt: expiredTime,
                isExpired: true,
                url: '',
              },
            }
          : m
      )
    );
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const reactions = { ...(msg.reactions || {}) };
    const existing = reactions[emoji] || [];
    let updatedList: string[];

    if (existing.includes(currentUser.id)) {
      updatedList = existing.filter((id) => id !== currentUser.id);
      if (updatedList.length === 0) {
        delete reactions[emoji];
      } else {
        reactions[emoji] = updatedList;
      }
    } else {
      updatedList = [...existing, currentUser.id];
      reactions[emoji] = updatedList;
    }

    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, { reactions });
    } catch (err) {
      console.warn('Reaction update error:', err);
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
    );
  };

  // SHARED TASKS
  const createTask = async (taskData: Omit<FamilyTask, 'id' | 'createdAt'>) => {
    const taskId = `task-${Date.now()}`;
    const newTask: FamilyTask = {
      ...taskData,
      id: taskId,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      await setDoc(doc(db, 'tasks', taskId), newTask);
    } catch (err) {
      console.warn('Error creating task in Firestore:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const completedAt = status === 'completed' ? Date.now() : undefined;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status, completedAt } : t
      )
    );

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status,
        ...(completedAt ? { completedAt } : {}),
      });
    } catch (err) {
      console.warn('Error updating task in Firestore:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      console.warn('Error deleting task from Firestore:', err);
    }
  };

  // CREATE PERMANENT FAMILY GROUP / CIRCLE
  const createGroup = async (name: string, description: string, memberIds: string[]): Promise<string> => {
    if (!currentUser) return '';
    const newGroupId = `group-${Date.now()}`;
    const allMembers = Array.from(new Set([currentUser.id, ...memberIds]));

    const newGroup: FamilyGroup = {
      id: newGroupId,
      name: name.trim(),
      description: description.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
      memberIds: allMembers,
      createdById: currentUser.id,
      createdAt: Date.now(),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newGroupId);
    setActiveConversationId(newGroupId);

    try {
      await setDoc(doc(db, 'groups', newGroupId), newGroup);
    } catch (err) {
      console.warn('Error saving group to Firestore:', err);
    }

    return newGroupId;
  };

  // ADD MEMBER BY SEARCH
  const addMemberBySearch = async (
    groupId: string,
    query: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
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

    const updatedMembers = [...targetGroup.memberIds, found.id];

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, memberIds: updatedMembers } : g))
    );

    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, { memberIds: updatedMembers });
    } catch (err) {
      console.warn('Error updating group members in Firestore:', err);
    }

    return {
      success: true,
      message: `Added ${getDisplayName(found.id)} to ${targetGroup.name}!`,
      user: found,
    };
  };

  // START 1-ON-1 DIRECT CHAT
  const startDirectChat = (targetUserId: string) => {
    setActiveConversationId(targetUserId);
    setActiveTab('chat');
  };

  // PROFILE AVATAR CUSTOMIZATION
  const updateProfileAvatar = async (newAvatarUrl: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { avatarUrl: newAvatarUrl });
    } catch (err) {
      console.warn('Error updating avatar in Firestore:', err);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, avatarUrl: newAvatarUrl } : u))
    );
  };

  // CALL ACTIONS
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
    setCallSession((prev) => ({ ...prev, isActive: false }));
  };

  const toggleMute = () => {
    setCallSession((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCamera = () => {
    setCallSession((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  };

  const toggleScreenShare = () => {
    setCallSession((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  };

  // LOGIN: authenticates with username, email, or phone + password
  const login = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return { success: false, error: 'Please enter your username, email, or phone number.' };

    await ensureFirebaseAuth();

    // Check users loaded from Firestore or local cache
    const matchedAccount = accounts.find((acc) => {
      const matchUsername = acc.username.toLowerCase() === clean;
      const matchEmail = acc.email && acc.email.toLowerCase() === clean;
      const matchPhone = acc.phone && acc.phone.replace(/\D/g, '') === clean.replace(/\D/g, '');
      return matchUsername || matchEmail || matchPhone;
    });

    if (!matchedAccount) {
      return {
        success: false,
        error: 'No registered family member found matching this credential. Please sign up to create your account.',
      };
    }

    if (password && matchedAccount.password && matchedAccount.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    setCurrentUserId(matchedAccount.id);

    // Update online status in Firestore
    try {
      const userRef = doc(db, 'users', matchedAccount.id);
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: 'Active now',
      });
    } catch (e) {
      console.warn('Could not update user online status in Firestore:', e);
    }

    // Set active conversation
    const targetGroup = groups.find((g) => g.memberIds.includes(matchedAccount.id)) || groups[0];
    if (targetGroup) {
      setActiveGroupId(targetGroup.id);
      setActiveConversationId(targetGroup.id);
    }

    setIsAuthModalOpen(false);
    return { success: true };
  };

  // SIGNUP: Register family member and save to Firestore
  const signup = async ({
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
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) return { success: false, error: 'Username is required.' };
    if (!password || password.length < 3) return { success: false, error: 'Password must be at least 3 characters.' };
    if (!fullName.trim()) return { success: false, error: 'Full name is required.' };

    await ensureFirebaseAuth();

    const exists = accounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: 'That username is already taken. Please choose another one.' };
    }

    const newId = `user-${cleanUsername}-${Date.now().toString(36)}`;
    const chosenAvatar = avatarUrl || AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];

    const newUserData = {
      id: newId,
      username: cleanUsername,
      password,
      fullName: fullName.trim(),
      role,
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      avatarUrl: chosenAvatar,
      batteryLevel: 95,
      isCharging: false,
      isOnline: true,
      lastSeen: 'Active now',
      location: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.02,
        lng: -122.4194 + (Math.random() - 0.5) * 0.02,
        address: 'Home Residence',
        neighborhood: 'Family Circle',
        speedText: 'Stationary',
        accuracy: 12,
        updatedAt: 'Just now',
      },
      createdAt: Date.now(),
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newId), newUserData);
    } catch (err) {
      console.warn('Error creating user in Firestore (saved locally):', err);
    }

    // If family name was provided, create initial group in Firestore
    if (familyName && familyName.trim()) {
      const initialGroupId = `group-${Date.now()}`;
      const initialGroup: FamilyGroup = {
        id: initialGroupId,
        name: familyName.trim(),
        description: 'Our primary family circle',
        avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
        memberIds: [newId],
        createdById: newId,
        createdAt: Date.now(),
      };

      try {
        await setDoc(doc(db, 'groups', initialGroupId), initialGroup);
      } catch (err) {
        console.warn('Error creating initial family group in Firestore:', err);
      }

      setGroups((prev) => [initialGroup, ...prev]);
      setActiveGroupId(initialGroupId);
      setActiveConversationId(initialGroupId);
    }

    const newUserObj: User = {
      id: newId,
      username: cleanUsername,
      fullName: fullName.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      avatarUrl: chosenAvatar,
      role,
      batteryLevel: 95,
      isCharging: false,
      isOnline: true,
      lastSeen: 'Active now',
      location: newUserData.location,
    };

    const newAccountObj: UserAccount = {
      id: newId,
      username: cleanUsername,
      password,
      fullName: fullName.trim(),
      role,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      avatarUrl: chosenAvatar,
    };

    setUsers((prev) => [...prev, newUserObj]);
    setAccounts((prev) => [...prev, newAccountObj]);
    setCurrentUserId(newId);
    setIsAuthModalOpen(false);

    // Trigger GPS streaming immediately upon account creation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateDoc(doc(db, 'users', newId), {
            'location.lat': pos.coords.latitude,
            'location.lng': pos.coords.longitude,
            'location.accuracy': Math.round(pos.coords.accuracy || 10),
            'location.updatedAt': 'Just now',
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }

    return { success: true };
  };

  // COPPA-safe register child (username + password, no email/phone)
  const registerChild = async (
    username: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    const res = await signup({
      username,
      password,
      fullName,
      role: 'child',
    });

    if (res.success) {
      const created = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      return { success: true, user: created };
    }

    return { success: false, error: res.error };
  };

  const logout = () => {
    if (currentUserId) {
      try {
        const userRef = doc(db, 'users', currentUserId);
        updateDoc(userRef, { isOnline: false, lastSeen: 'Inactive' }).catch(() => {});
      } catch (e) {
        console.warn('Logout status update notice:', e);
      }
    }
    setCurrentUserId(null);
    setIsGpsActive(false);
  };

  const pingMemberLocation = (userId: string) => {
    const target = getUserById(userId);
    if (!target) return;
    // Broadcast message or alert
    if (currentUser) {
      sendMessage({
        text: `📍 Radar Location Ping requested for ${getDisplayName(userId)}`,
        isImportant: true,
      });
    }
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
        startDirectChat,
        updateProfileAvatar,
        isGpsActive,
        enableGpsRadar,
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
