import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useGoogleAuth } from '../utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { checkAuth } = useGoogleAuth();
  const [isLoading, setIsLoading] = React.useState(true);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Did You Know?</Text>
        <Text style={styles.subtitle}>로그인하고 새로운 지식을 발견해보세요</Text>
      </View>
      
      <View style={styles.content}>
        <GoogleSignInButton />
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
}); 