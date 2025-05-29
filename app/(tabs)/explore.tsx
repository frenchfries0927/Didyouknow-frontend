// app/(tabs)/explore.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { userApi } from '../services/api/endpoints/user';
import { followApi } from '../services/api/endpoints/follow';
import { FollowUser } from '../services/api/types';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 모의 게시물 데이터
  const exploreMockData = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    imageUrl: `https://picsum.photos/id/${i + 100}/300/300`
  }));

  const searchUsers = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const results = await userApi.searchUsers(searchKeyword);
      console.log('사용자 검색 결과:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      Alert.alert('오류', '사용자 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId: number, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await followApi.unfollow(userId);
        Alert.alert('성공', '언팔로우 되었습니다.');
      } else {
        await followApi.follow(userId);
        Alert.alert('성공', '팔로우 되었습니다.');
      }
      
      // 상태 업데이트
      setSearchResults(prev => 
        prev.map(user => 
          user.userId === userId 
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );
    } catch (error) {
      console.error('팔로우 토글 실패:', error);
      Alert.alert('오류', '팔로우 상태 변경에 실패했습니다.');
    }
  };

  const renderUserItem = ({ item }: { item: FollowUser }) => (
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
        style={[
          styles.followButton, 
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => handleFollowToggle(item.userId, item.isFollowing || false)}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? '팔로잉' : '팔로우'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>탐색</Text>
      </View>

      {/* 검색 입력 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'users' ? "사용자 닉네임을 검색하세요" : "게시물을 검색하세요"}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={activeTab === 'users' ? searchUsers : undefined}
            returnKeyType="search"
          />
        </View>
        {activeTab === 'users' && (
          <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        )}
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
          <Text style={[
            styles.tabText,
            activeTab === 'posts' && styles.activeTabText
          ]}>게시물</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons 
            name="people-outline" 
            size={22} 
            color={activeTab === 'users' ? "#FF5A5F" : "#888"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'users' && styles.activeTabText
          ]}>사용자</Text>
        </TouchableOpacity>
      </View>

      {/* 컨텐츠 */}
      {activeTab === 'posts' ? (
        <FlatList
          data={exploreMockData}
          numColumns={3}
          renderItem={renderPostItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5A5F" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item, index) => item?.userId?.toString() || `user-${index}`}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                searchKeyword ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                    <Text style={styles.emptySubText}>다른 키워드로 검색해보세요</Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>사용자를 검색해보세요</Text>
                    <Text style={styles.emptySubText}>닉네임으로 다른 사용자를 찾을 수 있습니다</Text>
                  </View>
                )
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const imageSize = width / 3 - 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222'
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8'
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#222'
  },
  searchButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#FF5A5F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginLeft: 4
  },
  activeTabText: {
    color: '#FF5A5F'
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: 1
  },
  image: {
    width: '100%',
    height: '100%'
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    marginTop: 4,
    textAlign: 'center'
  }
});