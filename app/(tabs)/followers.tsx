import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { followApi, FollowUser } from '../../services/api';

export default function FollowersPage() {
  const router = useRouter();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const followersData = await followApi.getMyFollowers();
      setFollowers(followersData);
    } catch (error) {
      console.error('팔로워 목록 로딩 실패:', error);
      Alert.alert('오류', '팔로워 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderFollowerItem = ({ item }: { item: FollowUser }) => (
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
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>팔로우</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>팔로워 목록을 불러오는 중...</Text>
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
        <Text style={styles.topBarTitle}>팔로워</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 팔로워 목록 */}
      <FlatList
        data={followers}
        renderItem={renderFollowerItem}
        keyExtractor={item => item.userId.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>아직 팔로워가 없습니다</Text>
            <Text style={styles.emptySubText}>다른 사용자들과 소통해보세요!</Text>
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
  followButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  followButtonText: {
    color: '#fff',
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