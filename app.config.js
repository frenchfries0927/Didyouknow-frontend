// Expo에서는 __DEV__ 사용 (NODE_ENV가 항상 설정되지 않음)
const IS_DEV = __DEV__ || process.env.NODE_ENV === 'development';

export default {
  expo: {
    name: "didyouknow",
    slug: "didyouknow",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.didyouknow.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.didyouknow.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "didyouknow",
    extra: {
      googleClientId: "여기에_실제_구글_클라이언트_ID_입력",
      // 환경별 자동 분기
      apiUrl: IS_DEV 
        ? "http://localhost:8080"        // 개발환경: 로컬 서버
        : "http://13.125.111.127:8080",  // 프로덕션환경: EC2 서버
      eas: {
        projectId: "여기에_EAS_프로젝트_ID_입력_또는_삭제"
      }
    }
  }
}; 