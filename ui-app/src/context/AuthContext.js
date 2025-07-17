// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

// Auth state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  directMode: false, // For ALB direct access
};

// Auth actions
const AUTH_ACTIONS = {
  SIGN_IN_START: 'SIGN_IN_START',
  SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
  SIGN_IN_ERROR: 'SIGN_IN_ERROR',
  SIGN_OUT: 'SIGN_OUT',
  SET_LOADING: 'SET_LOADING',
  ENABLE_DIRECT_MODE: 'ENABLE_DIRECT_MODE',
  DISABLE_DIRECT_MODE: 'DISABLE_DIRECT_MODE',
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SIGN_IN_START:
      return {
        ...state,
        isLoading: true,
      };
    case AUTH_ACTIONS.SIGN_IN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case AUTH_ACTIONS.SIGN_IN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        directMode: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.ENABLE_DIRECT_MODE:
      return {
        ...state,
        directMode: true,
        isAuthenticated: true,
        isLoading: false,
        user: { username: 'direct-mode-user' },
        token: 'direct-mode-bypass',
      };
    case AUTH_ACTIONS.DISABLE_DIRECT_MODE:
      return {
        ...state,
        directMode: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        const token = await authService.getAccessToken();
        
        dispatch({
          type: AUTH_ACTIONS.SIGN_IN_SUCCESS,
          payload: { user, token },
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const signIn = async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SIGN_IN_START });
      
      const user = await authService.signIn(username, password);
      const token = await authService.getAccessToken();
      
      dispatch({
        type: AUTH_ACTIONS.SIGN_IN_SUCCESS,
        payload: { user, token },
      });
      
      return user;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SIGN_IN_ERROR });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    } catch (error) {
      console.error('Error signing out:', error);
      // Still sign out locally even if remote signout fails
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      const user = await authService.getCurrentUser();
      
      dispatch({
        type: AUTH_ACTIONS.SIGN_IN_SUCCESS,
        payload: { user, token: newToken },
      });
      
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      throw error;
    }
  };

  // Development helpers
  const enableDirectMode = async () => {
    try {
      await authService.enableDirectMode();
      dispatch({ type: AUTH_ACTIONS.ENABLE_DIRECT_MODE });
      console.log('🔧 Direct mode enabled - bypassing Cognito authentication');
    } catch (error) {
      console.error('Error enabling direct mode:', error);
    }
  };

  const disableDirectMode = async () => {
    try {
      await authService.signOut();
      dispatch({ type: AUTH_ACTIONS.DISABLE_DIRECT_MODE });
      console.log('🔐 Direct mode disabled - Cognito authentication required');
    } catch (error) {
      console.error('Error disabling direct mode:', error);
    }
  };

  const value = {
    ...state,
    signIn,
    signOut,
    refreshToken,
    enableDirectMode,
    disableDirectMode,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}