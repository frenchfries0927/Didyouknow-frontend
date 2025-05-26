// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { userApi, UserProfile, UserPost } from '../../services/api';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'bookmarks'>('posts');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, postsData] = await Promise.all([
        userApi.getMyProfile(),
        userApi.getMyPosts()
      ]);
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      console.error('프로필 데이터 로딩 실패:', error);
      Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }: { item: UserPost }) => (
    <View style={styles.postImageContainer}>
      {item.imageUrls && item.imageUrls.length > 0 ? (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.postImage} />
      ) : (
        <View style={[styles.postImage, styles.noImagePost]}>
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>프로필 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Ionicons name="chevron-back" size={24} color="#222" />
        <Text style={styles.topBarTitle}>프로필</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 프로필 정보 */}
      <View style={styles.profileRow}>
        <View style={styles.profileImageWrapper}>
          <Image 
            source={{ 
              uri: profile.profileImageUrl || 'https://via.placeholder.com/64x64/FF5A5F/FFFFFF?text=U' 
            }} 
            style={styles.profileImage} 
          />
          {profile.hasBadge && (
            <View style={styles.badgeIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#4FC3F7" />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile.nickname}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>프로필 편집</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.postsCount}</Text>
          <Text style={styles.statLabel}>게시물</Text>
        </View>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => router.push('/followers')}
        >
          <Text style={styles.statNumber}>{profile.followersCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>팔로워</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => router.push('/following')}
        >
          <Text style={styles.statNumber}>{profile.followingCount}</Text>
          <Text style={styles.statLabel}>팔로잉</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons 
            name="grid-outline" 
            size={22} 
            color={activeTab === 'posts' ? "#FF5A5F" : "#888"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Ionicons 
            name="heart-outline" 
            size={22} 
            color={activeTab === 'likes' ? "#FF5A5F" : "#888"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={22} 
            color={activeTab === 'bookmarks' ? "#FF5A5F" : "#888"} 
          />
        </TouchableOpacity>
      </View>

      {/* 게시물 그리드 */}
      {activeTab === 'posts' && (
        <FlatList
          data={posts}
          numColumns={3}
          renderItem={renderPostItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="camera-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>아직 게시물이 없습니다</Text>
              <Text style={styles.emptySubText}>첫 번째 게시물을 작성해보세요!</Text>
            </View>
          }
        />
      )}

      {activeTab === 'likes' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>좋아요한 게시물이 없습니다</Text>
        </View>
      )}

      {activeTab === 'bookmarks' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>북마크한 게시물이 없습니다</Text>
        </View>
      )}
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
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff',
    marginBottom: 4
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222'
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8
  },
  profileImageWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#FF5A5F'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222'
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14
  },
  editButtonText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
    fontSize: 13
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    color: '#888'
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff',
    marginBottom: 2
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#FF5A5F',
  },
  postImageContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
    backgroundColor: '#fff'
  },
  postImage: {
    flex: 1,
    borderRadius: 4
  },
  noImagePost: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  postTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500'
  },
  badgeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500'
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4
  }
});