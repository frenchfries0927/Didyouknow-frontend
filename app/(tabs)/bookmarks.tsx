import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BaseCard from '../components/FeedCard/BaseCard';
import { bookmarkApi, BookmarkItem } from '../services/api/endpoints/bookmark';
import { showShareOptions } from '../utils/share';
import { FeedItem } from '../services/api/types';

export default function BookmarksPage() {
  const [bookmarkFeed, setBookmarkFeed] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBookmarkFeed();
  }, []);

  const loadBookmarkFeed = async () => {
    try {
      setLoading(true);
      const userId = 1; // 실제로는 저장된 사용자 ID 사용
      const response = await bookmarkApi.getBookmarkFeed(userId);
      setBookmarkFeed(response.data);
    } catch (error) {
      console.error('북마크 피드 로딩 실패:', error);
      Alert.alert('오류', '북마크한 게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarkFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: number, type: string) => {
    console.log('좋아요:', postId, type);
    // 좋아요 API 호출 로직 추가
  };

  const handleBookmark = async (postId: number, type: string) => {
    try {
      const userId = 1; // 실제로는 저장된 사용자 ID 사용
      const response = await bookmarkApi.toggleBookmark(userId, type, postId);
      
      if (!response.data.isBookmarked) {
        // 북마크 해제되면 피드에서 제거
        setBookmarkFeed(prev => prev.filter(item => item.id !== postId));
        Alert.alert('', '북마크가 해제되었습니다.');
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      Alert.alert('오류', '북마크 처리에 실패했습니다.');
    }
  };

  const handleComment = (postId: number, type: string) => {
    console.log('댓글:', postId, type);
    // 댓글 페이지로 이동하는 로직 추가
  };

  const handleShare = async (postId: number, type: string, title: string, author: string) => {
    try {
      console.log('공유 요청:', { postId, type, title, author });
      
      const shareText = `📚 ${author}님의 흥미로운 ${type === 'quiz' ? '퀴즈' : '지식'}을 확인해보세요!\n\n${title}`;
      const shareUrl = `https://didyouknow.app/post/${postId}`;
      
      showShareOptions({
        shareUrl,
        shareText,
        title,
        author
      });
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  const handlePress = (postId: number, type: string) => {
    router.push(`/post-detail?postId=${postId}&type=${type}`);
  };

  // BookmarkItem을 FeedItem으로 변환
  const convertToFeedItem = (item: BookmarkItem): FeedItem => ({
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    authorId: 1, // 임시값, 실제로는 BookmarkItem에 authorId가 있어야 함
    author: item.authorNickname,
    createdAt: item.publishDate,
    likes: item.likes,
    comments: item.comments,
    isLiked: item.isLiked,
    imageUrl: item.imageUrls?.[0] || '',
    options: item.options,
    profileImageUrl: ''
  });

  const renderBookmarkItem = ({ item }: { item: BookmarkItem }) => {
    const feedItem = convertToFeedItem(item);
    
    return (
      <BaseCard
        feed={feedItem}
        liked={item.isLiked}
        bookmarked={true}
        onLike={() => handleLike(item.id, item.type)}
        onComment={() => handleComment(item.id, item.type)}
        onShare={() => handleShare(item.id, item.type, item.title, item.authorNickname)}
        onBookmark={() => handleBookmark(item.id, item.type)}
        onPress={() => handlePress(item.id, item.type)}
      >
        {/* BaseCard 내부 콘텐츠 */}
        <View style={styles.cardContent}>
          <Text style={styles.cardDescription}>{item.content}</Text>
          {item.type === 'quiz' && item.options && (
            <View style={styles.optionsContainer}>
              {item.options.map((option, index) => (
                <View key={index} style={styles.option}>
                  <Text style={styles.optionText}>{index + 1}. {option}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={16} color="#FF5A5F" />
            <Text style={styles.bookmarkBadgeText}>북마크됨</Text>
          </View>
        </View>
      </BaseCard>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>북마크를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>북마크</Text>
        <Ionicons name="bookmark" size={24} color="#FF5A5F" />
      </View>

      {/* 북마크 피드 */}
      <FlatList
        data={bookmarkFeed}
        renderItem={renderBookmarkItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#DDD" />
            <Text style={styles.emptyTitle}>북마크한 게시물이 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              마음에 드는 게시물을 북마크해보세요!
            </Text>
          </View>
        }
      />
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
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff'
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  cardContent: {
    marginTop: 12
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  optionsContainer: {
    marginBottom: 12
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 4
  },
  optionText: {
    fontSize: 14,
    color: '#333'
  },
  bookmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  bookmarkBadgeText: {
    fontSize: 12,
    color: '#FF5A5F',
    marginLeft: 4,
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 24,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20
  }
}); 