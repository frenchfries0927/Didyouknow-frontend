// app/(tabs)/index.tsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type FeedItem = {
  id: number;
  type: 'knowledge' | 'quiz';
  title: string;
  content: string;
  imageUrl: string | null;
  authorNickname: string;
  authorProfileImageUrl: string;
  createdAt: string;
};

// 개발 환경에서 사용할 API 기본 URL
const API_BASE_URL = 'http://localhost:8080';  // 로컬 개발 환경용

export default function FeedPage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 한 번만 실행
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('API 요청 시작...');
      const response = await axios.get<FeedItem[]>(`${API_BASE_URL}/api/feed`, {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('데이터 수신 성공:', response.status);
      setFeeds(response.data);
      console.log('피드 데이터 로드 성공:', response.data);
    } catch (err) {
      // 오류 처리 향상
      // TypeScript 오류 수정: axios.isAxiosError 대신 instanceof 사용
      if (err && typeof err === 'object' && 'response' in err) {
        // Axios 오류로 추정
        const axiosError = err as { 
          response?: { 
            status?: number; 
            data?: any; 
          }; 
          message?: string;
        };
        
        const errorMessage = axiosError.response 
          ? `상태 코드: ${axiosError.response.status}, 메시지: ${JSON.stringify(axiosError.response.data)}`
          : `네트워크 오류: ${axiosError.message}`;
        
        setError(errorMessage);
        console.error('피드 불러오기 실패:', err);
        console.error('오류 상세 정보:', errorMessage);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
        console.error('알 수 없는 오류:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 오류가 있을 경우 재시도 버튼 표시
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>데이터를 불러오는데 실패했습니다.</Text>
      <Text style={styles.errorDetail}>{error}</Text>
      <Text 
        style={styles.retryButton}
        onPress={fetchFeeds}>
        다시 시도
      </Text>
    </View>
  );

  // 로딩 중일 때 로딩 인디케이터 표시
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 10 }}>데이터를 불러오는 중...</Text>
    </View>
  );

  // 피드 항목 렌더링
  const renderFeedItems = () => (
    <>
      {feeds.length > 0 ? (
        feeds.map(feed => (
          <View key={feed.id} style={styles.card}>
            <Text style={styles.type}>{feed.type === 'quiz' ? '🧠 퀴즈' : '📚 상식'}</Text>
            <Text style={styles.title}>{feed.title}</Text>
            {feed.imageUrl && (
              <Image source={{ uri: feed.imageUrl }} style={styles.image} />
            )}
            <Text>{feed.content}</Text>
            <View style={styles.authorRow}>
              <Image 
                source={{ uri: feed.authorProfileImageUrl }} 
                style={styles.avatar}
                onError={() => console.log(`프로필 이미지 로드 실패: ${feed.authorProfileImageUrl}`)}
              />
              <Text>{feed.authorNickname}</Text>
            </View>
            <Text style={styles.date}>
              {new Date(feed.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>표시할 피드가 없습니다.</Text>
      )}
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📢 오늘의 피드</Text>
      
      {loading ? renderLoadingState() : 
       error ? renderErrorState() : 
       renderFeedItems()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    flex: 1
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  heading: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1
  },
  type: { 
    fontSize: 14, 
    color: '#555' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 8 
  },
  image: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  authorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    marginRight: 8 
  },
  date: { 
    fontSize: 12, 
    color: '#888', 
    marginTop: 4 
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8
  },
  errorDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center'
  },
  retryButton: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20
  }
});