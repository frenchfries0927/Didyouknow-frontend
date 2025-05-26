import api from '../config/axios';
import { FollowUser } from '../types';

export const followApi = {
  // 팔로우하기
  follow: async (targetUserId: number): Promise<void> => {
    try {
      await api.post(`/api/follows/${targetUserId}`);
    } catch (error) {
      console.error('팔로우 실패:', error);
      throw error;
    }
  },

  // 언팔로우하기
  unfollow: async (targetUserId: number): Promise<void> => {
    try {
      await api.delete(`/api/follows/${targetUserId}`);
    } catch (error) {
      console.error('언팔로우 실패:', error);
      throw error;
    }
  },

  // 내 팔로워 목록 조회
  getMyFollowers: async (): Promise<FollowUser[]> => {
    try {
      const response = await api.get<FollowUser[]>('/api/follows/followers');
      return response.data;
    } catch (error) {
      console.error('팔로워 목록 조회 실패:', error);
      throw error;
    }
  },

  // 내 팔로잉 목록 조회
  getMyFollowing: async (): Promise<FollowUser[]> => {
    try {
      const response = await api.get<FollowUser[]>('/api/follows/following');
      return response.data;
    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
      throw error;
    }
  }
}; 