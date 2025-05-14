

// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

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
};

// 개발 환경에서 사용할 API 기본 URL
const API_BASE_URL = 'http://10.0.2.2:8080';

export default function FeedPage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchFeeds();
    // 가짜 좋아요 데이터 초기화
    const initialLikeCounts: Record<number, number> = {};
    feeds.forEach(feed => {
      initialLikeCounts[feed.id] = Math.floor(Math.random() * 100) + 5;
    });
    setLikeCounts(initialLikeCounts);
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<FeedItem[]>(`${API_BASE_URL}/api/feed`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setFeeds(response.data);
      
      // 가짜 좋아요 데이터 초기화
      const initialLikeCounts: Record<number, number> = {};
      response.data.forEach(feed => {
        initialLikeCounts[feed.id] = Math.floor(Math.random() * 100) + 5;
      });
      setLikeCounts(initialLikeCounts);
    } catch (err: any) {
      const errorMessage = err.response 
        ? `상태 코드: ${err.response.status}, 메시지: ${JSON.stringify(err.response.data)}`
        : `네트워크 오류: ${err.message}`;
      
      setError(errorMessage);
      console.error('피드 불러오기 실패:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeeds();
  };

  // 좋아요 토글
  const toggleLike = (feedId: number) => {
    // 좋아요 상태 토글
    setLikedPosts(prev => ({
      ...prev,
      [feedId]: !prev[feedId]
    }));

    // 좋아요 수 업데이트
    setLikeCounts(prev => ({
      ...prev,
      [feedId]: prev[feedId] + (likedPosts[feedId] ? -1 : 1)
    }));
  };

  // 저장 토글
  const toggleSave = (feedId: number) => {
    setSavedPosts(prev => ({
      ...prev,
      [feedId]: !prev[feedId]
    }));
  };

  // 옵션 선택 처리
  const handleOptionSelect = (feedId: number, optionIndex: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [feedId]: optionIndex
    }));
  };

  // 게시물 이미지 렌더링 함수
  const renderPostImage = (feed: FeedItem) => {
    if (!feed.imageUrl) return null;
    
    return (
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: feed.imageUrl }} 
          style={styles.postImage} 
          resizeMode="cover"
          onError={() => console.log(`이미지 로드 실패: ${feed.imageUrl}`)}
        />
        {/* 피드 타입 표시 배지 */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {feed.type === 'quiz' ? '퀴즈' : '상식'}
          </Text>
        </View>
      </View>
    );
  };

  // 퀴즈 옵션을 렌더링하는 함수
  const renderQuizOptions = (feed: FeedItem) => {
    if (feed.type !== 'quiz' || !feed.options || feed.options.length === 0) {
      return null;
    }

    return (
      <View style={styles.optionsContainer}>
        {feed.options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.optionButton,
              selectedOptions[feed.id] === index ? styles.selectedOption : null
            ]}
            onPress={() => handleOptionSelect(feed.id, index)}
          >
            <View style={styles.optionInner}>
              <View style={[
                styles.optionCircle,
                selectedOptions[feed.id] === index ? styles.selectedOptionCircle : null
              ]}>
                <Text style={[
                  styles.optionLetter,
                  selectedOptions[feed.id] === index ? styles.selectedOptionLetter : null
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedOptions[feed.id] === index ? styles.selectedOptionText : null
              ]}>
                {option}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 인스타그램 스타일 헤더
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logo}>알쓸신잡</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add-circle-outline" size={26} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="heart-outline" size={26} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="paper-plane-outline" size={26} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 스토리 (스토리 UI 추가)
  const renderStories = () => (
    <View style={styles.storiesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {/* 내 스토리 */}
        <View style={styles.storyItem}>
          <View style={styles.storyBorder}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.storyImage} 
            />
            <View style={styles.addStoryBtn}>
              <Text style={styles.addStoryPlus}>+</Text>
            </View>
          </View>
          <Text style={styles.storyUsername} numberOfLines={1}>나의 스토리</Text>
        </View>
        
        {/* 더미 스토리 데이터 */}
        {['상식박사', '퀴즈왕', '밍뭉이', '호랭이', '빵빵이'].map((name, index) => (
          <View key={index} style={styles.storyItem}>
            <View style={[styles.storyBorder, styles.storyActive]}>
              <Image 
                source={{ uri: `https://randomuser.me/api/portraits/${index % 2 ? 'women' : 'men'}/${40 + index}.jpg` }} 
                style={styles.storyImage} 
              />
            </View>
            <Text style={styles.storyUsername} numberOfLines={1}>{name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // 로딩 중일 때 로딩 인디케이터 표시
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#0095F6" />
      <Text style={{ marginTop: 10, color: '#262626' }}>데이터를 불러오는 중...</Text>
    </View>
  );

  // 오류가 있을 경우 재시도 버튼 표시
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
      <Text style={styles.errorText}>데이터를 불러오는데 실패했습니다.</Text>
      <Text style={styles.errorDetail}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchFeeds}>
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );

  // 게시물 하단 액션 렌더링 (좋아요, 댓글 등)
  const renderPostActions = (feed: FeedItem) => (
    <View>
      <View style={styles.actionButtons}>
        <View style={styles.actionLeftButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(feed.id)}>
            <Ionicons 
              name={likedPosts[feed.id] ? "heart" : "heart-outline"} 
              size={24} 
              color={likedPosts[feed.id] ? "#ED4956" : "#262626"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleSave(feed.id)}>
          <Ionicons 
            name={savedPosts[feed.id] ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color="#262626" 
          />
        </TouchableOpacity>
      </View>
      
      {/* 좋아요 수 */}
      <View style={styles.likesContainer}>
        <Text style={styles.likesText}>좋아요 {likeCounts[feed.id] || 0}개</Text>
      </View>
    </View>
  );

  // 게시물 내용 렌더링
  const renderPostContent = (feed: FeedItem) => (
    <View style={styles.contentContainer}>
      <View style={styles.titleAndContent}>
        <Text style={styles.authorNameInContent}>{feed.authorNickname}</Text>
        <Text style={styles.content}>
          <Text style={styles.title}>{feed.title} </Text>
          {feed.content}
        </Text>
      </View>
      
      {/* 퀴즈 옵션 표시 */}
      {renderQuizOptions(feed)}
      
      {/* 날짜 */}
      <Text style={styles.date}>
        {new Date(feed.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
    </View>
  );

  // 피드 항목 렌더링 (인스타그램 스타일)
  const renderFeedItems = () => (
    <>
      {feeds.length > 0 ? (
        feeds.map(feed => (
          <View key={feed.id} style={styles.card}>
            {/* 게시물 헤더 - 작성자 정보 */}
            <View style={styles.postHeader}>
              <View style={styles.postHeaderLeft}>
                <Image 
                  source={{ uri: feed.authorProfileImageUrl || 'https://via.placeholder.com/32?text=User' }} 
                  style={styles.avatar}
                  onError={() => console.log(`프로필 이미지 로드 실패: ${feed.authorProfileImageUrl}`)}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{feed.authorNickname}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#262626" />
              </TouchableOpacity>
            </View>
            
            {/* 게시물 이미지 */}
            {renderPostImage(feed)}
            
            {/* 게시물 액션 버튼 */}
            {renderPostActions(feed)}
            
            {/* 게시물 내용 */}
            {renderPostContent(feed)}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>표시할 피드가 없습니다.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchFeeds}>
            <Text style={styles.refreshButtonText}>새로고침</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0095F6" // 새로고침 아이콘 색상
            colors={["#0095F6"]} // Android 새로고침 색상
          />
        }
      >
        {renderStories()}
        {loading && !refreshing ? renderLoadingState() : 
         error ? renderErrorState() : 
         renderFeedItems()}
      </ScrollView>
      
      {/* 바텀 탭 (임시 - 실제로는 네비게이션에서 처리) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBarButton}>
          <Ionicons name="home" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBarButton}>
          <Ionicons name="search" size={26} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBarButton}>
          <Ionicons name="add-circle-outline" size={26} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBarButton}>
          <Ionicons name="heart-outline" size={26} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBarButton}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.tabProfilePic} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'white' 
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    // 인스타그램 로고 스타일 폰트
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif-medium',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8
  },
  // 스토리 스타일
  storiesContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
    paddingVertical: 10,
  },
  storiesContent: {
    paddingLeft: 8,
    paddingRight: 16
  },
  storyItem: {
    alignItems: 'center',
    marginLeft: 8,
    width: 64,
  },
  storyBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyActive: {
    borderWidth: 2,
    borderColor: '#FF8501',
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'white',
  },
  addStoryBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0095F6',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryPlus: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storyUsername: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    width: 64,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300
  },
  card: {
    marginBottom: 8,
    backgroundColor: 'white'
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16,
    marginRight: 10
  },
  authorInfo: {
    justifyContent: 'center'
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#262626'
  },
  postType: {
    fontSize: 12,
    color: '#8e8e8e'
  },
  moreButton: {
    padding: 5
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // 정사각형 이미지 (인스타그램 스타일)
    backgroundColor: '#FAFAFA',
  },
  postImage: { 
    width: '100%', 
    height: '100%',
    backgroundColor: '#FAFAFA'
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  actionLeftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16
  },
  likesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8
  },
  likesText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#262626'
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12
  },
  titleAndContent: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  authorNameInContent: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#262626',
    marginRight: 4
  },
  title: { 
    fontWeight: 'bold',
    color: '#262626'
  },
  content: {
    fontSize: 14,
    lineHeight: 18,
    color: '#262626',
    flexShrink: 1
  },
  // 퀴즈 옵션 스타일
  optionsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  selectedOptionCircle: {
    backgroundColor: '#0095F6',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555'
  },
  selectedOptionLetter: {
    color: 'white'
  },
  selectedOption: {
    borderColor: '#0095F6',
    backgroundColor: '#F0F9FF'
  },
  optionText: {
    fontSize: 14,
    color: '#262626',
    flex: 1
  },
  selectedOptionText: {
    fontWeight: '500',
    color: '#262626'
  },
  date: { 
    fontSize: 11, 
    color: '#8e8e8e',
    marginTop: 4
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 8,
    marginBottom: 8
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#0095F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    height: 300
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16
  },
  refreshButton: {
    backgroundColor: '#0095F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  // 탭바 스타일
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#DBDBDB',
    backgroundColor: 'white'
  },
  tabBarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4
  },
  tabProfilePic: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: '#DBDBDB'
  }
});