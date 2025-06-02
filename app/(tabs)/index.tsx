import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FeedCard from '../components/FeedCard';
import CommentModal from '../components/CommentModal';
import { feedApi } from '../services/api/endpoints/feed';
import { FeedItem } from '../services/api/types';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedFeedType, setSelectedFeedType] = useState<'post' | 'quiz'>('post');
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [likedFeeds, setLikedFeeds] = useState<Record<number, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 실제 API 호출
      const feedsData = await feedApi.getFeeds();
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
          imageUrl: item.imageUrl || ''
        };
      });
      
      setFeeds(mappedData);
      
      // 좋아요 상태 초기화
      const initialLikedState: Record<number, boolean> = {};
      mappedData.forEach((feed: FeedItem) => {
        initialLikedState[feed.id] = false;
      });
      
      setLikedFeeds(initialLikedState);
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
      // UI 먼저 업데이트
      setLikedFeeds(prev => {
        const isLiked = prev[feedId];
        return {...prev, [feedId]: !isLiked};
      });
      
      // 좋아요 수 업데이트
      setFeeds(feeds.map(feed => {
        if (feed.id === feedId) {
          return {
            ...feed,
            likes: feed.likes + (likedFeeds[feedId] ? -1 : 1)
          };
        }
        return feed;
      }));
      
      // 실제 API 호출
      await feedApi.toggleLike(feedId);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      
      // 오류 발생 시 원래 상태로 되돌림
      setLikedFeeds(prev => ({...prev, [feedId]: !prev[feedId]}));
      
      setFeeds(feeds.map(feed => {
        if (feed.id === feedId) {
          return {
            ...feed,
            likes: feed.likes + (likedFeeds[feedId] ? 1 : -1)
          };
        }
        return feed;
      }));
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
        <Text style={styles.logoText}>logo</Text>
        <View style={styles.navbarRight}>
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
              liked={likedFeeds[feed.id]}
              selectedOption={selectedOptions[feed.id]}
              onLike={() => toggleLike(feed.id)}
              onComment={() => openCommentModal(feed.id, feed.type === 'knowledge' ? 'post' : 'quiz')}
              onSelectOption={(index: number) => selectOption(feed.id, index)}
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
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
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



