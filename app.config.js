// NODE_ENV 기반으로 환경 판단 (Node.js 환경에서 안전)
const IS_DEV = process.env.NODE_ENV === 'production' 
  ? false  // NODE_ENV=production이면 강제로 false
  : (process.env.NODE_ENV !== 'production');  // 그 외는 개발환경으로 간주

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
      // 로컬 백엔드 사용으로 변경
      apiUrl: "http://localhost:8080",  // 로컬 서버로 설정
      eas: {
        projectId: "여기에_EAS_프로젝트_ID_입력_또는_삭제"
      }
    }
  }
}; 