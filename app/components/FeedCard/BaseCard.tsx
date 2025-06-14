import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { FeedItem } from '../../services/api/types';

type BaseCardProps = {
  feed: FeedItem;
  liked: boolean;
  bookmarked?: boolean;
  showDeleteButton?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  children: React.ReactNode;
};

export default function BaseCard({ feed, liked, bookmarked, showDeleteButton, onLike, onComment, onShare, onBookmark, onDelete, onPress, children }: BaseCardProps) {
  console.log('BaseCard 렌더링:', {
    feedId: feed.id,
    showDeleteButton,
    hasOnDelete: !!onDelete,
    bookmarked
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* 게시물 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ 
              uri: feed.profileImageUrl || 
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(feed.author || '알+수+없음') 
            }} 
            style={styles.profileImage}
            onError={() => console.log('프로필 이미지 로딩 오류')} 
          />
          <View style={styles.headerTextContainer}>
            <View style={styles.authorRow}>
              <Text style={[styles.feedType, feed.type === 'knowledge' ? styles.knowledgeType : styles.quizType]}>
                {feed.type === 'knowledge' ? '그거 아세요?' : '맞춰보실래요?'}
              </Text>
              <Text style={styles.byText}>by</Text>
              <Text style={styles.authorName}>{feed.author || '알 수 없음'}</Text>
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
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation();
            console.log('더보기 버튼 클릭:', { showDeleteButton, onDelete: !!onDelete, bookmarked });
            
            // 웹과 모바일 환경 구분
            if (onDelete) {
              const deleteText = bookmarked ? '북마크에서 제거' : '게시물 삭제';
              const confirmMessage = `${deleteText}하시겠습니까?`;
              
              if (Platform.OS === 'web') {
                // 웹 환경
                if ((window as any).confirm(confirmMessage)) {
                  console.log('삭제 확인됨');
                  onDelete();
                } else {
                  console.log('삭제 취소됨');
                }
              } else {
                // 모바일 환경
                Alert.alert(
                  '확인',
                  confirmMessage,
                  [
                    { text: '취소', style: 'cancel' },
                    { text: deleteText, style: 'destructive', onPress: onDelete }
                  ]
                );
              }
            } else {
              if (Platform.OS === 'web') {
                (window as any).alert('신고 기능은 준비 중입니다.');
              } else {
                Alert.alert('알림', '신고 기능은 준비 중입니다.');
              }
            }
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#7d7d7d" />
        </TouchableOpacity>
      </View>

      {/* 게시물 내용 */}
      <View style={styles.content}>
        <Text style={styles.title}>{feed.title}</Text>
        
        {/* 게시물 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Image 
              source={{ uri: feed.imageUrl || `https://picsum.photos/seed/${feed.id}/400/240` }} 
              style={styles.feedImage} 
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 자식 컴포넌트 (Knowledge 또는 Quiz 내용) */}
        {children}
      </View>

      {/* 게시물 액션 */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onLike();
            }}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FF6B6B" : "#666"} 
            />
            <Text style={styles.actionCount}>{feed.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onComment();
            }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#666" />
            <Text style={styles.actionCount}>{feed.comments}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightActions}>
          {onBookmark && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
            >
              <Ionicons 
                name={bookmarked ? "bookmark" : "bookmark-outline"} 
                size={22} 
                color={bookmarked ? "#FF5A5F" : "#666"} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  actions: {
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
  rightActions: {
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
}); 