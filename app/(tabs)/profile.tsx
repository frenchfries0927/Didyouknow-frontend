// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 모의 사용자 데이터
const user = {
  username: '사용자',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  posts: 15,
  followers: 120,
  following: 150,
  bio: '알쓸신잡 애플리케이션 사용자입니다.',
  postImages: Array.from({ length: 9 }, (_, i) => ({
    id: i,
    imageUrl: `https://picsum.photos/id/${i + 200}/300/300`
  }))
};

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user.username}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>게시물</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>팔로워</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>팔로잉</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>{user.bio}</Text>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>프로필 편집</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Ionicons name="grid-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="person-outline" size={24} color="#8e8e8e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={user.postImages}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.postImageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
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
  username: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  menuButton: {
    padding: 5
  },
  profileSection: {
    flexDirection: 'row',
    padding: 15
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: 20
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e8e'
  },
  bio: {
    paddingHorizontal: 15,
    marginBottom: 15
  },
  editButton: {
    marginHorizontal: 15,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    alignItems: 'center'
  },
  editButtonText: {
    fontWeight: 'bold'
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#DBDBDB',
    marginTop: 15
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 10
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'black'
  },
  postImageContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1
  },
  postImage: {
    flex: 1
  }
});