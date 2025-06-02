import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FeedCard from '../components/FeedCard';
import CommentModal from '../components/CommentModal';
import { feedApi } from '../services/api/endpoints/feed';
import { FeedItem } from '../services/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '../utils/auth';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const { signOut } = useGoogleAuth();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedFeedType, setSelectedFeedType] = useState<'post' | 'quiz'>('post');
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: number, nickname: string} | null>(null);

  // 앱 시작 시 사용자 ID 설정
  useEffect(() => {
    initializeUserId();
  }, []);

  const initializeUserId = async () => {
    try {
      // 실제 로그인된 사용자 정보를 가져오기
      const userStr = await AsyncStorage.getItem('@user');
      console.log('AsyncStorage에서 가져온 @user:', userStr);
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('파싱된 user 객체:', user);
          
          if (user && user.id) {
            setCurrentUserId(user.id);
            setCurrentUser({ id: user.id, nickname: user.nickname || 'User' });
            console.log(`로그인된 사용자 ID 사용: ${user.id}, 닉네임: ${user.nickname}`);
            return;
          }
        } catch (parseError) {
          console.error('User 객체 파싱 실패:', parseError);
        }
      }
      
      // 로그인된 사용자가 없으면 로그인 화면으로 이동
      console.log('로그인된 사용자가 없습니다. 로그인 화면으로 이동합니다.');
      router.replace('/screens/LoginScreen');
    } catch (error) {
      console.error('사용자 ID 초기화 실패:', error);
      // 실패 시 로그인 화면으로 이동
      router.replace('/screens/LoginScreen');
    }
  };

  useEffect(() => {
    if (currentUserId !== null) {
      fetchFeeds();
    }
  }, [currentUserId]);

  const fetchFeeds = async () => {
    if (!currentUserId) return; // currentUserId가 null이면 early return
    
    setLoading(true);
    setError(null);
    
    try {
      // 사용자 ID와 함께 API 호출하여 정확한 좋아요 상태 가져오기
      const feedsData = await feedApi.getFeeds(currentUserId);
      console.log('API 응답 데이터:', JSON.stringify(feedsData, null, 2));
      
      // 필드명 매핑 처리 - API 응답 구조에 따라 authorNickname 필드 설정
      const mappedData = feedsData.map((item: FeedItem) => {
        return {
          ...item,
          // id는 숫자 유지
          id: item.id,
          // authorId 매핑 (백엔드에서 추가됨)
          authorId: (item as any).authorId || item.authorId,
          // API 응답에서는 authorNickname이 아닌 author로 제공됨
          authorNickname: (item as any).author || item.authorNickname || "알 수 없음",
          // API 응답에서는 authorProfileImageUrl이 아닌 profileImageUrl로 제공됨
          authorProfileImageUrl: (item as any).profileImageUrl || item.authorProfileImageUrl,
          // imageUrl이 null일 경우 빈 문자열로 처리
          imageUrl: item.imageUrl || '',
          // 좋아요/댓글 관련 필드 확실하게 매핑
          likes: item.likes || 0,
          comments: item.comments || 0,
          isLiked: item.isLiked || false
        };
      });
      
      setFeeds(mappedData);
    } catch (err) {
      console.error('피드 불러오기 실패:', err);
      setError('피드를 불러오는 중 오류가 발생했습니다.');
      setFeeds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCommentModal = (feedId: number, feedType: 'post' | 'quiz') => {
    setSelectedFeedId(feedId);
    setSelectedFeedType(feedType);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedFeedId(null);
  };

  const toggleLike = async (feedId: number) => {
    try {
      // 로그인 체크 (실제 앱에서는 AsyncStorage에서 사용자 정보 확인)
      if (!currentUserId) {
        Alert.alert('알림', '좋아요 기능을 사용하려면 로그인이 필요합니다.');
        return;
      }

      // 해당 피드 찾기
      const feed = feeds.find(f => f.id === feedId);
      if (!feed) return;

      console.log(`좋아요 토글 시작 - 사용자 ID: ${currentUserId}, 피드 ID: ${feedId}, 현재 좋아요: ${feed.isLiked}, 현재 개수: ${feed.likes}`);

      // 낙관적 UI 업데이트 (즉시 반영)
      const optimisticLiked = !feed.isLiked;
      const optimisticCount = feed.isLiked ? feed.likes - 1 : feed.likes + 1;
      
      console.log(`낙관적 업데이트 - 새 좋아요: ${optimisticLiked}, 새 개수: ${optimisticCount}`);
      
      setFeeds(prevFeeds => 
        prevFeeds.map(f => 
          f.id === feedId 
            ? { ...f, likes: optimisticCount, isLiked: optimisticLiked }
            : f
        )
      );

      try {
        // API 호출
        const result = await feedApi.toggleLike(feedId, feed.type, currentUserId);
        
        console.log(`서버 응답 - 좋아요: ${result.isLiked}, 개수: ${result.likeCount}`);
        
        // 서버 응답으로 최종 상태 업데이트
        setFeeds(prevFeeds => 
          prevFeeds.map(f => 
            f.id === feedId 
              ? { ...f, likes: result.likeCount, isLiked: result.isLiked }
              : f
          )
        );
      } catch (apiError) {
        console.log('API 호출 실패, 원래 상태로 되돌림');
        // API 실패 시 원래 상태로 되돌림
        setFeeds(prevFeeds => 
          prevFeeds.map(f => 
            f.id === feedId 
              ? { ...f, likes: feed.likes, isLiked: feed.isLiked }
              : f
          )
        );
        throw apiError;
      }
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  const selectOption = async (feedId: number, optionIndex: number) => {
    setSelectedOptions(prev => ({...prev, [feedId]: optionIndex}));
    
    try {
      // 실제 API 호출
      await feedApi.submitAnswer(feedId, optionIndex);
    } catch (err) {
      console.error('답변 제출 실패:', err);
    }
  };

  const handleImageError = (feedId: number) => {
    setImageErrors(prev => ({...prev, [feedId]: true}));
  };

  // 타임스탬프 제거 함수 추가
  const removeTimestamp = (title: string) => {
    if (!title) return title;
    // 괄호와 그 안의 숫자를 찾아서 제거하는 정규식
    return title.replace(/\s*\(\d+\)$/, '');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeeds();
  };

  // 프로필 클릭 핸들러 추가
  const handleProfilePress = (authorId: number) => {
    console.log('프로필 클릭:', authorId);
    router.push(`/user-profile?userId=${authorId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.navbar}>
        <View style={styles.leftNavSection}>
          <Text style={styles.logoText}>logo</Text>
          {currentUser && (
            <Text style={styles.userIdText}>{currentUser.nickname} (ID: {currentUser.id})</Text>
          )}
        </View>
        <View style={styles.navbarRight}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={async () => {
              try {
                const success = await signOut();
                if (success) {
                  console.log('로그아웃 성공');
                  router.replace('/screens/LoginScreen');
                } else {
                  Alert.alert('오류', '로그아웃에 실패했습니다.');
                }
              } catch (error) {
                console.error('로그아웃 오류:', error);
                Alert.alert('오류', '로그아웃에 실패했습니다.');
              }
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView 
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6B6B"
            colors={["#FF6B6B"]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchFeeds}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              liked={feed.isLiked}
              selectedOption={selectedOptions[feed.id]}
              onLike={() => toggleLike(feed.id)}
              onSelectOption={(optionIndex) => selectOption(feed.id, optionIndex)}
              onComment={() => openCommentModal(feed.id, feed.type === 'knowledge' ? 'post' : 'quiz')}
              onProfilePress={() => handleProfilePress(feed.authorId)}
            />
          ))
        )}
      </ScrollView>

      {/* 댓글 모달 */}
      {selectedFeedId && (
        <CommentModal
          visible={commentModalVisible}
          onClose={closeCommentModal}
          targetType={selectedFeedType}
          targetId={selectedFeedId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  contentArea: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  leftNavSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  userIdText: {
    fontSize: 14,
    color: '#7d7d7d',
    marginLeft: 8,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#7d7d7d',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeCount: {
    fontSize: 12,
    color: '#7d7d7d',
    marginLeft: 4,
  },
  commentInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
});



