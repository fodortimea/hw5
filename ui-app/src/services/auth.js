// src/services/auth.js
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';
import { tokenStorage } from './api';

// Get Cognito configuration from environment (synced from Terraform)
const config = Constants.expoConfig?.extra || {};

if (!config.cognitoUserPoolId || !config.cognitoClientId) {
  console.warn('⚠️ Cognito configuration not found. Make sure to run ./scripts/sync-config.sh first.');
}

const authConfig = {
  region: config.cognitoRegion || 'eu-west-1',
  userPoolId: config.cognitoUserPoolId || 'eu-west-1_PLACEHOLDER',
  userPoolWebClientId: config.cognitoClientId || 'PLACEHOLDER_CLIENT_ID',
};

// Configure Amplify with dynamic config
try {
  if (config.cognitoUserPoolId && config.cognitoClientId) {
    Auth.configure(authConfig);
    
    console.log('🔐 Cognito Configuration:', {
      region: authConfig.region,
      userPoolId: authConfig.userPoolId,
      clientId: authConfig.userPoolWebClientId
    });
  } else {
    console.warn('⚠️ Cognito not configured - using development mode');
  }
} catch (error) {
  console.error('❌ Failed to configure Amplify:', error);
  console.warn('⚠️ Continuing without Amplify configuration');
}

export const authService = {
  async signIn(username, password) {
    try {
      const user = await Auth.signIn(username, password);
      
      // Get and store the access token
      const session = await Auth.currentSession();
      const accessToken = session.getAccessToken().getJwtToken();
      await tokenStorage.setToken(accessToken);
      
      console.log('✅ Sign in successful');
      return user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  },
  
  async signOut() {
    try {
      await Auth.signOut();
      await tokenStorage.removeToken();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Still remove local token even if Cognito signout fails
      await tokenStorage.removeToken();
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      return await Auth.currentAuthenticatedUser();
    } catch (error) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }
  },
  
  async getAccessToken() {
    try {
      const session = await Auth.currentSession();
      const token = session.getAccessToken().getJwtToken();
      await tokenStorage.setToken(token); // Update stored token
      return token;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      throw error;
    }
  },
  
  async refreshToken() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const session = await Auth.currentSession();
      const refreshToken = session.getRefreshToken();
      
      const newSession = await Auth.refreshSession(user, refreshToken);
      const newAccessToken = newSession.getAccessToken().getJwtToken();
      
      await tokenStorage.setToken(newAccessToken);
      console.log('✅ Token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      throw error;
    }
  },
  
  async isAuthenticated() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = await tokenStorage.getToken();
      return !!(user && token);
    } catch (error) {
      return false;
    }
  },
  
  // Helper for testing with manual token (when Cognito has issues)
  async setTestToken(token) {
    console.warn('🧪 Using test token - only for development');
    await tokenStorage.setToken(token);
    return token;
  },
  
  // Development helper for ALB direct access
  async enableDirectMode() {
    console.warn('🔧 Enabling direct ALB mode - bypassing authentication');
    await tokenStorage.setToken('direct-mode-bypass');
    return 'direct-mode-bypass';
  }
};