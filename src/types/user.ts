import { TargetAudience, TaskScene } from './task';

export interface UserProfile {
  nickname: string;
  avatar_url: string;
  avatar_file_id: string;
  bio: string;
}

export interface UserPreference {
  identity?: TargetAudience;
  targetScene?: TaskScene;
  coreDesire?: '成就感' | '平静下来' | '连接他人' | '找点乐子';
  isOnboarded: boolean;
}

export interface User {
  _id: string;
  appleUserId: string;
  email: string | null;
  fullName: string | null;
  username: string;
  profile: UserProfile;
  preference?: UserPreference;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface AppleLoginPayload {
  userId: string;
  email?: string | null;
  fullName?: string | null;
}