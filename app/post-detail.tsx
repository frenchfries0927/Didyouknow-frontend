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
  Dimensions 
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
import { userApi, UserPost, Comment } from '../services/api';

export default function PostDetailPage() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<UserPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPostDetail();
      loadComments();
    }
  }, [postId]);

  const loadPostDetail = async () => {
    try {
      setLoading(true);
      // 게시물 상세 조회 API 사용 시도, 실패하면 내 게시물에서 찾기
      try {
        const postDetail = await userApi.getPostDetail(Number(postId));
        setPost(postDetail);
      } catch (detailError) {
        // 상세 조회 실패 시 내 게시물에서 찾기
        console.log('상세 조회 실패, 내 게시물에서 검색 중...');
        const allPosts = await userApi.getMyPosts();
        const foundPost = allPosts.find(p => p.id.toString() === postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          Alert.alert('오류', '게시물을 찾을 수 없습니다.');
          router.back();
        }
      }
    } catch (error) {
      console.error('게시물 상세 로딩 실패:', error);
      Alert.alert('오류', '게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // 임시로 빈 배열 반환 (실제 댓글 API 구현 필요)
      setComments([]);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      // 실제 댓글 추가 API 호출 필요
      Alert.alert('알림', '댓글 기능은 준비 중입니다.');
      setCommentText('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>{item.author}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentDate}>{item.createdAt}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>게시물을 불러오는 중...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>게시물을 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>게시물</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 유저 정보 */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/32x32/FF5A5F/FFFFFF?text=U' }} 
                style={styles.profileImage} 
              />
            </View>
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{post.authorNickname}</Text>
              <Text style={styles.postDate}>{post.publishDate}</Text>
            </View>
          </View>
        </View>

        {/* 제목 */}
        <View style={styles.titleContainer}>
          <Text style={styles.postTitle}>{post.title}</Text>
        </View>

        {/* 게시물 이미지들 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {post.imageUrls.map((imageUrl, index) => (
                <Image 
                  key={index} 
                  source={{ uri: imageUrl }} 
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {post.imageUrls.length > 1 && (
              <View style={styles.imageIndicatorContainer}>
                {post.imageUrls.map((_, index) => (
                  <View key={index} style={styles.imageIndicator} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* 내용 */}
        <View style={styles.postContent}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 좋아요 수 */}
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>좋아요 0개</Text>
        </View>

        {/* 댓글 보기 */}
        <TouchableOpacity style={styles.viewCommentsButton}>
          <Text style={styles.viewCommentsText}>댓글 {comments.length}개 모두 보기</Text>
        </TouchableOpacity>

        {/* 댓글 입력 */}
        <View style={styles.commentInputContainer}>
          <View style={styles.commentProfileImageContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/24x24/FF5A5F/FFFFFF?text=U' }} 
              style={styles.commentProfileImage} 
            />
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글 달기..."
            value={commentText}
            onChangeText={setCommentText}
            maxLength={500}
          />
          {commentText.trim() ? (
            <TouchableOpacity 
              style={styles.postCommentButton}
              onPress={handleSubmitComment}
              disabled={submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#0095F6" />
              ) : (
                <Text style={styles.postCommentText}>게시</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <View style={styles.commentsSection}>
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
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
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb'
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  scrollView: {
    flex: 1
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f5f5f5'
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  authorDetails: {
    flex: 1
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  postDate: {
    fontSize: 13,
    color: '#666'
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff'
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    lineHeight: 28
  },
  imageContainer: {
    marginVertical: 12,
    backgroundColor: '#f8f8f8'
  },
  imageScrollView: {
    height: 300
  },
  postImage: {
    width: screenWidth,
    height: 300
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 2
  },
  postContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff'
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  leftActions: {
    flexDirection: 'row'
  },
  actionButton: {
    marginRight: 20,
    padding: 4
  },
  likesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff'
  },
  likesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  authorNameInContent: {
    fontWeight: '600'
  },
  viewCommentsButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff'
  },
  viewCommentsText: {
    fontSize: 14,
    color: '#666'
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb'
  },
  commentProfileImageContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12
  },
  commentProfileImage: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#000'
  },
  postCommentButton: {
    marginLeft: 8
  },
  postCommentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0095F6'
  },
  commentsSection: {
    paddingHorizontal: 16
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#efefef'
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2
  },
  commentContent: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2
  },
  commentDate: {
    fontSize: 12,
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
    backgroundColor: '#0095F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600'
  }
}); 