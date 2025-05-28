import api from '../config/axios';
import { ApiResponse, FollowUser } from '../types';

export const followApi = {
  // 팔로우하기
  follow: async (targetUserId: number): Promise<void> => {
    try {
      console.log('API 호출: /api/follows', { targetUserId });
      const response = await api.post<ApiResponse<void>>(`/api/follows/${targetUserId}`);
      console.log('팔로우 응답:', response.data);
    } catch (error) {
      console.error('팔로우 실패:', error);
      throw error;
    }
  },

  // 언팔로우하기
  unfollow: async (targetUserId: number): Promise<void> => {
    try {
      console.log('API 호출: /api/follows', { targetUserId });
      const response = await api.delete<ApiResponse<void>>(`/api/follows/${targetUserId}`);
      console.log('언팔로우 응답:', response.data);
    } catch (error) {
      console.error('언팔로우 실패:', error);
      throw error;
    }
  },

  // 내 팔로워 목록 조회
  getMyFollowers: async (): Promise<FollowUser[]> => {
    try {
      console.log('API 호출: /api/follows/followers');
      const response = await api.get<ApiResponse<FollowUser[]>>('/api/follows/followers');
      console.log('팔로워 목록 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('팔로워 목록 조회 실패:', error);
      throw error;
    }
  },

  // 내 팔로잉 목록 조회
  getMyFollowing: async (): Promise<FollowUser[]> => {
    try {
      console.log('API 호출: /api/follows/following');
      const response = await api.get<ApiResponse<FollowUser[]>>('/api/follows/following');
      console.log('팔로잉 목록 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
      throw error;
    }
  }
}; 