import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AlarmSetup from '../(auth)/AlarmSetup';
import ProfileSetup from '../(auth)/ProfileSetup';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useGoogleAuth } from '../utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { checkAuth } = useGoogleAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showProfileSetup, setShowProfileSetup] = React.useState(false);
  const [showAlarmSetup, setShowAlarmSetup] = React.useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log('Checking login status...');
        const isAuthenticated = await checkAuth();
        console.log('Is authenticated:', isAuthenticated);
        if (isAuthenticated) {
          console.log('User is authenticated, navigating to tabs...');
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // 테스트용: 회원가입 플로우 직접 확인
  if (showProfileSetup) {
    return (
      <ProfileSetup
        onClose={() => setShowProfileSetup(false)}
        onNext={() => {
          setShowProfileSetup(false);
          setShowAlarmSetup(true);
        }}
      />
    );
  }
  if (showAlarmSetup) {
    return (
      <AlarmSetup
        onClose={() => setShowAlarmSetup(false)}
        onComplete={async (isEnabled, hour) => {
          setShowAlarmSetup(false);
          // 회원가입 완료 후 이동 등 추가 가능
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Did You Know?</Text>
        <Text style={styles.subtitle}>로그인하고 새로운 지식을 발견해보세요</Text>
      </View>
      
      <View style={styles.content}>
        <GoogleSignInButton />
        {/* 테스트용 버튼: 회원가입 플로우 확인 */}
        <TouchableOpacity style={styles.testBtn} onPress={() => setShowProfileSetup(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>회원가입 플로우 테스트</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    paddingBottom: 50,
  },
  testBtn: {
    marginTop: 24,
    backgroundColor: '#FF5A5F',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
}); 