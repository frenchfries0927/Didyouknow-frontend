import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 타입 정의
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

// 개발 환경에서는 localhost를 사용하지만, 실제 기기에서는 IP 주소가 필요할 수 있습니다.
// iOS 시뮬레이터: 'http://localhost:8080'
// 안드로이드 에뮬레이터: 'http://10.0.2.2:8080'
// 실제 기기 테스트: 로컬 네트워크 IP 주소 (예: 'http://192.168.1.100:8080')
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 요청 인터셉터 설정 (필요시 토큰 등 추가)
api.interceptors.request.use(
  async (config) => {
    // JWT 토큰이 있다면 요청 헤더에 추가
    try {
      const token = await AsyncStorage.getItem('jwt');
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
  (response) => {
    return response;
  },
  (error) => {
    // 오류 처리 (401 인증 오류 등 처리)
    if (error.response && error.response.status === 401) {
      // 로그인 페이지로 리디렉션 등의 처리
      // 로그아웃 처리 등
    }
    return Promise.reject(error);
  }
);

// 공통 API 함수들
export const feedApi = {
  // 피드 목록 조회
  getFeeds: async (): Promise<FeedItem[]> => {
    try {
      console.log('API 호출: /api/feed');
      const response = await api.get('/api/feed');
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      console.log('API 응답 데이터 구조:', Object.keys(response.data));
      
      // 응답이 배열인지 확인
      if (!Array.isArray(response.data)) {
        console.warn('API 응답이 배열이 아닙니다:', response.data);
        return []; // 빈 배열 반환
      }
      
      return response.data as FeedItem[];
    } catch (error) {
      console.error('피드 조회 실패:', error);
      // 에러 세부 정보 출력
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
      const response = await api.get(`/api/feed/${id}`);
      return response.data as FeedItem;
    } catch (error) {
      console.error(`피드 ${id} 조회 실패:`, error);
      throw error;
    }
  },
  
  // 댓글 목록 조회
  getComments: async (feedId: number): Promise<Comment[]> => {
    try {
      const response = await api.get(`/api/feed/${feedId}/comments`);
      return response.data as Comment[];
    } catch (error) {
      console.error(`피드 ${feedId}의 댓글 조회 실패:`, error);
      throw error;
    }
  },
  
  // 댓글 작성
  addComment: async (feedId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.post(`/api/feed/${feedId}/comments`, { content });
      return response.data as Comment;
    } catch (error) {
      console.error(`댓글 작성 실패:`, error);
      throw error;
    }
  },
  
  // 좋아요 토글
  toggleLike: async (feedId: number): Promise<{ success: boolean, likes: number }> => {
    try {
      const response = await api.post(`/api/feed/${feedId}/like`);
      return response.data;
    } catch (error) {
      console.error(`좋아요 토글 실패:`, error);
      throw error;
    }
  },
  
  // 퀴즈 정답 제출
  submitAnswer: async (feedId: number, optionIndex: number): Promise<{ correct: boolean, correctAnswer?: number }> => {
    try {
      const response = await api.post(`/api/feed/${feedId}/answer`, { answer: optionIndex });
      return response.data;
    } catch (error) {
      console.error(`답변 제출 실패:`, error);
      throw error;
    }
  }
};

export default api; 