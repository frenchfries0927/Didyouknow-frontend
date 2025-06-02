import api from '../config/axios';
import { ApiResponse } from '../types';

export type CommentRequest = {
  targetType: 'post' | 'quiz';
  targetId: number;
  parentCommentId?: number;
  content: string;
};

export type CommentResponse = {
  id: number;
  content: string;
  writerNickname: string;
  authorId: number;
  createdAt: string;
  parentCommentId?: number;
  replies: CommentResponse[];
};

export const commentApi = {
  // 댓글 작성
  create: async (userId: number, request: CommentRequest): Promise<CommentResponse> => {
    const response = await api.post<ApiResponse<CommentResponse>>(
      `/api/comments?userId=${userId}`,
      request
    );
    return response.data.data;
  },

  // 댓글 목록 조회
  getByTarget: async (targetType: string, targetId: number): Promise<CommentResponse[]> => {
    const response = await api.get<ApiResponse<CommentResponse[]>>(
      `/api/comments/target?targetType=${targetType}&targetId=${targetId}`
    );
    return response.data.data;
  },

  // 댓글 삭제
  delete: async (commentId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/comments/${commentId}`);
  }
}; 