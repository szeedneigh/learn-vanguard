import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { auth, firebaseInitialized } from "@/config/firebase";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { queryClient, queryKeys } from "@/lib/queryClient";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseAvailable, setFirebaseAvailable] =
    useState(firebaseInitialized);
  const initializationInProgress = useRef(false);
  const authInitialized = useRef(false);
  const { toast } = useToast();

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    // Skip if already initialized or no token exists
    if (initializationInProgress.current) {
      console.log("AuthContext: Skipping initialization - already in progress");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("AuthContext: No auth token found in localStorage");
      setLoading(false);
      authInitialized.current = true;
      return;
    }

    try {
      console.log("AuthContext: Starting initialization with token");
      initializationInProgress.current = true;
      setLoading(true);

      // First do a quick client-side validation
      try {
        const decoded = jwtDecode(token);
        const isTokenExpired = decoded.exp < Date.now() / 1000;

        if (isTokenExpired) {
          console.warn("AuthContext: Token is expired, removing");
          localStorage.removeItem("authToken");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          initializationInProgress.current = false;
          authInitialized.current = true;
          return;
        }
      } catch (decodeError) {
        console.error("AuthContext: Error decoding token", decodeError);
        // Continue to server validation as a fallback
      }

      // Now verify with the server
      const response = await authService.verifyToken();
      console.log("AuthContext: Token verification result:", response);

      if (response && response.user) {
        console.log("AuthContext: Setting user from verification response");
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.warn(
          "AuthContext: Token verification failed or user not found"
        );
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("AuthContext: Auth initialization error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      initializationInProgress.current = false;
      authInitialized.current = true;
    }
  }, []);

  // Check for Google redirect results
  const checkGoogleRedirect = useCallback(async () => {
    if (!firebaseAvailable) {
      return;
    }

    try {
      const result = await authService.checkGoogleRedirectResult();

      if (!result) {
        // No redirect result found, nothing to do
        return;
      }

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);

        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries(queryKeys.auth);
        if (result.user?.id) {
          queryClient.invalidateQueries(queryKeys.user(result.user.id));
        }

        toast({
          title: "Welcome!",
          description: "You have been successfully logged in with Google.",
        });
      } else if (result.error) {
        toast({
          title: "Google Sign-in Failed",
          description: result.error || "Unable to complete Google sign-in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to process Google redirect:", error);
    }
  }, [toast, firebaseAvailable]);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple initializations
      if (authInitialized.current) {
        console.log("AuthContext: Already initialized, skipping");
        return;
      }

      try {
        // First check for Google redirect results if Firebase is available
        if (firebaseAvailable) {
          await checkGoogleRedirect();
        }

        // Then check for token-based authentication
        const token = localStorage.getItem("authToken");
        if (token) {
          console.log(
            "AuthContext: Found token in localStorage, initializing auth"
          );
          await initializeAuth();
        } else {
          console.log("AuthContext: No auth token found in localStorage");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          authInitialized.current = true;
        }
      } catch (error) {
        console.error("AuthContext: Error during initial auth check:", error);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        authInitialized.current = true;
      }
    };

    checkAuth();

    // Also make sure loading is set to false after a timeout to prevent UI being stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn(
          "AuthContext: Auth check timeout - forcing loading state to false"
        );
        setLoading(false);
        authInitialized.current = true;
        initializationInProgress.current = false;
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [initializeAuth, checkGoogleRedirect, firebaseAvailable]);

  // Add an effect to synchronize isAuthenticated state with user state
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      console.log(
        "AuthContext: User set, updating isAuthenticated to true",
        user
      );
    } else if (user === null && !loading) {
      setIsAuthenticated(false);
      console.log(
        "AuthContext: User is null, updating isAuthenticated to false"
      );
    }
  }, [user, loading]);

  // Listen to Firebase auth state changes
  useEffect(() => {
    let unsubscribe = () => {};

    // Only set up the listener if auth is available and Firebase is initialized
    if (auth && firebaseAvailable) {
      try {
        unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
          setFirebaseUser(firebaseUser);
        });
      } catch (error) {
        console.error("Failed to set up Firebase auth state listener:", error);
      }
    }

    // Listen for redirect result events from firebase.js
    const handleRedirectResult = (event) => {
      const { user } = event.detail;
      if (user) {
        setFirebaseUser(user);
      }
    };

    window.addEventListener("auth:redirect-result", handleRedirectResult);

    return () => {
      unsubscribe();
      window.removeEventListener("auth:redirect-result", handleRedirectResult);
    };
  }, [firebaseAvailable]);

  // Reset the initialization status when the token changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "authToken") {
        if (!event.newValue && event.oldValue) {
          // Token was removed
          console.log("AuthContext: Token removed from storage");
          setUser(null);
          setIsAuthenticated(false);
          authInitialized.current = true;
        } else if (event.newValue && !event.oldValue) {
          // New token added
          console.log("AuthContext: New token added to storage");
          // Only reinitialize if not already in progress
          if (!initializationInProgress.current) {
            authInitialized.current = false;
            initializeAuth();
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initializeAuth]);

  // Login with email and password
  const login = async (email, password) => {
    try {
      console.log("AuthContext: Starting login process...");
      setLoading(true);

      const result = await authService.login({ email, password });
      console.log("AuthContext: Login result:", {
        success: result.success,
        hasUser: !!result.user,
      });

      if (result.success && result.user) {
        // Important: Set user state before returning
        await Promise.all([
          (async () => {
            setUser(result.user);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", result.token);
          })(),
          // Invalidate and refetch user-related queries
          queryClient.invalidateQueries(queryKeys.auth),
          result.user?.id
            ? queryClient.invalidateQueries(queryKeys.user(result.user.id))
            : Promise.resolve(),
        ]);

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });

        return { success: true, user: result.user };
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
      });
      return { success: false, error: "Login failed" };
    } finally {
      setLoading(false);
      // Use the latest user state from result instead of the state variable
      console.log("AuthContext: Login process finished. User state updated.");
    }
  };

  // Login with Google (Firebase + Backend)
  const loginWithGoogle = async () => {
    // Check if Firebase is available
    if (!firebaseAvailable) {
      toast({
        title: "Google Sign-in Unavailable",
        description:
          "Google authentication is not configured. Please use email/password login.",
        variant: "destructive",
      });
      return {
        success: false,
        error: "Google authentication is not available",
      };
    }

    try {
      setLoading(true);

      // Use the updated loginWithGoogle function from authService
      const result = await authService.loginWithGoogle();

      // If redirect is in progress, just return
      if (result.inProgress) {
        return { success: false, inProgress: true };
      }

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);

        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries(queryKeys.auth);
        if (result.user?.id) {
          queryClient.invalidateQueries(queryKeys.user(result.user.id));
        }

        toast({
          title: "Welcome!",
          description: "You have been successfully logged in with Google.",
        });

        return { success: true };
      } else if (result.needsRegistration) {
        // Handle case where user needs to complete registration
        return {
          success: false,
          needsRegistration: true,
          email: result.email,
        };
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error || "Unable to complete Google sign-in.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Google login error:", error);

      toast({
        title: "Google Sign-in Error",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
      return {
        success: false,
        error: error.message || "Google sign-in failed",
      };
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
          title: "Registration Initiated",
          description: "Please check your email for the verification code.",
        });
        return { success: true, registrationId: result.registrationId };
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Unable to initiate registration.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Registration initiation error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
      return { success: false, error: "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (
    registrationId,
    verificationCode,
    password,
    additionalData
  ) => {
    try {
      setLoading(true);
      const result = await authService.completeSignup({
        registrationId,
        verificationCode,
        password,
        ...additionalData,
      });

      if (result.success) {
        localStorage.setItem("authToken", result.token);

        // Fetch user data after token is set
        const userDataResponse = await authService.getCurrentUser();

        if (userDataResponse && userDataResponse.user) {
          setUser(userDataResponse.user);
          setIsAuthenticated(true);
          console.log(
            "AuthContext: Signup complete, user data loaded:",
            userDataResponse.user
          );
          toast({
            title: "Account Created!",
            description: "You have successfully created your account.",
          });
          return { success: true };
        } else {
          console.error(
            "AuthContext: Failed to fetch user data after signup completion."
          );
          localStorage.removeItem("authToken");
          setUser(null);
          setIsAuthenticated(false);
          toast({
            title: "Signup Completed, but failed to load user data",
            description: "Please try logging in.",
            variant: "destructive",
          });
          return { success: false, error: "Failed to load user data" };
        }
      } else {
        toast({
          title: "Signup Failed",
          description: result.error || "Unable to complete registration.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Registration completion error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
      return { success: false, error: "Registration failed" };
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
          title: "Reset Email Sent",
          description: "Please check your email for the reset code.",
        });
        return { success: true };
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Unable to send reset email.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { success: false, error: "Reset failed" };
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
          title: "Verification Failed",
          description: result.error || "Invalid or expired code.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Reset code verification error:", error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { success: false, error: "Verification failed" };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      const result = await authService.resetPassword(resetToken, newPassword);

      if (result.success) {
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully.",
        });
        return { success: true };
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Unable to reset password.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { success: false, error: "Reset failed" };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("AuthContext: Starting logout process...");
      setLoading(true);

      const result = await authService.logout();
      if (result.success) {
        // Clear local state
        setUser(null);
        setIsAuthenticated(false);

        // Clear React Query cache
        queryClient.clear();

        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
          duration: 3000,
        });

        // Force re-initialization after logout
        await initializeAuth();
      } else {
        toast({
          title: "Logout Error",
          description: "Failed to logout properly. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
      // Clear local state even if logout request fails
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      if (!user?.role) return false;
      // Case-insensitive role comparison
      return user.role.toLowerCase() === role.toLowerCase();
    },
    [user?.role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles) => {
      if (!user?.role) return false;
      // Case-insensitive role comparison
      const userRoleLower = user.role.toLowerCase();
      return roles.some((role) => role.toLowerCase() === userRoleLower);
    },
    [user?.role]
  );

  // Get user permissions based on role
  const getPermissions = () => {
    if (!user) return [];

    // Normalize role to uppercase for consistent comparison
    const normalizedRole = user.role?.toUpperCase();

    switch (normalizedRole) {
      case "ADMIN":
        return ["*"]; // Admin has all permissions
      case "PIO":
        return [
          "tasks:create",
          "tasks:read",
          "tasks:update",
          "tasks:delete",
          "users:read",
          "users:update",
          "events:create",
          "events:read",
          "events:update",
          "events:delete",
          "resources:create",
          "resources:read",
          "resources:update",
          "resources:delete",
          "announcements:create",
          "announcements:read",
          "announcements:update",
          "announcements:delete",
        ];
      case "STUDENT":
        return [
          "tasks:read",
          "tasks:update", // Only own tasks
          "events:read",
          "resources:read",
          "announcements:read",
        ];
      default:
        return [];
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getPermissions();
    return permissions.includes("*") || permissions.includes(permission);
  };

  // Refresh user data without logging out
  const refreshUserData = useCallback(async () => {
    try {
      if (!isAuthenticated) return;

      const response = await authService.verifyToken();

      if (response && response.user) {
        setUser(response.user);

        // Invalidate and refetch user-related queries
        if (response.user?.id) {
          queryClient.invalidateQueries(queryKeys.user(response.user.id));
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [isAuthenticated]);

  const value = {
    // State
    user,
    firebaseUser,
    loading,
    isLoading: loading,
    isAuthenticated,
    firebaseAvailable,

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

    // Email verification methods
    verifyEmail: authService.verifyEmail,
    resendVerificationEmail: authService.resendVerificationEmail,

    // Permission methods
    hasRole,
    hasAnyRole,
    hasPermission,
    getPermissions,
    refreshAuth: initializeAuth, // Expose refresh function
    refreshUserData, // Add the new function to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
export { AuthContext };
