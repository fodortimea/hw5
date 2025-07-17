export default {
  expo: {
    name: "Pet Store App",
    slug: "pet-store-app",
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
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api-placeholder.eu-west-1.amazonaws.com/dev',
      albBaseUrl: process.env.EXPO_PUBLIC_ALB_BASE_URL || 'http://alb-placeholder.eu-west-1.elb.amazonaws.com',
      cognitoUserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || 'eu-west-1_PLACEHOLDER',
      cognitoClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '3e69b0qafisul0t968iv04jp3c',
      cognitoRegion: process.env.EXPO_PUBLIC_COGNITO_REGION || 'eu-west-1',
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
    }
  }
};
