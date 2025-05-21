import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useGoogleAuth } from '../utils/auth';

const GoogleSignInButton = () => {
  const router = useRouter();
  const { signIn } = useGoogleAuth();

  const handleSignIn = async () => {
    try {
      const result = await signIn();
      if (result.success) {
        console.log('Successfully signed in with Google');
        if (result.requiresProfile) {
          console.log('Profile setup required, navigating to signup flow...');
          router.replace('/(auth)/SignupFlow');
        } else {
          console.log('Profile already set up, navigating to tabs...');
          router.replace('/(tabs)');
        }
      } else {
        console.log('Failed to sign in with Google');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignIn}>
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoogleSignInButton; 