import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FeedCard from '../components/FeedCard';
import { feedApi } from '../services/api/endpoints/feed';
import { bookmarkApi } from '../services/api/endpoints/bookmark';
import { Comment, FeedItem } from '../services/api/types';
import { showShareOptions } from '../utils/share';
import Constants from 'expo-constants';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [likedFeeds, setLikedFeeds] = useState<Record<number, boolean>>({});
  const [bookmarkedFeeds, setBookmarkedFeeds] = useState<Record<number, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<number>(2);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // 현재 연결된 API URL 가져오기
  const currentApiUrl = Constants.expoConfig?.extra?.apiUrl || 'Unknown';

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const feedsData = await feedApi.getFeeds();
      console.log('피드 데이터:', feedsData);
      setFeeds(feedsData);
      
      // 서버에서 받은 좋아요 상태 설정
      const likedState = feedsData.reduce((acc, feed) => {
        acc[feed.id] = feed.isLiked || false;
        return acc;
      }, {} as {[key: number]: boolean});
      
      setLikedFeeds(likedState);
      
      // 북마크 상태 로드
      const userId = 1; // 실제로는 저장된 사용자 ID 사용
      const bookmarkState: {[key: number]: boolean} = {};
      
      for (const feed of feedsData) {
        try {
          const response = await bookmarkApi.checkBookmark(userId, feed.type, feed.id);
          bookmarkState[feed.id] = response.data.isBookmarked;
        } catch (error) {
          console.log(`북마크 상태 확인 실패 (${feed.id}):`, error);
          bookmarkState[feed.id] = false;
        }
      }
      
      setBookmarkedFeeds(bookmarkState);
    } catch (err) {
      console.error('피드 로딩 실패:', err);
      setError('피드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCommentModal = async (feedId: number) => {
    setSelectedFeedId(feedId);
    setCommentModalVisible(true);
    
    try {
      // 피드에서 타입 찾기
      const feed = feeds.find(f => f.id === feedId);
      const targetType = feed?.type || 'knowledge';
      
      // 실제 API 호출
      const commentsData = await feedApi.getComments(feedId, targetType);
      
      // 댓글 데이터 안전하게 처리
      const safeComments = (commentsData || []).map(comment => ({
        ...comment,
        author: comment.author || '익명',
        authorId: comment.authorId || 0,
        profileImageUrl: comment.profileImageUrl || '',
        content: comment.content || '',
        likes: comment.likes || 0
      }));
      
      setComments(safeComments);
    } catch (err) {
      console.error('댓글 불러오기 실패:', err);
      
      // 임시 댓글 데이터
      const mockComments: Comment[] = [
        {
          id: 1,
          author: '김지현',
          authorId: 1,
          profileImageUrl: '',
          content: '정말 흥미로운 사실이네요! 커피에 대해 이렇게 많은 화학물질이 있다는 걸 처음 알았어요.',
          createdAt: '3시간 전',
          likes: 12
        },
        {
          id: 2,
          author: '이승준',
          authorId: 2,
          profileImageUrl: '',
          content: '매일 마시는 커피가 이렇게 복잡한 음료였다니 놀랍네요. 다음에 커피 마실 때는 더 음미하면서 마셔봐야겠어요!',
          createdAt: '5시간 전',
          likes: 8
        }
      ];
      
      setComments(mockComments);
    }
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedFeedId(null);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!commentText.trim() || !selectedFeedId) return;

    try {
      // 피드에서 타입 찾기
      const feed = feeds.find(f => f.id === selectedFeedId);
      const targetType = feed?.type || 'knowledge';
      
      const newComment = await feedApi.addComment(selectedFeedId, commentText.trim(), targetType);
      
      // 새 댓글을 안전하게 처리
      const safeComment = {
        ...newComment,
        author: newComment.author || '익명',
        authorId: newComment.authorId || 0,
        profileImageUrl: newComment.profileImageUrl || '',
        content: newComment.content || '',
        likes: newComment.likes || 0
      };
      
      setComments(prev => [safeComment, ...prev]);
      setCommentText('');
      
      // 피드의 댓글 수 업데이트
      setFeeds(prev => prev.map(feedItem => 
        feedItem.id === selectedFeedId 
          ? { ...feedItem, comments: feedItem.comments + 1 }
          : feedItem
      ));
      
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const toggleLike = async (feedId: number) => {
    try {
      const feed = feeds.find(f => f.id === feedId);
      if (!feed) return;

      // UI 먼저 업데이트
      setLikedFeeds(prev => {
        const isLiked = prev[feedId];
        return {...prev, [feedId]: !isLiked};
      });
      
      // 좋아요 수 업데이트
      setFeeds(feeds.map(feedItem => {
        if (feedItem.id === feedId) {
          return {
            ...feedItem,
            likes: feedItem.likes + (likedFeeds[feedId] ? -1 : 1)
          };
        }
        return feedItem;
      }));
      
      // 실제 API 호출
      const result = await feedApi.toggleLike(feedId, feed.type);
      
      // 서버 응답으로 최종 업데이트
      setLikedFeeds(prev => ({...prev, [feedId]: result.isLiked}));
      setFeeds(feeds.map(feedItem => {
        if (feedItem.id === feedId) {
          return {
            ...feedItem,
            likes: result.likeCount
          };
        }
        return feedItem;
      }));
      
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      
      // 오류 발생 시 원래 상태로 되돌림
      setLikedFeeds(prev => ({...prev, [feedId]: !prev[feedId]}));
      
      setFeeds(feeds.map(feedItem => {
        if (feedItem.id === feedId) {
          return {
            ...feedItem,
            likes: feedItem.likes + (likedFeeds[feedId] ? 1 : -1)
          };
        }
        return feedItem;
      }));
    }
  };

  const [answerResults, setAnswerResults] = useState<Record<number, { correct: boolean; correctAnswer: number; userAnswer: number }>>({});

  const selectOption = async (feedId: number, optionIndex: number) => {
    setSelectedOptions(prev => ({...prev, [feedId]: optionIndex}));
    
    try {
      // 실제 API 호출로 정답 체크
      const result = await feedApi.submitAnswer(feedId, optionIndex);
      
      // 결과 저장
      setAnswerResults(prev => ({
        ...prev,
        [feedId]: result
      }));
      
    } catch (err) {
      console.error('답변 제출 실패:', err);
    }
  };

  const toggleBookmark = async (feedId: number) => {
    try {
      const feed = feeds.find(f => f.id === feedId);
      if (!feed) return;

      const userId = 1; // 실제로는 저장된 사용자 ID 사용
      
      // UI 먼저 업데이트
      setBookmarkedFeeds(prev => ({
        ...prev, 
        [feedId]: !prev[feedId]
      }));
      
      // 실제 API 호출
      const result = await bookmarkApi.toggleBookmark(userId, feed.type, feedId);
      
      // 서버 응답으로 최종 업데이트
      setBookmarkedFeeds(prev => ({
        ...prev, 
        [feedId]: result.data.isBookmarked
      }));
      
      // 북마크 상태에 따른 피드백
      Alert.alert(
        '', 
        result.data.isBookmarked ? '북마크에 저장되었습니다!' : '북마크가 해제되었습니다.'
      );
      
    } catch (err) {
      console.error('북마크 토글 실패:', err);
      
      // 오류 발생 시 원래 상태로 되돌림
      setBookmarkedFeeds(prev => ({
        ...prev, 
        [feedId]: !prev[feedId]
      }));
      
      Alert.alert('오류', '북마크 처리에 실패했습니다.');
    }
  };

  const handleDelete = async (feedId: number, type: 'knowledge' | 'quiz') => {
    try {
      await feedApi.deletePost(feedId, type);
      
      // 피드에서 제거
      setFeeds(prev => prev.filter(feed => feed.id !== feedId));
      
      Alert.alert('', '게시물이 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      Alert.alert('오류', '게시물 삭제에 실패했습니다.');
    }
  };

  const handleShare = async (feedId: number) => {
    console.log('공유 버튼 클릭됨, feedId:', feedId);
    
    try {
      console.log('피드 찾는 중...');
      const feed = feeds.find(f => f.id === feedId);
      console.log('찾은 피드:', feed);
      
      if (!feed) {
        console.error('피드를 찾을 수 없음:', feedId);
        Alert.alert('오류', '공유할 게시물을 찾을 수 없습니다.');
        return;
      }

      console.log('폴백 공유 데이터 생성 중...');
      // 바로 폴백 공유 데이터로 테스트
      const fallbackShareData = {
        shareUrl: `https://didyouknow.app/post/${feedId}`,
        shareText: `${feed.title} - DidYouKnow 앱에서 확인해보세요!`,
        title: feed.title,
        author: feed.author
      };
      console.log('생성된 폴백 공유 데이터:', fallbackShareData);
      
      console.log('showShareOptions 호출 중...');
      showShareOptions(fallbackShareData);
      console.log('showShareOptions 호출 완료');
      
    } catch (error) {
      console.error('handleShare 함수에서 오류 발생:', error);
      Alert.alert('오류', '공유 처리 중 오류가 발생했습니다.');
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

  // 게시글 클릭 시 상세 페이지로 이동
  const handleFeedPress = useCallback((feed: FeedItem) => {
    console.log('게시글 클릭:', feed.id, feed.type);
    router.push(`/post-detail?postId=${feed.id}&type=${feed.type}`);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>logo</Text>
          <Text style={styles.apiText}>
            {currentApiUrl.includes('localhost') ? '🟢 로컬' : '🔵 AWS'}
          </Text>
        </View>
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
          feeds.map((feed) => {
            // 실제 작성자와 현재 사용자 비교 (테스트를 위해 여러 ID 시도)
            const showDeleteButton = feed.authorId === currentUserId;
            console.log('피드 아이템 렌더링:', {
              feedId: feed.id,
              authorId: feed.authorId,
              currentUserId,
              showDeleteButton,
              author: feed.author
            });
            
            return (
              <FeedCard
                key={feed.id}
                feed={feed}
                liked={likedFeeds[feed.id]}
                bookmarked={bookmarkedFeeds[feed.id]}
                showDeleteButton={showDeleteButton}
                selectedOption={selectedOptions[feed.id]}
                answerResult={answerResults[feed.id]}
                onLike={() => toggleLike(feed.id)}
                onComment={() => openCommentModal(feed.id)}
                onShare={() => handleShare(feed.id)}
                onBookmark={() => toggleBookmark(feed.id)}
                onDelete={() => handleDelete(feed.id, feed.type)}
                onSelectOption={(index: number) => selectOption(feed.id, index)}
                onPress={() => handleFeedPress(feed)}
              />
            );
          })
        )}
      </ScrollView>

      {/* 댓글 모달 */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>댓글</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeCommentModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.commentList}>
              {comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.createdAt}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity style={styles.commentLike}>
                        <Ionicons name="heart-outline" size={16} color="#7d7d7d" />
                        <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.commentInput}>
              <TextInput
                style={styles.textInput}
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChangeText={setCommentText}
                multiline={false}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  commentText.trim() === '' && styles.disabledSendButton
                ]}
                onPress={submitComment}
                disabled={commentText.trim() === ''}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  apiText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
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



