const IS_DEV = process.env.NODE_ENV === 'development';

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
      apiUrl: IS_DEV 
        ? "http://localhost:8080"
        : "http://13.125.111.127:8080", // EC2 실제 URL
      eas: {
        projectId: "여기에_EAS_프로젝트_ID_입력_또는_삭제"
      }
    }
  }
}; 