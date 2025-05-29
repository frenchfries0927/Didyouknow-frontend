import api from '../config/axios';
import { ApiResponse, FollowUser, UserPost, UserProfile } from '../types';

export const userApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      console.log('API 호출: /api/users/me/profile');
      const response = await api.get<ApiResponse<UserProfile>>('/api/users/me/profile');
      console.log('프로필 조회 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  },

  // 내 게시물 조회
  getMyPosts: async (): Promise<UserPost[]> => {
    try {
      console.log('API 호출: /api/users/me/posts');
      const response = await api.get<ApiResponse<UserPost[]>>('/api/users/me/posts');
      console.log('게시물 조회 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('내 게시물 조회 실패:', error);
      throw error;
    }
  },

  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    try {
      console.log('API 호출: /api/users/profile', { userId });
      const response = await api.get<ApiResponse<UserProfile>>(`/api/users/${userId}/profile`);
      console.log('사용자 프로필 조회 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      throw error;
    }
  },

  // 특정 사용자 게시물 조회
  getUserPosts: async (userId: number): Promise<UserPost[]> => {
    try {
      console.log('API 호출: /api/users/posts', { userId });
      const response = await api.get<ApiResponse<UserPost[]>>(`/api/users/${userId}/posts`);
      console.log('사용자 게시물 조회 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('사용자 게시물 조회 실패:', error);
      throw error;
    }
  },

  // 게시물 상세 조회
  getPostDetail: async (postId: number): Promise<UserPost> => {
    try {
      console.log('API 호출: /api/posts/', postId);
      const response = await api.get<ApiResponse<UserPost>>(`/api/posts/${postId}`);
      console.log('게시물 상세 조회 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('게시물 상세 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 검색
  searchUsers: async (keyword: string): Promise<FollowUser[]> => {
    try {
      console.log('API 호출: /api/users/search', { keyword });
      const response = await api.get<ApiResponse<FollowUser[]>>(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
      console.log('사용자 검색 응답:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      throw error;
    }
  }
}; 