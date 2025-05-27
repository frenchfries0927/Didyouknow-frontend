import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 백엔드 응답 타입 정의
export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

// 기존 타입 정의들
export type FeedItem = {
  id: number;
  type: 'knowledge' | 'quiz';
  title: string;
  content: string;
  imageUrl: string;
  authorNickname: string;
  authorProfileImageUrl: string;
  createdAt: string;
  options?: string[];
  hint?: string;
  likes: number;
  comments: number;
};

export type Comment = {
  id: number;
  author: string;
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
  title: string;
  content: string;
  authorNickname: string;
  publishDate: string;
  imageUrls: string[];
};

export type FollowUser = {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  isFollowing?: boolean;
};

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@jwt');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 처리
    }
    return Promise.reject(error);
  }
);

// 공통 API 함수들
export const feedApi = {
  // 피드 목록 조회
  getFeeds: async (): Promise<FeedItem[]> => {
    try {
      const response = await api.get<ApiResponse<FeedItem[]>>('/api/feed');
      return response.data.data;
    } catch (error) {
      console.error('피드 조회 실패:', error);
      throw error;
    }
  },
  
  // 특정 피드 조회
  getFeed: async (id: number): Promise<FeedItem> => {
    try {
      const response = await api.get<ApiResponse<FeedItem>>(`/api/feed/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`피드 ${id} 조회 실패:`, error);
      throw error;
    }
  },
  
  // 댓글 목록 조회
  getComments: async (feedId: number): Promise<Comment[]> => {
    try {
      const response = await api.get<ApiResponse<Comment[]>>(`/api/feed/${feedId}/comments`);
      return response.data.data;
    } catch (error) {
      console.error(`피드 ${feedId}의 댓글 조회 실패:`, error);
      throw error;
    }
  },
  
  // 댓글 작성
  addComment: async (feedId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.post<ApiResponse<Comment>>(`/api/feed/${feedId}/comments`, { content });
      return response.data.data;
    } catch (error) {
      console.error(`댓글 작성 실패:`, error);
      throw error;
    }
  },
  
  // 좋아요 토글
  toggleLike: async (feedId: number): Promise<{ success: boolean, likes: number }> => {
    try {
      const response = await api.post<ApiResponse<{ success: boolean, likes: number }>>(`/api/feed/${feedId}/like`);
      return response.data.data;
    } catch (error) {
      console.error(`좋아요 토글 실패:`, error);
      throw error;
    }
  },
  
  // 퀴즈 정답 제출
  submitAnswer: async (feedId: number, optionIndex: number): Promise<{ correct: boolean, correctAnswer?: number }> => {
    try {
      const response = await api.post<ApiResponse<{ correct: boolean, correctAnswer?: number }>>(`/api/feed/${feedId}/answer`, { answer: optionIndex });
      return response.data.data;
    } catch (error) {
      console.error(`답변 제출 실패:`, error);
      throw error;
    }
  }
};

// 사용자 프로필 API
export const userApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<ApiResponse<UserProfile>>('/api/users/me/profile');
      return response.data.data;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  },

  // 내 게시물 조회
  getMyPosts: async (): Promise<UserPost[]> => {
    try {
      const response = await api.get<ApiResponse<UserPost[]>>('/api/users/me/posts');
      return response.data.data;
    } catch (error) {
      console.error('내 게시물 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 검색
  searchUsers: async (keyword: string): Promise<FollowUser[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.data.map((user: any) => ({
        userId: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        isFollowing: user.isFollowing
      }));
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      throw error;
    }
  },

  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    try {
      const response = await api.get<ApiResponse<UserProfile>>(`/api/users/${userId}/profile`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      throw error;
    }
  },

  // 특정 사용자 게시물 조회
  getUserPosts: async (userId: number): Promise<UserPost[]> => {
    try {
      const response = await api.get<ApiResponse<UserPost[]>>(`/api/users/${userId}/posts`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 게시물 조회 실패:', error);
      throw error;
    }
  },

  // 게시물 상세 조회
  getPostDetail: async (postId: number): Promise<UserPost> => {
    try {
      const response = await api.get<ApiResponse<UserPost>>(`/api/posts/detail/${postId}`);
      return response.data.data;
    } catch (error) {
      console.error('게시물 상세 조회 실패:', error);
      throw error;
    }
  }
};

// 팔로우 API
export const followApi = {
  // 팔로우하기
  follow: async (targetUserId: number): Promise<void> => {
    try {
      await api.post<ApiResponse<null>>(`/api/follows/${targetUserId}`);
    } catch (error) {
      console.error('팔로우 실패:', error);
      throw error;
    }
  },

  // 언팔로우하기
  unfollow: async (targetUserId: number): Promise<void> => {
    try {
      await api.delete<ApiResponse<null>>(`/api/follows/${targetUserId}`);
    } catch (error) {
      console.error('언팔로우 실패:', error);
      throw error;
    }
  },

  // 팔로우 상태 확인
  checkFollowStatus: async (targetUserId: number): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse<boolean>>(`/api/follows/check/${targetUserId}`);
      return response.data.data;
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
      throw error;
    }
  },

  // 내 팔로워 목록
  getMyFollowers: async (): Promise<FollowUser[]> => {
    try {
      const response = await api.get<ApiResponse<FollowUser[]>>('/api/follows/me/followers');
      return response.data.data;
    } catch (error) {
      console.error('팔로워 목록 조회 실패:', error);
      throw error;
    }
  },

  // 내 팔로잉 목록
  getMyFollowing: async (): Promise<FollowUser[]> => {
    try {
      const response = await api.get<ApiResponse<FollowUser[]>>('/api/follows/me/following');
      return response.data.data;
    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 사용자의 팔로워 목록
  getUserFollowers: async (userId: number): Promise<FollowUser[]> => {
    try {
      const response = await api.get<ApiResponse<FollowUser[]>>(`/api/follows/${userId}/followers`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 팔로워 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 사용자의 팔로잉 목록
  getUserFollowing: async (userId: number): Promise<FollowUser[]> => {
    try {
      const response = await api.get<ApiResponse<FollowUser[]>>(`/api/follows/${userId}/following`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 팔로잉 목록 조회 실패:', error);
      throw error;
    }
  }
};

export default api; 