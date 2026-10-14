export type CommunityFeedTab = 'for_you' | 'following' | 'repair_help';

export type UserRole =
  | 'user'
  | 'repair_pro'
  | 'recycler'
  | 'business'
  | 'moderator'
  | 'admin';

export interface AuthorProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  roleLabel: string;
  isVerified: boolean;
  avatarInitials: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: AuthorProfile;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface CommunityPost {
  id: string;
  author: AuthorProfile;
  content: string;
  createdAt: string;
  feedType: CommunityFeedTab;
  tags: string[];
  deviceModel?: string;
  hasRepairBroadcast: boolean;
  repairSpecialistsNotifiedCount?: number;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: CommunityComment[];
}
