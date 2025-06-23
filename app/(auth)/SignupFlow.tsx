import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import AlarmSetup from './AlarmSetup';
import ProfileSetup from './ProfileSetup';

// API URL 가져오기
const getApiUrl = () => {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) {
    return configuredUrl;
  }
  return __DEV__ ? 'http://localhost:8080' : 'http://13.125.111.127:8080';
};

const API_URL = getApiUrl();

export default function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<{ nickname: string; profileImage: string | null }>({ nickname: '', profileImage: null });
  const [alarm, setAlarm] = useState<{ enabled: boolean; hour: number }>({ enabled: true, hour: 9 });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('@jwt');
      console.log('📦 [useEffect] 토큰:', t);
      setToken(t);
    })();
  }, []);

  // 프로필 입력 완료 시
  const handleProfileNext = (nickname: string, profileImage: string | null) => {
    console.log('[ProfileSetup] handleProfileNext 호출', { nickname, profileImage });
    setProfile({ nickname, profileImage });
    setStep(2);
  };

  // 알람 입력 완료 시
  const handleAlarmComplete = async (enabled: boolean, hour: number) => {
    setAlarm({ enabled, hour });
    console.log('[AlarmSetup] handleAlarmComplete 호출', { enabled, hour });
    console.log('[AlarmSetup] token:', token);
    // 여기서 profile + alarm 정보를 백엔드로 전송
    try {
      // API 엔드포인트에 동적 URL 사용
      console.log('[AlarmSetup] fetch 요청 직전', {
        nickname: profile.nickname,
        profileImage: profile.profileImage,
        alarmEnabled: enabled,
        alarmHour: hour,
        token,
        apiUrl: API_URL,
      });
      await fetch(`${API_URL}/api/users/me/complete-profile`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile.nickname,
          profileImage: profile.profileImage,
          alarmEnabled: enabled,
          alarmHour: hour,
        }),
      });
      console.log('[AlarmSetup] fetch 요청 완료');
    } catch (e) {
      // 에러 처리
      console.error('추가 정보 전송 실패:', e);
    }
    // 완료 후 메인 탭으로 이동
    router.replace('/(tabs)');
  };

  if (step === 1) {
    return <ProfileSetup onNext={handleProfileNext} onClose={() => {}} />;
  }
  if (step === 2) {
    return <AlarmSetup onComplete={handleAlarmComplete} onClose={() => {}} />;
  }
  return null;
} 