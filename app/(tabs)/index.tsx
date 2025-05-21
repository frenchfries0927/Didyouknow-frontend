import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Comment, feedApi } from '../../services/api';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

// API 베이스 URL - 개발 환경
const API_BASE_URL = 'http://10.0.2.2:8080';

// FeedItem 타입 정의
type FeedItem = {
  id: number;
  type: 'knowledge' | 'quiz';
  title: string;
  content: string;
  imageUrl: string | null;
  authorNickname: string;
  authorProfileImageUrl: string;
  createdAt: string;
  options?: string[];
  hint?: string;
  likes: number;
  comments: number;
};

export default function FeedScreen() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
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
      const data = await feedApi.getFeeds();
      console.log('API 응답 데이터:', JSON.stringify(data, null, 2));
      
      // 필드명 매핑 처리 - API 응답 구조에 따라 authorNickname 필드 설정
      const mappedData = data.map((item, index) => {
        const anyItem = item as any;
        return {
          ...item,
          // id는 숫자 유지
          id: anyItem.id,
          // API 응답에서는 authorNickname이 아닌 author로 제공됨
          authorNickname: anyItem.author || anyItem.authorNickname || "알 수 없음",
          // API 응답에서는 authorProfileImageUrl이 아닌 profileImageUrl로 제공됨
          authorProfileImageUrl: anyItem.profileImageUrl || anyItem.authorProfileImageUrl
        };
      });
      
      setFeeds(mappedData);
      
      // 좋아요 상태 초기화
      const initialLikedState: Record<number, boolean> = {};
      mappedData.forEach((feed) => {
        initialLikedState[feed.id] = false;
      });
      
      setLikedFeeds(initialLikedState);
    } catch (err) {
      console.error('피드 불러오기 실패:', err);
      setError('피드를 불러오는 중 오류가 발생했습니다.');
      
      // 임시 데이터
      const mockFeeds: FeedItem[] = [
        {
          id: 1,
          type: 'knowledge',
          title: '커피의 화학물질',
          content: '우리가 매일 마시는 커피에는 약 1,000가지 이상의 화학 물질이 포함되어 있습니다. 그 중 절반 이상이 커피의 독특한 향을 만들어내는 역할을 합니다.',
          imageUrl: 'https://readdy.ai/api/search-image?query=A%20cup%20of%20coffee%20on%20a%20wooden%20table%2C%20steam%20rising%2C%20morning%20light%2C%20high-quality%20detailed%20photo%2C%20coffee%20beans%20scattered%20around%2C%20warm%20tones%2C%20professional%20food%20photography%2C%20shallow%20depth%20of%20field&width=375&height=250&seq=1&orientation=landscape',
          authorNickname: '민지혜',
          authorProfileImageUrl: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20asian%20woman%20smiling%2C%20natural%20lighting%2C%20clean%20background&width=40&height=40&seq=5&orientation=squarish',
          createdAt: '2025-04-25T10:30:00',
          likes: 238,
          comments: 42
        },
        {
          id: 2,
          type: 'quiz',
          title: '세계에서 가장 긴 강은 무엇일까요?',
          content: '',
          imageUrl: 'https://readdy.ai/api/search-image?query=Aerial%20view%20of%20a%20long%20winding%20river%20through%20lush%20landscape%2C%20blue%20water%20contrasting%20with%20green%20surroundings%2C%20high-quality%20drone%20photography%2C%20beautiful%20natural%20scenery%2C%20golden%20hour%20lighting%2C%20mist%20rising%20from%20water%2C%20professional%20nature%20photography&width=375&height=200&seq=2&orientation=landscape',
          authorNickname: '박준서',
          authorProfileImageUrl: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20asian%20man%20smiling%2C%20natural%20lighting%2C%20clean%20background&width=40&height=40&seq=6&orientation=squarish',
          createdAt: '2025-04-25T09:15:00',
          options: ['아마존강', '나일강', '양쯔강', '미시시피강'],
          hint: '이 강은 아프리카 대륙을 관통하며 흐릅니다.',
          likes: 156,
          comments: 89
        },
        {
          id: 3,
          type: 'knowledge',
          title: '북극곰의 털',
          content: '북극곰의 털은 실제로 하얀색이 아닙니다. 각 털은 투명한 중공 튜브로 되어 있어 빛을 반사하고 열을 가두는 역할을 합니다.',
          imageUrl: 'https://readdy.ai/api/search-image?query=Polar%20bear%20in%20snowy%20environment%2C%20close-up%20showing%20fur%20detail%2C%20crystal%20clear%20ice%20background%2C%20professional%20wildlife%20photography%2C%20natural%20lighting%2C%20high%20detail%2C%20National%20Geographic%20style%2C%20majestic%20animal%20portrait&width=375&height=250&seq=3&orientation=landscape',
          authorNickname: '김서연',
          authorProfileImageUrl: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20mature%20asian%20woman%20smiling%2C%20natural%20lighting%2C%20clean%20background&width=40&height=40&seq=7&orientation=squarish',
          createdAt: '2025-04-24T14:20:00',
          likes: 312,
          comments: 57
        },
        {
          id: 4,
          type: 'quiz',
          title: '다음 중 노벨상이 수여되지 않는 분야는?',
          content: '',
          imageUrl: 'https://readdy.ai/api/search-image?query=Nobel%20Prize%20medal%20close-up%2C%20golden%20medal%20with%20ribbon%2C%20prestigious%20award%2C%20high-quality%20detailed%20photo%2C%20elegant%20display%2C%20dramatic%20lighting%2C%20professional%20photography%2C%20ceremonial%20setting&width=375&height=200&seq=4&orientation=landscape',
          authorNickname: '이동현',
          authorProfileImageUrl: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20asian%20man%20with%20glasses%20smiling%2C%20natural%20lighting%2C%20clean%20background&width=40&height=40&seq=8&orientation=squarish',
          createdAt: '2025-04-24T11:05:00',
          options: ['경제학', '수학', '문학', '화학'],
          hint: '이 분야는 필즈상이라는 별도의 권위 있는 상이 있습니다.',
          likes: 185,
          comments: 73
        }
      ];
      
      setFeeds(mockFeeds);
      
      // 좋아요 상태 초기화
      const initialLikedState: Record<number, boolean> = {};
      mockFeeds.forEach(feed => {
        initialLikedState[feed.id] = false;
      });
      
      setLikedFeeds(initialLikedState);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCommentModal = async (feedId: number) => {
    setSelectedFeedId(feedId);
    setCommentModalVisible(true);
    
    try {
      // 실제 API 호출
      const commentsData = await feedApi.getComments(feedId);
      setComments(commentsData);
    } catch (err) {
      console.error('댓글 불러오기 실패:', err);
      
      // 임시 댓글 데이터
      const mockComments: Comment[] = [
        {
          id: 1,
          author: '김지현',
          content: '정말 흥미로운 사실이네요! 커피에 대해 이렇게 많은 화학물질이 있다는 걸 처음 알았어요.',
          createdAt: '3시간 전',
          likes: 12
        },
        {
          id: 2,
          author: '이승준',
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
    if (commentText.trim() === '' || !selectedFeedId) return;
    
    try {
      // 실제 API 호출
      await feedApi.addComment(selectedFeedId, commentText);
      
      // 성공 시 새 댓글 추가
      const newComment: Comment = {
        id: Date.now(), // 임시 ID
        author: '나',
        content: commentText,
        createdAt: '방금 전',
        likes: 0
      };
      
      setComments([newComment, ...comments]);
      
      // 댓글 수 업데이트
      setFeeds(
        feeds.map(feed => 
          feed.id === selectedFeedId
            ? { ...feed, comments: feed.comments + 1 }
            : feed
        )
      );
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      
      // 오류 발생해도 UI에 임시로 표시
      const newComment: Comment = {
        id: Date.now(),
        author: '나',
        content: commentText,
        createdAt: '방금 전',
        likes: 0
      };
      
      setComments([newComment, ...comments]);
    }
    
    setCommentText('');
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

  const renderFeedItem = (feed: FeedItem, index: number) => {
    const isKnowledge = feed.type === 'knowledge';
    const hasImageError = imageErrors[feed.id];
    
    return (
      <View key={`feed-${feed.id}-${index}`} style={styles.feedCard}>
        {/* 게시물 헤더 */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <Image 
              source={{ 
                uri: feed.authorProfileImageUrl || 
                  'https://ui-avatars.com/api/?name=' + encodeURIComponent(feed.authorNickname || '알+수+없음') 
              }} 
              style={styles.profileImage}
              onError={() => console.log('프로필 이미지 로딩 오류')} 
            />
            <View style={styles.headerTextContainer}>
              <View style={styles.authorRow}>
                <Text style={[styles.feedType, isKnowledge ? styles.knowledgeType : styles.quizType]}>
                  {isKnowledge ? '그거 아세요?' : '맞춰보실래요?'}
                </Text>
                <Text style={styles.byText}>by</Text>
                <Text style={styles.authorName}>{feed.authorNickname || '알 수 없음'}</Text>
              </View>
              <Text style={styles.createdAt}>
                {new Date(feed.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#7d7d7d" />
          </TouchableOpacity>
        </View>

        {/* 게시물 내용 */}
        <View style={styles.postContent}>
          {/* 제목 (모든 포스트 타입에 표시) */}
          <Text style={styles.postTitle}>{removeTimestamp(feed.title)}</Text>
          
          {/* 게시물 이미지 */}
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Image 
                source={{ 
                  uri: (!hasImageError && feed.imageUrl) ? 
                    feed.imageUrl : 
                    `https://picsum.photos/seed/${feed.id}/400/240`
                }} 
                style={styles.feedImage} 
                resizeMode="cover"
                onError={() => handleImageError(feed.id)}
              />
            </View>
          </View>
          
          {/* Knowledge Post 내용 */}
          {isKnowledge && (
            <Text style={styles.contentText}>{feed.content}</Text>
          )}
          
          {/* 퀴즈 옵션 */}
          {!isKnowledge && feed.options && (
            <View style={styles.optionsContainer}>
              {feed.options.map((option, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOptions[feed.id] === index && styles.selectedOption
                  ]}
                  onPress={() => selectOption(feed.id, index)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOptions[feed.id] === index && styles.selectedOptionText
                  ]}>
                    {`${index + 1}) ${option}`}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* 힌트 */}
              {feed.hint && (
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>{feed.hint}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 게시물 액션 */}
        <View style={styles.postActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleLike(feed.id)}
            >
              <Ionicons 
                name={likedFeeds[feed.id] ? "heart" : "heart-outline"} 
                size={24} 
                color={likedFeeds[feed.id] ? "#FF6B6B" : "#666"} 
              />
              <Text style={styles.actionCount}>{feed.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openCommentModal(feed.id)}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#666" />
              <Text style={styles.actionCount}>{feed.comments}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeeds();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 네비게이션 바 복구 */}
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
          feeds.map((feed, index) => renderFeedItem(feed, index))
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
  feedCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedType: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  knowledgeType: {
    color: '#FF6B6B',
  },
  quizType: {
    color: '#4ECDC4',
  },
  byText: {
    fontSize: 14,
    color: '#7d7d7d',
    marginRight: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  createdAt: {
    fontSize: 12,
    color: '#7d7d7d',
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    marginTop: 12,
    lineHeight: 22,
  },
  imageContainer: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#4ECDC4',
    borderColor: '#2ABD9F',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#555',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  shareButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
});



