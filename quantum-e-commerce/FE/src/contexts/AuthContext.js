// src/contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { signatureService } from '../services/signatureService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  dilithiumKeyPair: null,
  isSignatureVerified: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        dilithiumKeyPair: action.payload.keyPair,
        isSignatureVerified: action.payload.signatureVerified,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'SET_SIGNATURE_VERIFIED':
      return {
        ...state,
        isSignatureVerified: action.payload,
      };
    
    case 'UPDATE_KEY_PAIR':
      return {
        ...state,
        dilithiumKeyPair: action.payload,
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const userData = await authService.getCurrentUser();
      if (userData) {
        // Load or generate Dilithium key pair
        const keyPair = await signatureService.getOrGenerateKeyPair(userData.id);
        
        // Verify existing signature if available
        const signatureVerified = await signatureService.verifyUserSignature(userData.id);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userData,
            keyPair,
            signatureVerified,
          },
        });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.login(credentials);
      const { user, tokens } = response;

      // Store tokens
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);

      // Generate or load Dilithium key pair
      const keyPair = await signatureService.getOrGenerateKeyPair(user.id);
      
      // Create digital signature for login verification
      const loginSignature = await signatureService.signLoginData({
        userId: user.id,
        timestamp: Date.now(),
        action: 'login',
      }, keyPair.privateKey);

      // Verify signature with backend
      const signatureVerified = await authService.verifyLoginSignature({
        userId: user.id,
        signature: loginSignature,
        publicKey: keyPair.publicKey,
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          keyPair,
          signatureVerified,
        },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      const { user, tokens } = response;

      // Generate new Dilithium key pair for new user
      const keyPair = await signatureService.generateKeyPair();
      
      // Store key pair securely
      await signatureService.storeKeyPair(user.id, keyPair);
      
      // Create initial signature for user verification
      const initialSignature = await signatureService.signUserData({
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        action: 'register',
      }, keyPair.privateKey);

      // Send signature to backend for storage
      await authService.storeUserSignature({
        userId: user.id,
        signature: initialSignature,
        publicKey: keyPair.publicKey,
      });

      // Store tokens
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          keyPair,
          signatureVerified: true,
        },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear signature data
      await signatureService.clearLocalData();
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Sign the profile update data
      const updateSignature = await signatureService.signUserData({
        userId: state.user.id,
        profileData,
        timestamp: Date.now(),
        action: 'profile_update',
      }, state.dilithiumKeyPair.privateKey);

      const updatedUser = await authService.updateProfile({
        ...profileData,
        signature: updateSignature,
      });

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const verifyUserIdentity = async () => {
    try {
      const verificationData = {
        userId: state.user.id,
        timestamp: Date.now(),
        action: 'identity_verification',
      };

      const signature = await signatureService.signUserData(
        verificationData,
        state.dilithiumKeyPair.privateKey
      );

      const isVerified = await authService.verifyUserIdentity({
        ...verificationData,
        signature,
        publicKey: state.dilithiumKeyPair.publicKey,
      });

      dispatch({ type: 'SET_SIGNATURE_VERIFIED', payload: isVerified });
      return isVerified;
    } catch (error) {
      console.error('Identity verification failed:', error);
      return false;
    }
  };

  const regenerateKeyPair = async () => {
    try {
      const newKeyPair = await signatureService.generateKeyPair();
      await signatureService.storeKeyPair(state.user.id, newKeyPair);
      
      // Update backend with new public key
      await authService.updatePublicKey({
        userId: state.user.id,
        publicKey: newKeyPair.publicKey,
      });

      dispatch({ type: 'UPDATE_KEY_PAIR', payload: newKeyPair });
      
      // Re-verify with new key pair
      await verifyUserIdentity();
      
      return newKeyPair;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    verifyUserIdentity,
    regenerateKeyPair,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};