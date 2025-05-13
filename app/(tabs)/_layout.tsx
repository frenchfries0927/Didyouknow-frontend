// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 인스타그램 스타일 탭바 색상
        tabBarActiveTintColor: '#0095F6', // 인스타그램 파란색
        headerShown: false,
        // 간단한 바텀 탭 스타일
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0.5,
          borderTopColor: '#DBDBDB',
          elevation: 0,
        },
        // 'screenOptions'의 속성으로 'contentStyle'은 정의되어 있지 않으므로 제거
        // contentStyle: {
        //   backgroundColor: 'white'
        // }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '피드',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '탐색',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
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