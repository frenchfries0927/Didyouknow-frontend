import api from '../config/axios';
import { ApiResponse, Comment, FeedItem } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 현재 사용자 ID 가져오기 함수
const getCurrentUserId = async (): Promise<number> => {
  try {
    const userStr = await AsyncStorage.getItem('@user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || 1;
    }
    return 1; // 기본값
  } catch (error) {
    console.error('사용자 ID 가져오기 실패:', error);
    return 1;
  }
};

export const feedApi = {
  // 피드 목록 조회 (사용자 ID 포함)
  getFeeds: async (): Promise<FeedItem[]> => {
    try {
      const userId = await getCurrentUserId();
      console.log('API 호출: /api/feed', { userId });
      const response = await api.get<ApiResponse<any[]>>(`/api/feed?userId=${userId}`);
      console.log('API 응답:', response);
      
      // 응답 데이터가 없거나 잘못된 형식인 경우
      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('API 응답이 올바르지 않습니다:', response.data);
        return [];
      }
      
      // 백엔드 응답을 FeedItem 형태로 변환
      const feedItems: FeedItem[] = response.data.data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl || '',
        authorId: item.authorId,
        author: item.author,
        profileImageUrl: item.profileImageUrl || '',
        createdAt: item.createdAt,
        options: item.options,
        likes: item.likes || 0,
        comments: item.comments || 0,
        isLiked: item.isLiked || false
      }));
      
      return feedItems;
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
  
  // 댓글 목록 조회 (백엔드 API에 맞게 수정)
  getComments: async (feedId: number, targetType: 'knowledge' | 'quiz' = 'knowledge'): Promise<Comment[]> => {
    try {
      const url = `/api/comments/target?targetType=${targetType}&targetId=${feedId}`;
      console.log('getComments - 요청 URL:', url);
      console.log('getComments - 파라미터:', { feedId, targetType });
      
      const response = await api.get<ApiResponse<Comment[]>>(url);
      
      console.log('getComments - 응답 상태:', response.status);
      console.log('getComments - 응답 헤더:', response.headers);
      console.log('getComments - 응답 데이터:', response.data);
      console.log('getComments - 댓글 배열:', response.data.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error(`피드 ${feedId}의 댓글 조회 실패:`, error);
      if (error.response) {
        console.error('에러 응답 상태:', error.response.status);
        console.error('에러 응답 데이터:', error.response.data);
      }
      throw error;
    }
  },
  
  // 댓글 작성 (백엔드 API에 맞게 수정)
  addComment: async (feedId: number, content: string, targetType: 'knowledge' | 'quiz' = 'knowledge'): Promise<Comment> => {
    try {
      const userId = await getCurrentUserId();
      const response = await api.post<ApiResponse<Comment>>(`/api/comments?userId=${userId}`, {
        targetType,
        targetId: feedId,
        content
      });
      return response.data.data;
    } catch (error) {
      console.error(`댓글 작성 실패:`, error);
      throw error;
    }
  },
  
  // 좋아요 토글 (백엔드 API에 맞게 수정)
  toggleLike: async (feedId: number, targetType: 'knowledge' | 'quiz' = 'knowledge'): Promise<{ isLiked: boolean, likeCount: number }> => {
    try {
      const userId = await getCurrentUserId();
      const response = await api.post<{ isLiked: boolean, likeCount: number }>(`/api/likes/toggle?userId=${userId}&targetType=${targetType}&targetId=${feedId}`);
      return {
        isLiked: response.data.isLiked,
        likeCount: response.data.likeCount
      };
    } catch (error) {
      console.error(`좋아요 토글 실패:`, error);
      throw error;
    }
  },
  
  // 댓글 개수 조회
  getCommentCount: async (feedId: number, targetType: 'knowledge' | 'quiz' = 'knowledge'): Promise<number> => {
    try {
      const response = await api.get<number>(`/api/comments/count?targetType=${targetType}&targetId=${feedId}`);
      return response.data;
    } catch (error) {
      console.error(`댓글 개수 조회 실패:`, error);
      return 0;
    }
  },
  
  // 퀴즈 정답 제출
  submitAnswer: async (feedId: number, optionIndex: number): Promise<{ correct: boolean, correctAnswer: number, userAnswer: number }> => {
    try {
      const response = await api.post<ApiResponse<{ correct: boolean, correctAnswer: number, userAnswer: number }>>(`/api/quizzes/${feedId}/check-answer`, { answer: optionIndex });
      return response.data.data;
    } catch (error) {
      console.error(`답변 제출 실패:`, error);
      throw error;
    }
  },

  // 게시글 공유 정보 조회
  getShareInfo: async (feedId: number): Promise<{ shareUrl: string, shareText: string, title: string, author: string }> => {
    try {
      const response = await api.get<ApiResponse<{ shareUrl: string, shareText: string, title: string, author: string }>>(`/api/posts/${feedId}/share`);
      return response.data.data;
    } catch (error) {
      console.error(`게시글 공유 정보 조회 실패:`, error);
      throw error;
    }
  },

  // 게시글 삭제
  deletePost: async (feedId: number, targetType: 'knowledge' | 'quiz'): Promise<void> => {
    try {
      const userId = await getCurrentUserId();
      await api.delete(`/api/posts/${feedId}?userId=${userId}&type=${targetType}`);
    } catch (error) {
      console.error(`게시글 ${feedId} 삭제 실패:`, error);
      throw error;
    }
  }
}; 