import api from '../config/axios';
import { FollowUser, UserPost, UserProfile } from '../types';

export const userApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/api/users/me/profile');
      return response.data as UserProfile;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  },

  // 내 게시물 조회
  getMyPosts: async (): Promise<UserPost[]> => {
    try {
      const response = await api.get('/api/users/me/posts');
      return response.data as UserPost[];
    } catch (error) {
      console.error('내 게시물 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 검색
  searchUsers: async (keyword: string): Promise<FollowUser[]> => {
    try {
      const response = await api.get(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
      // 백엔드 응답을 프론트엔드 타입에 맞게 변환
      return response.data.map((user: any) => ({
        userId: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        isFollowing: user.isFollowing
      })) as FollowUser[];
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      throw error;
    }
  }
}; 