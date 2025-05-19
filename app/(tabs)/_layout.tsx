// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();
  
  // + 버튼 클릭 시 게시물 작성 화면으로 이동
  const handleCreatePress = () => {
    router.push('/create-post');
  };

  return (
    <Tabs
      screenOptions={{
        // 인스타그램 스타일 탭바 색상
        tabBarActiveTintColor: '#4C89F5', // 더 선명한 파란색
        headerShown: false,
        // 개선된 바텀 탭 스타일
        tabBarStyle: {
          backgroundColor: 'white',
          height: 56,
          borderTopWidth: 0.5,
          borderTopColor: '#DBDBDB',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarButton: () => (
            <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
              <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: '저장',
          tabBarIcon: ({ color }) => <Ionicons name="bookmark-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 48, 
    height: 48,
    backgroundColor: '#FF6B6B',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});