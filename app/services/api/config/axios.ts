import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// 환경별 API URL 설정
const getApiBaseUrl = () => {
  if (__DEV__) {
    // 개발 환경
    return 'http://localhost:8080';
  } else {
    // 프로덕션 환경 - AWS Elastic Beanstalk URL로 변경해야 함
    return Constants.expoConfig?.extra?.apiUrl || 'https://your-aws-url.com';
  }
};

const API_BASE_URL = getApiBaseUrl();

// 커스텀 요청 타입: _retry 속성 추가
interface RetryAxiosRequestConfig {
  _retry?: boolean;
}

// 토큰 재발급 응답 타입
interface ReissueResponse {
  accessToken: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

console.log('🌐 API Base URL:', API_BASE_URL);

// 요청 인터셉터: AccessToken 자동 삽입
api.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('@jwt');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 → RefreshToken 사용해 재발급 → 재요청
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // AccessToken 만료 + 아직 재시도 안 했을 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post<ReissueResponse>(`${API_BASE_URL}/auth/reissue`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        await AsyncStorage.setItem('@jwt', newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 재요청
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔴 RefreshToken 만료 또는 재발급 실패:', refreshError);
        await AsyncStorage.multiRemove(['@jwt', '@refresh']);
        // 필요 시: router.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
