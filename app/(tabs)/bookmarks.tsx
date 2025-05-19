import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>저장한 항목</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Ionicons name="bookmark" size={64} color="#ccc" />
        <Text style={styles.title}>저장한 항목 없음</Text>
        <Text style={styles.subtitle}>
          나중에 다시 찾아보고 싶은 게시물을 저장해보세요.
          북마크 아이콘을 탭하여 게시물을 저장할 수 있습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 