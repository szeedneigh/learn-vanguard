import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { queryClient, queryKeys } from '@/lib/queryClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing JWT token
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await authService.getCurrentUser();
          if (userData.success) {
            setUser(userData.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login({ email, password });
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', result.token);
        
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries(queryKeys.auth);
        queryClient.invalidateQueries(queryKeys.user(result.user.id));
        
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        
        return { success: true };
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred during login.',
        variant: 'destructive',
      });
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google (Firebase + Backend)
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        hd: 'student.laverdad.edu.ph' // Restrict to school domain
      });
      
      const firebaseResult = await signInWithPopup(auth, provider);
      const firebaseUser = firebaseResult.user;
      
      // Check domain restriction
      if (!firebaseUser.email.endsWith('@student.laverdad.edu.ph')) {
        await firebaseSignOut(auth);
        toast({
          title: 'Access Denied',
          description: 'Please use your @student.laverdad.edu.ph email address.',
          variant: 'destructive',
        });
        return { success: false, error: 'Invalid email domain' };
      }
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Authenticate with backend
      const result = await authService.loginWithGoogle(idToken);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', result.token);
        
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries(queryKeys.auth);
        queryClient.invalidateQueries(queryKeys.user(result.user.id));
        
        toast({
          title: 'Welcome!',
          description: 'You have been successfully logged in with Google.',
        });
        
        return { success: true };
      } else {
        // Sign out from Firebase if backend authentication failed
        await firebaseSignOut(auth);
        toast({
          title: 'Authentication Failed',
          description: result.error || 'Unable to complete Google sign-in.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Google login error:', error);
      await firebaseSignOut(auth);
      
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in was cancelled' };
      }
      
      toast({
        title: 'Google Sign-in Error',
        description: 'Unable to sign in with Google. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: 'Google sign-in failed' };
    } finally {
      setLoading(false);
    }
  };

  // Two-step registration process
  const initiateSignup = async (email, name) => {
    try {
      setLoading(true);
      const result = await authService.initiateSignup({ email, name });
      
      if (result.success) {
        toast({
          title: 'Registration Initiated',
          description: 'Please check your email for the verification code.',
        });
        return { success: true, registrationId: result.registrationId };
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Unable to initiate registration.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration initiation error:', error);
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred during registration.',
        variant: 'destructive',
      });
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (registrationId, verificationCode, password, additionalData) => {
    try {
      setLoading(true);
      const result = await authService.completeSignup({
        registrationId,
        verificationCode,
        password,
        ...additionalData
      });
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', result.token);
        
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries(queryKeys.auth);
        queryClient.invalidateQueries(queryKeys.user(result.user.id));
        
        toast({
          title: 'Registration Complete',
          description: 'Your account has been created successfully!',
        });
        
        return { success: true };
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Unable to complete registration.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration completion error:', error);
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred during registration.',
        variant: 'destructive',
      });
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Password reset flow
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      const result = await authService.requestPasswordReset(email);
      
      if (result.success) {
        toast({
          title: 'Reset Email Sent',
          description: 'Please check your email for the reset code.',
        });
      return { success: true };
      } else {
        toast({
          title: 'Reset Failed',
          description: result.error || 'Unable to send reset email.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        title: 'Reset Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return { success: false, error: 'Reset failed' };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (email, code) => {
    try {
      const result = await authService.verifyResetCode(email, code);
      
      if (result.success) {
        return { success: true, resetToken: result.resetToken };
      } else {
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid or expired code.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Reset code verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return { success: false, error: 'Verification failed' };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      const result = await authService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        toast({
          title: 'Password Reset',
          description: 'Your password has been reset successfully.',
        });
        return { success: true };
      } else {
        toast({
          title: 'Reset Failed',
          description: result.error || 'Unable to reset password.',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Reset Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return { success: false, error: 'Reset failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Logout from backend
      await authService.logout();
      
      // Logout from Firebase if logged in
      if (firebaseUser) {
        await firebaseSignOut(auth);
      }
      
      // Clear local state
      setUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      
      // Clear React Query cache
      queryClient.clear();
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout request fails
      setUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      queryClient.clear();
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Get user permissions based on role
  const getPermissions = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'ADMIN':
        return ['*']; // Admin has all permissions
      case 'PIO':
        return [
          'tasks:create',
          'tasks:read',
          'tasks:update',
          'tasks:delete',
          'users:read',
          'users:update',
          'events:create',
          'events:read',
          'events:update',
          'events:delete',
          'resources:create',
          'resources:read',
          'resources:update',
          'resources:delete',
          'announcements:create',
          'announcements:read',
          'announcements:update',
          'announcements:delete',
        ];
      case 'STUDENT':
        return [
          'tasks:read',
          'tasks:update', // Only own tasks
          'events:read',
          'resources:read',
          'announcements:read',
        ];
      default:
        return [];
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  };

  const value = {
    // State
    user,
    firebaseUser,
    loading,
    isAuthenticated,
    
    // Authentication methods
    login,
    loginWithGoogle,
    logout,
    
    // Registration methods
    initiateSignup,
    completeSignup,
    
    // Password reset methods
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    
    // Permission methods
    hasRole,
    hasAnyRole,
    hasPermission,
    getPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export { AuthContext }; 