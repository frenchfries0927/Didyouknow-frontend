import api from '../config/axios';
import { ApiResponse } from '../types';

export const knowledgeApi = {
  create: async (formData: FormData): Promise<void> => {
    try {
      console.log('API 호출: /api/posts');
      const response = await api.post<ApiResponse<void>>('/api/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
          }
      });
      console.log('지식 게시글 생성 성공:', response.data);
    } catch (error) {
      console.error('지식 게시글 생성 실패:', error);
      throw error;
    }
  },
};
