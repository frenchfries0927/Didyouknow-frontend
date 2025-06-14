import { Share, Alert, Platform, Linking } from 'react-native';

export interface ShareData {
  shareUrl: string;
  shareText: string;
  title: string;
  author: string;
}

// 기본 공유 기능
export const sharePost = async (shareData: ShareData) => {
  console.log('sharePost 함수 호출됨:', shareData);
  
  try {
    const message = shareData.shareText;
    console.log('공유할 메시지:', message);
    
    const shareOptions = {
      message: Platform.OS === 'ios' ? message : message,
      url: Platform.OS === 'ios' ? shareData.shareUrl : undefined,
      title: shareData.title,
    };
    console.log('공유 옵션:', shareOptions);

    console.log('Share.share 호출 중...');
    const result = await Share.share(shareOptions);
    console.log('Share.share 결과:', result);
    
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('공유됨:', result.activityType);
      } else {
        console.log('공유됨');
      }
    } else if (result.action === Share.dismissedAction) {
      console.log('공유 취소됨');
    }
  } catch (error) {
    console.error('공유 실패:', error);
    
    // 웹 환경에서는 fallback 처리
    if (Platform.OS === 'web') {
      console.log('웹 환경 감지 - 브라우저 공유 시도');
      try {
        if (navigator.share) {
          await navigator.share({
            title: shareData.title,
            text: shareData.shareText,
            url: shareData.shareUrl,
          });
          console.log('웹 공유 성공');
        } else {
          // Web Share API가 지원되지 않는 경우
          console.log('Web Share API 미지원 - 클립보드로 복사');
          await navigator.clipboard.writeText(`${shareData.shareText}\n${shareData.shareUrl}`);
          alert('링크가 클립보드에 복사되었습니다!');
        }
      } catch (webError) {
        console.error('웹 공유 실패:', webError);
        alert(`공유 실패: ${shareData.shareText}\n${shareData.shareUrl}`);
      }
    } else {
      Alert.alert('오류', '공유하는 중 오류가 발생했습니다.');
    }
  }
};

// 링크 복사하기 (간단한 알림으로 대체)
export const copyLink = async (shareUrl: string) => {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert(`링크: ${shareUrl}\n\n링크를 복사해주세요.`);
    }
  } else {
    Alert.alert(
      '링크 공유',
      `링크: ${shareUrl}\n\n링크를 길게 눌러 복사하세요.`,
      [
        { text: '닫기', style: 'cancel' },
        { 
          text: '다른 앱으로 공유', 
          onPress: () => sharePost({ shareUrl, shareText: `링크: ${shareUrl}`, title: '게시글 링크', author: '' })
        }
      ]
    );
  }
};

// 카카오톡 공유 (웹뷰 방식)
export const shareToKakao = async (shareData: ShareData) => {
  try {
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/?url=${encodeURIComponent(shareData.shareUrl)}&text=${encodeURIComponent(shareData.shareText)}`;
    
    if (Platform.OS === 'web') {
      window.open(kakaoUrl, '_blank');
    } else {
      const supported = await Linking.canOpenURL(kakaoUrl);
      if (supported) {
        await Linking.openURL(kakaoUrl);
      } else {
        Alert.alert('오류', '카카오톡이 설치되어 있지 않습니다.');
      }
    }
  } catch (error) {
    console.error('카카오톡 공유 실패:', error);
    if (Platform.OS === 'web') {
      alert('카카오톡 공유 중 오류가 발생했습니다.');
    } else {
      Alert.alert('오류', '카카오톡 공유 중 오류가 발생했습니다.');
    }
  }
};

// 공유 옵션 메뉴 표시
export const showShareOptions = (shareData: ShareData) => {
  console.log('showShareOptions 호출됨:', shareData);
  
  try {
    console.log('Alert.alert 호출 시작...');
    
    // 웹 환경에서는 confirm으로 처리
    if (Platform.OS === 'web') {
      console.log('웹 환경 감지 - 브라우저 confirm 사용');
      const choice = confirm(`"${shareData.title}"을(를) 공유하시겠습니까?\n\n옵션:\n1. 확인 - 기본 공유\n2. 취소 - 카카오톡 공유`);
      
      if (choice) {
        console.log('기본 공유 선택됨');
        sharePost(shareData);
      } else {
        console.log('카카오톡 공유 선택됨');
        shareToKakao(shareData);
      }
      return;
    }
    
    Alert.alert(
      '공유하기',
      `"${shareData.title}"을(를) 공유하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => console.log('공유 취소됨'),
        },
        {
          text: '링크 복사',
          onPress: () => {
            console.log('링크 복사 선택됨');
            copyLink(shareData.shareUrl);
          },
        },
        {
          text: '카카오톡',
          onPress: () => {
            console.log('카카오톡 공유 선택됨');
            shareToKakao(shareData);
          },
        },
        {
          text: '기타 앱',
          onPress: () => {
            console.log('기타 앱 공유 선택됨');
            sharePost(shareData);
          },
        },
      ],
      { cancelable: true }
    );
    console.log('Alert.alert 호출 완료');
  } catch (error) {
    console.error('Alert.alert 호출 중 오류:', error);
    
    // Alert 실패 시 기본 공유로 폴백
    console.log('기본 공유로 폴백 시도...');
    sharePost(shareData);
  }
}; 