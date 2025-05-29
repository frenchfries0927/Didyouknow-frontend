import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { followApi } from '../services/api/endpoints/follow';
import { FollowUser } from '../services/api/types';

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      const followingData = await followApi.getMyFollowing();
      setFollowing(followingData);
    } catch (error) {
      console.error('팔로잉 목록 로딩 실패:', error);
      Alert.alert('오류', '팔로잉 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await followApi.unfollow(userId);
      // 목록에서 제거
      setFollowing(prev => prev.filter(user => user.userId !== userId));
      Alert.alert('성공', '언팔로우 되었습니다.');
    } catch (error) {
      console.error('언팔로우 실패:', error);
      Alert.alert('오류', '언팔로우에 실패했습니다.');
    }
  };

  const renderFollowingItem = ({ item }: { item: FollowUser }) => (
    <View style={styles.userItem}>
      <Image 
        source={{ 
          uri: item.profileImageUrl || 'https://via.placeholder.com/50x50/FF5A5F/FFFFFF?text=U' 
        }} 
        style={styles.profileImage} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.nickname}>{item.nickname}</Text>
      </View>
      <TouchableOpacity 
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item.userId)}
      >
        <Text style={styles.unfollowButtonText}>언팔로우</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>팔로잉 목록을 불러오는 중...</Text>
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
        <Text style={styles.topBarTitle}>팔로잉</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 팔로잉 목록 */}
      <FlatList
        data={following}
        renderItem={renderFollowingItem}
        keyExtractor={item => item.userId.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-add-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>아직 팔로잉하는 사용자가 없습니다</Text>
            <Text style={styles.emptySubText}>관심있는 사용자를 팔로우해보세요!</Text>
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
    backgroundColor: '#fff'
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222'
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8'
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222'
  },
  unfollowButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  unfollowButtonText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
    fontSize: 14
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
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