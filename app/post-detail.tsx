import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  Alert,
  TextInput,
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { feedApi } from './services/api/endpoints/feed';
import { userApi } from './services/api/endpoints/user';
import { FeedItem, Comment } from './services/api/types';
import { showShareOptions } from './utils/share';

const { width: screenWidth } = Dimensions.get('window');

// 현재 사용자 ID 가져오기 함수
const getCurrentUserId = async (): Promise<number> => {
  try {
    const userStr = await AsyncStorage.getItem('@user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || 1;
    }
    return 1;
  } catch (error) {
    console.error('사용자 ID 가져오기 실패:', error);
    return 1;
  }
};

export default function PostDetailPage() {
  const router = useRouter();
  const { postId, type } = useLocalSearchParams();
  const [post, setPost] = useState<FeedItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (postId && !isNaN(Number(postId))) {
      const loadData = async () => {
        await loadPostDetail();
        await loadComments();
      };
      loadData();
    } else {
      console.error('유효하지 않은 게시물 ID:', postId);
      Alert.alert('오류', '유효하지 않은 게시물입니다.');
      router.back();
    }
  }, [postId]);

  const loadPostDetail = async () => {
    try {
      setLoading(true);
      
      // 통합 게시물 상세 조회 (Knowledge + Quiz 통합 API 사용)
      const postDetail = await userApi.getUnifiedPostDetail(Number(postId));
      
      if (!postDetail) {
        throw new Error('게시물 데이터를 찾을 수 없습니다.');
      }
      
      // FeedItem 형태로 변환
      const feedItem: FeedItem = {
        id: postDetail.id || Number(postId),
        type: postDetail.type || 'knowledge',
        title: postDetail.title || '제목 없음',
        content: postDetail.content || '내용 없음',
        imageUrl: (postDetail.imageUrls && postDetail.imageUrls.length > 0) ? postDetail.imageUrls[0] : '',
        authorId: 0, // 임시값
        author: postDetail.authorNickname || '익명',
        profileImageUrl: '',
        createdAt: postDetail.publishDate || new Date().toISOString(),
        likes: 0, // 초기값
        comments: 0, // 초기값
        options: postDetail.options || undefined
      };
      
      setPost(feedItem);
      
      // 백엔드에서 받은 좋아요/댓글 정보가 있다면 사용
      if (postDetail.likes !== undefined && postDetail.comments !== undefined) {
        setLikeCount(Number(postDetail.likes) || 0);
        setCommentCount(Number(postDetail.comments) || 0);
        setLiked(Boolean(postDetail.isLiked));
      } else {
        // 별도로 좋아요/댓글 정보 조회
        try {
          const targetType = (type as 'knowledge' | 'quiz') || 'knowledge';
          
          // 댓글 수 조회
          const commentsData = await feedApi.getComments(Number(postId), targetType);
          setCommentCount(commentsData ? commentsData.length : 0);
          
          // 좋아요 정보는 현재 API에서 제공하지 않으므로 0으로 설정
          setLikeCount(0);
          setLiked(false);
        } catch (error) {
          console.log('좋아요/댓글 정보 조회 중 오류:', error);
          setLikeCount(0);
          setCommentCount(0);
          setLiked(false);
        }
      }
      
    } catch (error) {
      console.error('게시물 상세 로딩 실패:', error);
      Alert.alert('오류', '게시물을 불러오는데 실패했습니다.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      if (!postId) {
        console.log('loadComments: postId가 없습니다');
        return;
      }
      
      const targetType = (type as 'knowledge' | 'quiz') || 'knowledge';
      console.log('loadComments 호출:', { postId: Number(postId), targetType });
      
      const commentsData = await feedApi.getComments(Number(postId), targetType);
      console.log('loadComments 응답:', commentsData);
      
      // 댓글 데이터 안전하게 처리
      const safeComments = (commentsData || []).map(comment => ({
        ...comment,
        author: comment.author || '익명',
        authorId: comment.authorId || 0,
        profileImageUrl: comment.profileImageUrl || '',
        content: comment.content || '',
        likes: comment.likes || 0
      }));
      
      console.log('처리된 댓글 데이터:', safeComments);
      setComments(safeComments);
      setCommentCount(safeComments.length);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      // 댓글 로딩 실패는 게시물 자체에는 영향을 주지 않음
      setComments([]);
      setCommentCount(0);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      setSubmittingComment(true);
      const targetType = post.type;
      const newComment = await feedApi.addComment(post.id, commentText.trim(), targetType);
      
      // 새 댓글을 안전하게 처리
      const safeComment = {
        ...newComment,
        author: newComment.author || '익명',
        authorId: newComment.authorId || 0,
        profileImageUrl: newComment.profileImageUrl || '',
        content: newComment.content || '',
        likes: newComment.likes || 0
      };
      
      // 댓글 목록에 즉시 추가
      setComments(prev => [safeComment, ...prev]);
      setCommentCount(prev => prev + 1);
      setCommentText('');
      
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    const originalLiked = liked;
    const originalCount = likeCount;

    try {
      // UI 먼저 업데이트 (낙관적 업데이트)
      setLiked(!liked);
      setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
      
      // API 호출
      const result = await feedApi.toggleLike(post.id, post.type);
      
      // 서버 응답으로 최종 업데이트
      setLiked(result.isLiked);
      setLikeCount(result.likeCount || 0);
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      // 오류 시 원래 상태로 되돌림
      setLiked(originalLiked);
      setLikeCount(originalCount);
    }
  };

  const handleShare = async () => {
    console.log('상세 페이지 공유 버튼 클릭됨');
    if (!post) {
      console.error('post가 null입니다');
      return;
    }

    console.log('공유할 post:', post.id, post.title);

    try {
      // 백엔드에서 공유 정보 가져오기
      console.log('백엔드에서 공유 정보 요청 중...');
      const shareData = await feedApi.getShareInfo(post.id);
      console.log('공유 정보 받아옴:', shareData);
      
      // 공유 옵션 메뉴 표시
      showShareOptions(shareData);
    } catch (error) {
      console.error('공유 처리 실패:', error);
      console.log('폴백 공유 실행 중...');
      
      // 폴백 공유
      const fallbackShareData = {
        shareUrl: `https://didyouknow.app/post/${post.id}`,
        shareText: `${post.title} - DidYouKnow 앱에서 확인해보세요!`,
        title: post.title,
        author: post.author
      };
      console.log('폴백 공유 데이터:', fallbackShareData);
      showShareOptions(fallbackShareData);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentProfileContainer}>
          <View style={styles.commentProfileImage}>
            {item.profileImageUrl ? (
              <Image 
                source={{ uri: item.profileImageUrl }} 
                style={styles.commentProfileImageActual}
                onError={() => console.log('댓글 프로필 이미지 로딩 오류')}
              />
            ) : (
              <Text style={styles.commentProfileText}>
                {(item.author || '익명').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>{item.author || '익명'}</Text>
            <Text style={styles.commentDate}>
              {new Date(item.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.commentMoreButton}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#8e8e8e" />
        </TouchableOpacity>
      </View>
      <Text style={styles.commentContent}>{item.content || ''}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.commentActionButton}>
          <Ionicons name="heart-outline" size={14} color="#8e8e8e" />
          <Text style={styles.commentActionText}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentActionButton}>
          <Ionicons name="chatbubble-outline" size={14} color="#8e8e8e" />
          <Text style={styles.commentActionText}>답글</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>게시물을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>게시물을 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>게시물</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 메인 게시물 - Thread 스타일 */}
        <View style={styles.mainPost}>
          {/* 작성자 정보 */}
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileImageText}>
                  {(post.author || '익명').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.authorDetails}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.author || '익명'}</Text>
                  <Text style={styles.postType}>
                    {post.type === 'knowledge' ? ' • 그거 아세요?' : ' • 맞춰보실래요?'}
                  </Text>
                </View>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* 게시물 내용 */}
          <View style={styles.contentSection}>
            <Text style={styles.postTitle}>{post.title || ''}</Text>
            <Text style={styles.postContent}>{post.content || ''}</Text>
            
            {/* 이미지 */}
            {post.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: post.imageUrl }} 
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {/* 퀴즈 옵션 */}
            {post.type === 'quiz' && post.options && post.options.length > 0 ? (
              <View style={styles.quizOptions}>
                {post.options.map((option, index) => (
                  <TouchableOpacity key={index} style={styles.quizOption}>
                    <Text style={styles.quizOptionText}>{option || ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          {/* 액션 버튼 */}
          <View style={styles.actionSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons 
                  name={liked ? "heart" : "heart-outline"} 
                  size={22} 
                  color={liked ? "#FF5A5F" : "#536471"} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={20} color="#536471" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="repeat-outline" size={22} color="#536471" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#536471" />
              </TouchableOpacity>
            </View>
            
            {/* 좋아요 및 댓글 수 */}
            <View style={styles.statsSection}>
              <Text style={styles.statsText}>
                {`좋아요 ${likeCount || 0}개 • 댓글 ${commentCount || 0}개`}
              </Text>
            </View>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsSectionTitle}>{`댓글 ${commentCount || 0}개`}</Text>
          </View>
          
          {/* 댓글 입력 */}
          <View style={styles.commentInputSection}>
            <View style={styles.commentInputContainer}>
              <View style={styles.commentInputProfile}>
                <Text style={styles.commentInputProfileText}>U</Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="댓글을 입력하세요..."
                placeholderTextColor="#8e8e8e"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              {commentText.trim() ? (
                <TouchableOpacity 
                  style={styles.commentSubmitButton}
                  onPress={handleSubmitComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#FF5A5F" />
                  ) : (
                    <Text style={styles.commentSubmitText}>게시</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* 댓글 목록 */}
          {comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>첫 번째 댓글을 작성해보세요!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e1e8ed'
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1419'
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  scrollView: {
    flex: 1
  },
  mainPost: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e1e8ed'
  },
  authorSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  profileImageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  authorDetails: {
    flex: 1
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f1419'
  },
  postType: {
    fontSize: 14,
    color: '#536471',
    marginLeft: 4
  },
  postDate: {
    fontSize: 14,
    color: '#536471',
    marginTop: 2
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f1419',
    lineHeight: 28,
    marginBottom: 8
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#0f1419',
    marginBottom: 12
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden'
  },
  postImage: {
    width: '100%',
    height: 300
  },
  quizOptions: {
    marginTop: 16,
    gap: 12
  },
  quizOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed'
  },
  quizOptionText: {
    fontSize: 16,
    color: '#0f1419',
    textAlign: 'center'
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  statsSection: {
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#e1e8ed'
  },
  statsText: {
    fontSize: 14,
    color: '#536471'
  },
  commentsSection: {
    backgroundColor: '#fff'
  },
  commentsSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e1e8ed'
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1419'
  },
  commentInputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e1e8ed'
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  commentInputProfile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  commentInputProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f1419',
    minHeight: 32,
    maxHeight: 120,
    textAlignVertical: 'top'
  },
  commentSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF5A5F',
    borderRadius: 16,
    marginLeft: 8
  },
  commentSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e1e8ed'
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  commentProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  commentProfileImageActual: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  commentProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  commentInfo: {
    flex: 1
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1419'
  },
  commentDate: {
    fontSize: 12,
    color: '#536471'
  },
  commentMoreButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 20,
    color: '#0f1419',
    marginBottom: 8
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  commentActionText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginLeft: 4
  },
  noCommentsContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  noCommentsText: {
    fontSize: 16,
    color: '#8e8e8e'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e8e'
  },
  errorText: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600'
  }
}); 