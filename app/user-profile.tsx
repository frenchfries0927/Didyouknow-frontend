import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { userApi, followApi, UserProfile, UserPost } from '../services/api';

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      checkFollowStatus();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userApi.getUserProfile(Number(userId));
      const postsData = await userApi.getUserPosts(Number(userId));
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      console.error('사용자 프로필 로딩 실패:', error);
      Alert.alert('오류', '사용자 프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const status = await followApi.checkFollowStatus(Number(userId));
      setIsFollowing(status);
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await followApi.unfollow(Number(userId));
        setIsFollowing(false);
        Alert.alert('성공', '언팔로우 되었습니다.');
      } else {
        await followApi.follow(Number(userId));
        setIsFollowing(true);
        Alert.alert('성공', '팔로우 되었습니다.');
      }
    } catch (error) {
      console.error('팔로우 토글 실패:', error);
      Alert.alert('오류', '팔로우 상태 변경에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  const renderPostItem = ({ item }: { item: UserPost }) => (
    <TouchableOpacity 
      style={styles.postImageContainer}
      onPress={() => router.push(`/post-detail?postId=${item.id}`)}
    >
      {item.imageUrls && item.imageUrls.length > 0 ? (
        <Image 
          source={{ uri: item.imageUrls[0] }} 
          style={styles.postImage}
          onError={() => {
            // 이미지 로딩 실패 시 아무것도 하지 않음 (fallback은 아래에서 처리)
          }}
          defaultSource={{ uri: 'https://via.placeholder.com/150x150/f0f0f0/999999?text=No+Image' }}
        />
      ) : (
        <View style={[styles.postImage, styles.noImagePost]}>
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      )}
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{profile.nickname}</Text>
        <View style={{ width: 24 }} />
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
        <TouchableOpacity 
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={handleFollowToggle}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={isFollowing ? "#FF5A5F" : "#fff"} />
          ) : (
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? '팔로잉' : '팔로우'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 통계 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.postsCount}</Text>
          <Text style={styles.statLabel}>게시물</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.followersCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>팔로워</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.followingCount}</Text>
          <Text style={styles.statLabel}>팔로잉</Text>
        </View>
      </View>

      {/* 게시물 그리드 */}
      <View style={styles.postsHeader}>
        <Ionicons name="grid-outline" size={22} color="#222" />
        <Text style={styles.postsHeaderText}>게시물</Text>
      </View>

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
            <Text style={styles.emptyText}>게시물이 없습니다</Text>
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
  followButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center'
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5A5F'
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  followingButtonText: {
    color: '#FF5A5F'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
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
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    marginBottom: 2
  },
  postsHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginLeft: 4
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
  }
}); 