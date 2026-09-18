export type AuthMethod = 'email' | 'phone' | 'username';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  role: 'parent' | 'child' | 'teen' | 'guardian';
  batteryLevel: number; // 0 - 100
  isCharging?: boolean;
  isOnline: boolean;
  lastSeen?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    neighborhood?: string;
    speedText?: string;
    accuracy?: number;
    updatedAt: string;
  };
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'document' | 'voice';
  title: string;
  url: string;
  fileSize: string;
  isSelfDestruct: boolean;
  selfDestructMinutes: number; // default 60 minutes
  openedAt?: number; // timestamp when opened
  expiresAt?: number; // timestamp when it should expire
  isExpired?: boolean;
  documentType?: 'id_card' | 'passport' | 'medical' | 'bill' | 'photo';
  voiceDurationSec?: number;
}

export interface Message {
  id: string;
  conversationId: string; // group ID or direct-member ID
  isGroup: boolean;
  senderId: string;
  text?: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  media?: MediaAttachment;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isImportant?: boolean;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface FamilyTask {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  assignedToId: string;
  createdById: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: 'chores' | 'errands' | 'school' | 'health' | 'event';
  createdAt: number;
  completedAt?: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  memberIds: string[];
  createdById: string;
  createdAt: number;
  emergencyNotice?: string;
}

export interface CallSession {
  isActive: boolean;
  type: 'audio' | 'video';
  channelName: string;
  groupId?: string;
  directUserId?: string;
  initiatorId: string;
  participantIds: string[];
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  startTime: number;
}

export interface AliasMap {
  [targetUserId: string]: string; // e.g. "user-2" -> "My Brother Ahmad"
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'parent' | 'child' | 'teen' | 'guardian';
  email?: string;
  phone?: string;
  avatarUrl: string;
  familyGroupId?: string;
}
