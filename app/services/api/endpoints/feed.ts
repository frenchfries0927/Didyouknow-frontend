import api from '../config/axios';
import { ApiResponse, Comment, FeedItem } from '../types';

export const feedApi = {
  // 피드 목록 조회
  getFeeds: async (): Promise<ApiResponse<FeedItem[]>> => {
    try {
      console.log('API 호출: /api/feed');
      const response = await api.get<ApiResponse<FeedItem[]>>('/api/feed');
      console.log('API 응답:', response.data);
      
      // 응답 데이터가 없거나 잘못된 형식인 경우
      if (!response.data || !response.data.data) {
        console.warn('API 응답이 올바르지 않습니다:', response.data);
        return { code: 200, message: 'success', data: [] };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('피드 조회 실패:', error);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      } else if (error.request) {
        console.error('요청 정보:', error.request);
      } else {
        console.error('오류 메시지:', error.message);
      }
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