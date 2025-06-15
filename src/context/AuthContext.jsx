import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { auth, firebaseInitialized } from "@/config/firebase";
import * as authService from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { queryClient, queryKeys } from "@/lib/queryClient";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] =
    useState(firebaseInitialized);
  const initializationInProgress = useRef(false);
  const authInitialized = useRef(false);
  const { toast } = useToast();

  // User data management
  const cacheUserData = useCallback((userData) => {
    if (!userData) {
      localStorage.removeItem("userData");
      return;
    }
    // Cache essential user data including assignedClass
    const cacheableData = {
      id: userData.id,
      role: userData.role,
      assignedClass: userData.assignedClass, // Critical for PIO restrictions
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      course: userData.course,
      yearLevel: userData.yearLevel,
      // Add additional fields that might be needed
      studentNumber: userData.studentNumber,
      isEmailVerified: userData.isEmailVerified,
    };

    console.log("AuthContext: Caching user data:", {
      id: cacheableData.id,
      role: cacheableData.role,
      assignedClass: cacheableData.assignedClass,
    });

    localStorage.setItem("userData", JSON.stringify(cacheableData));
  }, []);

  const restoreUserData = useCallback(() => {
    const cachedData = localStorage.getItem("userData");
    if (!cachedData) {
      console.log("AuthContext: No cached user data found");
      return null;
    }
    const userData = JSON.parse(cachedData);
    console.log("AuthContext: Restored user data from cache:", {
      id: userData.id,
      role: userData.role,
      assignedClass: userData.assignedClass,
    });
    return userData;
  }, []);

  // Use React Query to manage user state
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        const cachedData = restoreUserData();
        console.log("AuthContext: No token, using cached data:", cachedData);
        return cachedData;
      }

      try {
        const decoded = jwtDecode(token);
        const isTokenExpired = decoded.exp < Date.now() / 1000;

        if (isTokenExpired) {
          localStorage.removeItem("authToken");
          return restoreUserData();
        }

        const verifyResult = await authService.verifyToken();
        // Defensive: handle null, undefined, or missing .user
        if (verifyResult && verifyResult.user) {
          console.log(
            "AuthContext: Token verification successful, user data:",
            {
              id: verifyResult.user.id,
              role: verifyResult.user.role,
              assignedClass: verifyResult.user.assignedClass,
            }
          );
          cacheUserData(verifyResult.user);
          return verifyResult.user;
        } else {
          console.warn("verifyToken did not return a valid user", verifyResult);
          return restoreUserData();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        return restoreUserData();
      }
    },
    initialData: restoreUserData,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
  });

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    if (initializationInProgress.current) {
      console.log("AuthContext: Skipping initialization - already in progress");
      return;
    }

    try {
      console.log("AuthContext: Starting initialization");
      initializationInProgress.current = true;
      setLoading(true);

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
        await queryClient.invalidateQueries(["user"]);
      } else {
        console.log("AuthContext: No auth token found in localStorage");
        queryClient.setQueryData(["user"], null);
      }
    } catch (error) {
      console.error("AuthContext: Error during initialization:", error);
      queryClient.setQueryData(["user"], null);
    } finally {
      setLoading(false);
      initializationInProgress.current = false;
      authInitialized.current = true;
    }
  }, [firebaseAvailable]);

  // Check for Google redirect results
  const checkGoogleRedirect = useCallback(async () => {
    if (!firebaseAvailable) {
      return;
    }

    try {
      const result = await authService.checkGoogleRedirectResult();

      if (!result) {
        return;
      }

      if (result.success && result.user) {
        queryClient.setQueryData(["user"], result.user);

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
      if (authInitialized.current) {
        console.log("AuthContext: Already initialized, skipping");
        return;
      }

      await initializeAuth();
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
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Starting login process...");
      const result = await authService.login({ email, password });
      console.log("AuthContext: Login result:", {
        success: result.success,
        hasUser: !!result.user,
      });

      if (result.success && result.user) {
        queryClient.setQueryData(["user"], result.user);
      }

      console.log("AuthContext: Login process finished. User state updated.");
      return result;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return {
        success: false,
        error: error.message || "An error occurred during login",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      queryClient.setQueryData(["user"], null);
      localStorage.removeItem("authToken");
      queryClient.clear(); // Clear all queries from cache
      // Redirect to login page after logout
      window.location.href = "/login";
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
    }
  };

  const value = {
    user,
    loading: loading || isUserLoading,
    isAuthenticated: !!user,
    firebaseAvailable,
    login,
    logout,
    refreshUserData: () => queryClient.invalidateQueries(["user"]),
    loginWithGoogle:
      typeof authService.loginWithGoogle === "function"
        ? authService.loginWithGoogle
        : () => Promise.reject(new Error("loginWithGoogle not implemented")),
    resendVerificationEmail:
      typeof authService.resendVerificationEmail === "function"
        ? authService.resendVerificationEmail
        : () =>
            Promise.reject(
              new Error("resendVerificationEmail not implemented")
            ),
    verifyEmail:
      typeof authService.verifyEmail === "function"
        ? authService.verifyEmail
        : () => Promise.reject(new Error("verifyEmail not implemented")),
    // ... other methods ...
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
export { AuthContext };
