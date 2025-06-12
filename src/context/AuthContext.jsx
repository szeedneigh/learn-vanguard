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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] =
    useState(firebaseInitialized);
  const initializationInProgress = useRef(false);
  const { toast } = useToast();

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    // Skip if already initialized or no token exists
    if (
      initializationInProgress.current ||
      !localStorage.getItem("authToken")
    ) {
      console.log(
        "AuthContext: Skipping initialization - already in progress or no token"
      );
      setLoading(false);
      return;
    }

    try {
      console.log("AuthContext: Starting initialization...");
      initializationInProgress.current = true;
      setLoading(true);

      // Use verify endpoint directly as it returns both validity and user data
      const response = await authService.verifyToken();
      console.log("AuthContext: Token verification result:", { response });

      if (!response) {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(true);
        return;
      }

      // Check if we need to restore avatar URL from localStorage
      const lastAvatarUrl = localStorage.getItem("lastAvatarUrl");
      if (
        lastAvatarUrl &&
        (!response.user.avatarUrl || response.user.avatarUrl === "")
      ) {
        response.user.avatarUrl = lastAvatarUrl;
        console.log("AuthContext: Restored avatar URL from localStorage");
      }

      // Set user state from verification response
      setUser(response.user);
      setIsAuthenticated(true);
      setIsEmailVerified(response.user.isEmailVerified);
    } catch (error) {
      console.error("AuthContext: Auth initialization error:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsEmailVerified(true);
    } finally {
      setLoading(false);
      initializationInProgress.current = false;
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
        setIsEmailVerified(result.user.isEmailVerified);

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
      // First check for Google redirect results if Firebase is available
      if (firebaseAvailable) {
        await checkGoogleRedirect();
      }

      // Then check for token-based authentication
      const token = localStorage.getItem("authToken");
      if (token) {
        await initializeAuth();
      } else {
        setLoading(false); // No need to keep loading if there's no token
      }
    };

    checkAuth();
  }, [initializeAuth, checkGoogleRedirect, firebaseAvailable]);

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

  // Login with email and password
  const login = async (emailOrUsername, password) => {
    try {
      console.log("AuthContext: Starting login process...");
      setLoading(true);

      // Determine if the input is an email or username
      const isEmail = emailOrUsername.includes("@");

      // Create credentials object with the appropriate field
      const credentials = {
        password: password,
      };

      // Set either email or username field based on the input format
      if (isEmail) {
        credentials.email = emailOrUsername;
      } else {
        credentials.username = emailOrUsername;
      }

      const result = await authService.login(credentials);
      console.log("AuthContext: Login result:", {
        success: result.success,
        hasUser: !!result.user,
      });

      if (result.success && result.user) {
        // Check if we have a saved avatar URL
        const lastAvatarUrl = localStorage.getItem("lastAvatarUrl");
        if (
          lastAvatarUrl &&
          (!result.user.avatarUrl || result.user.avatarUrl === "")
        ) {
          result.user.avatarUrl = lastAvatarUrl;
          console.log("Login: Restored avatar URL from localStorage");
        } else if (result.user.avatarUrl) {
          // Save the new avatar URL
          localStorage.setItem("lastAvatarUrl", result.user.avatarUrl);
        }

        // Important: Set user state before returning
        await Promise.all([
          (async () => {
            setUser(result.user);
            setIsAuthenticated(true);
            setIsEmailVerified(result.user.isEmailVerified);
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
      } else if (result.requiresEmailVerification) {
        // Handle unverified email case
        setIsEmailVerified(false);
        return {
          success: false,
          requiresEmailVerification: true,
          error: result.error || "Please verify your email before logging in",
        };
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

      // Save avatar URL before logout if available
      const avatarUrl = user?.avatarUrl;
      if (avatarUrl) {
        localStorage.setItem("lastAvatarUrl", avatarUrl);
      }

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
        });

        // Force re-initialization after logout
        await initializeAuth();
      } else {
        toast({
          title: "Logout Error",
          description: "Failed to logout properly. Please try again.",
          variant: "destructive",
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
        // Check if we need to restore avatar URL from localStorage
        const lastAvatarUrl = localStorage.getItem("lastAvatarUrl");
        if (
          lastAvatarUrl &&
          (!response.user.avatarUrl || response.user.avatarUrl === "")
        ) {
          response.user.avatarUrl = lastAvatarUrl;
          console.log("refreshUserData: Restored avatar URL from localStorage");
        }

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

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      const result = await authService.resendVerificationEmail();
      if (result.success) {
        toast({
          title: "Email Sent",
          description:
            "Verification email has been sent. Please check your inbox.",
        });
      } else {
        toast({
          title: "Failed to Send",
          description: result.error || "Failed to send verification email.",
          variant: "destructive",
        });
      }
      return result;
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email.",
        variant: "destructive",
      });
      return {
        success: false,
        error: "Failed to send verification email",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (userId, code) => {
    try {
      setLoading(true);
      const result = await authService.verifyEmail(userId, code);

      if (result.success && user) {
        // Update email verification status if the current user is being verified
        if (user.id === userId) {
          setIsEmailVerified(true);
          setUser({ ...user, isEmailVerified: true });
          toast({
            title: "Success",
            description: "Your email has been verified successfully.",
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Email verification failed:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify your email address.",
        variant: "destructive",
      });
      return {
        success: false,
        error: "Failed to verify email",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    isEmailVerified,

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
    refreshAuth: initializeAuth, // Expose refresh function
    refreshUserData, // Add the new function to the context value
    resendVerificationEmail,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
export { AuthContext };
