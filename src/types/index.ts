export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  website?: string;
  followers: string[];
  following: string[];
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalViews?: number;
  isMonetized?: boolean;
  monetizationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video')[];
  likes: string[];
  comments: Comment[];
  shares: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  hashtags: string[];
  mentions: string[];
  location?: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  likes: string[];
  replies: Comment[];
  createdAt: Date;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  viewers: string[];
  createdAt: Date;
  expiresAt: Date;
  isPublic: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  adminIds?: string[];
  lastMessage?: Message;
  updatedAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  readBy: { userId: string; readAt: Date }[];
  createdAt: Date;
  replyTo?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'story_view' | 'message';
  fromUserId: string;
  postId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MonetizationApplication {
  id: string;
  userId: string;
  followerCount: number;
  totalViews: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}