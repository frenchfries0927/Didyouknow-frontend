// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 모의 사용자 데이터
const user = {
  username: '김지현',
  userId: '@jihyun_kim',
  profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
  posts: 42,
  followers: 1258,
  following: 76,
  bio: '안녕하세요! 일상의 작은 지식들을 공유하고 배우는 것을 좋아합니다. 커피와 독서를 사랑하는 평범한 지식 탐험가입니다. 😊',
  postImages: Array.from({ length: 9 }, (_, i) => ({
    id: i,
    imageUrl: `https://picsum.photos/id/${i + 200}/300/300`
  })),
  hasBadge: true
};

export default function ProfilePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Ionicons name="chevron-back" size={24} color="#222" />
        <Text style={styles.topBarTitle}>프로필</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      {/* 프로필 정보 */}
      <View style={styles.profileRow}>
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          {user.hasBadge && (
            <View style={styles.badgeIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#4FC3F7" />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{user.username}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>프로필 편집</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.posts}</Text>
          <Text style={styles.statLabel}>게시물</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>팔로워</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.following}</Text>
          <Text style={styles.statLabel}>팔로잉</Text>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Ionicons name="grid-outline" size={22} color="#FF5A5F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="heart-outline" size={22} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="bookmark-outline" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {/* 게시물 그리드 */}
      <FlatList
        data={user.postImages}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.postImageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
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
  }
});