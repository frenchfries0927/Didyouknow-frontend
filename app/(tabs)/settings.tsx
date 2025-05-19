import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoogleAuth } from '../utils/auth';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useGoogleAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/screens/LoginScreen');
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 알림 설정 버튼 */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/alarm-settings')}>
        <Ionicons name="notifications-outline" size={20} color="#4FC3F7" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>알림 설정</Text>
      </TouchableOpacity>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={[styles.button, styles.logoutBtn]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF5A5F" style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: '#FF5A5F' }]}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#FFF0F0',
  },
}); 