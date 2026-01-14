export type UserRole = 'owner' | 'member' | 'admin';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  householdId: string;
  avatar?: string;
  createdAt: string;
};

export type Device = {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  active: boolean;
  value?: number;
  room: string;
  icon: string;
  power?: number;
  lastUpdate?: string;
};

export type Camera = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  recording: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
};

export type Activity = {
  id: string;
  userId?: string;
  userName?: string;
  deviceId?: string;
  deviceName: string;
  action: string;
  timestamp: string;
  icon: string;
};

export type Session = {
  id: string;
  deviceName: string;
  location: string;
  lastActive: string;
  current: boolean;
};
