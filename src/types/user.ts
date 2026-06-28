export interface UserProfile {
  nickname: string;
  avatar_url: string;
  avatar_file_id: string;
  bio: string;
}

export interface User {
  _id: string;
  appleUserId: string;
  email: string | null;
  fullName: string | null;
  username: string;
  profile: UserProfile;
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