import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FeedItem } from '../../services/api/types';

type BaseCardProps = {
  feed: FeedItem;
  liked: boolean;
  onLike: () => void;
  onComment: () => void;
  children: React.ReactNode;
};

export default function BaseCard({ feed, liked, onLike, onComment, children }: BaseCardProps) {
  return (
    <View style={styles.card}>
      {/* 게시물 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
              <Text style={[styles.feedType, feed.type === 'knowledge' ? styles.knowledgeType : styles.quizType]}>
                {feed.type === 'knowledge' ? '그거 아세요?' : '맞춰보실래요?'}
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
            onPress={onLike}
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
            onPress={onComment}
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