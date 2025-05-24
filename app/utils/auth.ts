import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
const webClientId = "917819112239-aq416kciqn8lvj0ct4jqvl4ov6h5gvcu.apps.googleusercontent.com";
const androidClientId = "917819112239-jt7leg7kfjn28mo18p95padp61pelt62.apps.googleusercontent.com";

// Backend API URL
const API_URL = 'http://localhost:8080'; // 로컬 개발 서버

// Verify JWT with backend
const verifyToken = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Get JWT token from backend
const getJWTFromBackend = async (googleToken: string) => {
  try {
    console.log('Attempting to connect to backend at:', API_URL);
    console.log('Sending token:', googleToken);
    
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });

    console.log('Backend response status:', response.status);
    const responseText = await response.text();
    console.log('Backend raw response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to get JWT from backend: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed backend response:', data);
    return data;
  } catch (error) {
    console.error('Detailed error getting JWT from backend:', error);
    return null;
  }
};

// Auth hook for Google Sign In
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    clientId: webClientId,
    responseType: "id_token",
    scopes: ['profile', 'email'],
  });

  const signIn = async () => {
    try {
      console.log('Starting auth flow...');
      const result = await promptAsync();
      console.log('Auth Result:', result);
      
      if (result?.type === 'success') {
        const googleToken = result.params?.id_token;
        console.log('Google ID Token:', googleToken);
        
        if (googleToken) {
          const response = await getJWTFromBackend(googleToken);
          console.log('Backend response:', response);
          
          if (response?.code === 200 && response?.data) {
            const { token, user } = response.data;
            console.log('Token received:', token ? 'Yes' : 'No');
            console.log('User data received:', user ? 'Yes' : 'No');
            
            try {
              if (token) {
                console.log('Attempting to store JWT...');
                await AsyncStorage.setItem('@jwt', token);
                console.log('JWT stored successfully');
                
                if (user) {
                  console.log('Attempting to store user data...');
                  const userString = JSON.stringify(user);
                  console.log('User data stringified:', userString);
                  await AsyncStorage.setItem('@user', userString);
                  console.log('User data stored successfully');
                }
                
                // Verify storage
                const storedToken = await AsyncStorage.getItem('@jwt');
                const storedUser = await AsyncStorage.getItem('@user');
                console.log('Verification - Stored token exists:', !!storedToken);
                console.log('Verification - Stored user exists:', !!storedUser);
                
                if (storedToken && storedUser) {
                  console.log('Successfully verified stored data');
                  return true;
                } else {
                  console.log('Storage verification failed');
                  return false;
                }
              }
            } catch (storageError) {
              console.error('Error storing data in AsyncStorage:', storageError);
              return false;
            }
          }
          console.log('Invalid response structure:', response);
        }
      }
      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@jwt');
      await AsyncStorage.removeItem('@user');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('@jwt');
    } catch (error) {
      console.error('Error getting JWT:', error);
      return null;
    }
  };

  const getStoredUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('@user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  };

  // Check if user is logged in and token is valid
  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (!token) return false;
      
      // Verify token with backend
      const isValid = await verifyToken(token);
      if (!isValid) {
        // If token is invalid, clear stored data
        await signOut();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  return {
    signIn,
    signOut,
    getToken,
    getStoredUser,
    checkAuth,
    request,
  };
}; 