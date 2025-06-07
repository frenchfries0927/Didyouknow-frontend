export type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

export type FeedItem = {
  id: number;
  type: 'knowledge' | 'quiz';
  title: string;
  content: string;
  imageUrl: string;
  authorId: number;
  author: string;
  profileImageUrl: string;
  createdAt: string;
  options?: string[];
  hint?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
};

export type Comment = {
  id: number;
  author: string;
  authorId: number;
  profileImageUrl: string;
  content: string;
  createdAt: string;
  likes: number;
};

export type UserProfile = {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  hasBadge: boolean;
};

export type UserPost = {
  id: number;
  type?: 'knowledge' | 'quiz';
  title: string;
  content: string;
  authorNickname: string;
  publishDate: string;
  imageUrls: string[];
  likes?: number;
  comments?: number;
  isLiked?: boolean;
};

export type FollowUser = {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  isFollowing?: boolean;
}; 