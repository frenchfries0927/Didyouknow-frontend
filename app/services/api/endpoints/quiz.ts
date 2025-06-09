import api from '../config/axios';
import { ApiResponse } from '../types';

export type CreateQuizRequest = {
  question: string;
  options: string[];
  correctOption: number; // 1부터 시작
  publishDate: string;
  images: {
    uri: string;
    name: string;
    type: string;
  }[];
};

export const quizApi = {
    create: async (formData: FormData): Promise<void> => {
      try {
        console.log('API 호출: /api/quizzes');
        const response = await api.post<ApiResponse<void>>('/api/quizzes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        console.log('퀴즈 생성 응답:', response.data);
      } catch (error) {
        console.error('퀴즈 생성 실패:', error);
        throw error;
      }
    },
  };