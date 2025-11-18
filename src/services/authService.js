import apiClient from "@/lib/api/client";
import { jwtDecode } from "jwt-decode";
import {
  signInWithGoogle,
  checkRedirectResult,
  onAuthStateChanged,
  getCurrentUserToken,
} from "@/config/firebase";
import { ROLES } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";
import logger from "@/utils/logger";

// Utility to store token consistently
const storeToken = (token) => {
  if (!token) {
    logger.warn("Attempted to store null/undefined token");
    return false;
  }
  try {
    // Clear any existing token first
    localStorage.removeItem("authToken");
    localStorage.setItem("authToken", token);
    return true;
  } catch (error) {
    logger.error("Failed to store auth token:", error);
    return false;
  }
};

// Utility to remove token consistently
const removeToken = () => {
  try {
    localStorage.removeItem("authToken");
    return true;
  } catch (error) {
    logger.error("Failed to remove auth token:", error);
    return false;
  }
};

// Normalize user data to ensure role names match our constants
const normalizeUserData = (user) => {
  if (!user) {
    logger.warn("Attempted to normalize null/undefined user");
    return null;
  }

  try {
    // Create a mapping of lowercase roles to our constant roles
    const roleMapping = {
      student: ROLES.STUDENT,
      pio: ROLES.PIO,
      admin: ROLES.ADMIN,
    };

    const normalizedUser = {
      ...user,
      role: roleMapping[user.role?.toLowerCase()] || user.role,
      // Ensure assignedClass is preserved for PIO users
      assignedClass: user.assignedClass,
    };

    logger.log("Normalized user data:", {
      original: user,
      normalized: normalizedUser,
    });

    return normalizedUser;
  } catch (error) {
    logger.error("Error normalizing user data:", error);
    return user; // Return original user data if normalization fails
  }
};

/**
 * Authenticate user with provided credentials
 */
export const login = async (credentials) => {
  try {
    logger.auth("Attempting login", {
      email: credentials.email,
    });

    // Clear any existing token before login attempt
    removeToken();

    const response = await apiClient.post("/auth/login", credentials);
    logger.auth("Login response received", {
      status: response.status,
      hasToken: !!response.data?.token,
      hasUser: !!response.data?.user,
    });

    const { token, user } = response.data;

    if (!token || !user) {
      logger.error("Invalid login response:", {
        hasToken: !!token,
        hasUser: !!user,
      });
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    const tokenStored = storeToken(token);
    if (!tokenStored) {
      logger.error("Failed to store authentication token");
      return {
        success: false,
        error: "Failed to establish session",
      };
    }

    const normalizedUser = normalizeUserData(user);
    if (!normalizedUser) {
      removeToken();
      logger.error("Failed to normalize user data");
      return {
        success: false,
        error: "Invalid user data received",
      };
    }

    // Update React Query cache with user data
    queryClient.setQueryData(["user"], normalizedUser);

    return {
      success: true,
      token,
      user: normalizedUser,
    };
  } catch (error) {
    logger.error("Login failed:", error.response?.data || error);

    // Clear token on login failure
    removeToken();

    if (error.response?.status === 401) {
      return {
        success: false,
        error: error.response.data.message || "Invalid credentials",
      };
    }

    if (error.response?.status === 400) {
      return {
        success: false,
        error: "Invalid input data",
        details: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: "Login failed. Please try again later.",
    };
  }
};

/**
 * Google Sign-in authentication with Firebase
 * @param {boolean} useRedirect - Whether to force using redirect method
 */
export const loginWithGoogle = async (useRedirect = false) => {
  try {
    logger.auth("Starting Google sign-in process", { useRedirect });
    const result = await signInWithGoogle(useRedirect);

    // If redirect is in progress, return early
    if (result.inProgress) {
      logger.auth("Google sign-in redirect in progress");
      return {
        success: false,
        inProgress: true,
        message: "Google sign-in redirect in progress...",
      };
    }

    logger.auth("Google sign-in successful, sending idToken to backend");
    const { user: googleUser, idToken } = result;

    try {
      logger.log("Posting to /auth/firebase endpoint");
      const response = await apiClient.post("/auth/firebase", { idToken });
      logger.log("Backend response received", response.data);

      const { message, token, user, needsRegistration } = response.data;

      if (needsRegistration) {
        logger.auth("User needs to complete registration", {
          email: googleUser.email,
        });
        return {
          success: false,
          needsRegistration: true,
          email: googleUser.email,
          idToken,
          message: "Additional information required",
        };
      }

      if (token) {
        logger.auth("Storing authentication token");
        storeToken(token);
      } else {
        logger.error(
          "No token received from backend after Google sign-in",
          response.data
        );
      }

      // Normalize user data to ensure consistent handling
      const normalizedUser = normalizeUserData(user);
      if (!normalizedUser) {
        logger.error("Failed to normalize Firebase user data");
        removeToken();
        return {
          success: false,
          error: "Invalid user data received from Firebase authentication",
        };
      }

      // Update React Query cache with normalized user data
      queryClient.setQueryData(["user"], normalizedUser);

      return {
        user: normalizedUser,
        token,
        success: !!token,
        message: message || "Google sign-in successful",
      };
    } catch (apiError) {
      logger.error("API error during Google sign-in:", apiError);
      logger.error("API error details:", {
        status: apiError.response?.status,
        data: apiError.response?.data,
        message: apiError.message,
      });

      // Handle token expiration specifically
      if (
        apiError.response?.status === 401 &&
        apiError.response?.data?.tokenExpired
      ) {
        logger.auth("Firebase token expired, requesting user to sign in again");
        return {
          success: false,
          tokenExpired: true,
          error: "Your session has expired. Please sign in with Google again.",
        };
      }

      // Check if this is a "needs registration" response
      if (
        apiError.response?.status === 400 &&
        apiError.response?.data?.needsRegistration
      ) {
        logger.auth(
          "User needs to complete registration (from error response)"
        );
        return {
          success: false,
          needsRegistration: true,
          email: googleUser.email,
          idToken,
          message:
            apiError.response.data.message || "Additional information required",
        };
      }

      throw apiError;
    }
  } catch (error) {
    logger.error("Google sign-in failed:", error);

    // Handle popup blocked error by automatically retrying with redirect
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      logger.log("Popup was blocked, retrying with redirect...");
      return loginWithGoogle(true); // Retry with redirect
    }

    return {
      user: null,
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Google sign-in failed",
    };
  }
};

/**
 * Check for Google sign-in redirect result
 * This should be called on app initialization to handle redirect results
 */
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await checkRedirectResult();

    if (!result) {
      // No redirect result found
      return null;
    }

    if (result.error) {
      logger.error("Google redirect error:", result.error);
      return {
        success: false,
        error: result.error.message || "Google sign-in failed after redirect",
      };
    }

    const { user: googleUser, idToken } = result;
    const response = await apiClient.post("/auth/firebase", { idToken });
    const { message, token, user, needsRegistration } = response.data;

    if (needsRegistration) {
      return {
        success: false,
        needsRegistration: true,
        email: googleUser.email,
        message: "Additional information required",
      };
    }

    if (token) storeToken(token);

    // Normalize user data to ensure consistent handling
    const normalizedUser = normalizeUserData(user);
    if (!normalizedUser) {
      logger.error("Failed to normalize Firebase redirect user data");
      removeToken();
      return {
        success: false,
        error: "Invalid user data received from Firebase redirect",
      };
    }

    // Update React Query cache with normalized user data
    queryClient.setQueryData(["user"], normalizedUser);

    return {
      user: normalizedUser,
      token,
      success: true,
      message: message || "Google sign-in successful after redirect",
    };
  } catch (error) {
    logger.error("Failed to process Google redirect result:", error);
    return {
      success: false,
      error: error.message || "Failed to process Google sign-in",
    };
  }
};

/**
 * Complete Google user registration with additional info
 */
export const completeGoogleRegistration = async (registrationData) => {
  try {
    // Make sure we have the idToken for Firebase auth
    if (!registrationData.idToken) {
      const tokenResult = await getCurrentUserToken();
      if (!tokenResult) {
        return {
          success: false,
          error:
            "Unable to get authentication token. Please try signing in with Google again.",
        };
      }
      registrationData.idToken = tokenResult;
    }

    // Map course and yearLevel to the format expected by the backend
    const mappedCourse =
      registrationData.course === "BSIS"
        ? "Bachelor of Science in Information Systems"
        : registrationData.course === "ACT"
        ? "Associate in Computer Technology"
        : registrationData.course;

    const mappedYearLevel =
      registrationData.yearLevel === "1"
        ? "First Year"
        : registrationData.yearLevel === "2"
        ? "Second Year"
        : registrationData.yearLevel === "3"
        ? "Third Year"
        : registrationData.yearLevel === "4"
        ? "Fourth Year"
        : registrationData.yearLevel;

    // Format the data for the backend
    const formattedData = {
      idToken: registrationData.idToken,
      studentNumber: registrationData.studentNo, // Important: map studentNo to studentNumber
      course: mappedCourse,
      yearLevel: mappedYearLevel,
    };

    logger.auth("Completing Google registration", {
      studentNumber: formattedData.studentNumber,
      course: formattedData.course,
      yearLevel: formattedData.yearLevel,
    });

    try {
      const response = await apiClient.post("/auth/firebase", formattedData);
      const { message, token, user, requiresEmailVerification } = response.data;
      if (token) storeToken(token);

      // Normalize user data to ensure consistent handling
      const normalizedUser = normalizeUserData(user);
      if (!normalizedUser) {
        logger.error("Failed to normalize Google registration user data");
        removeToken();
        return {
          success: false,
          error: "Invalid user data received after registration",
        };
      }

      // Update React Query cache with normalized user data
      queryClient.setQueryData(["user"], normalizedUser);

      return {
        user: normalizedUser,
        token,
        success: true,
        requiresEmailVerification,
        message: message || "Registration completed successfully",
      };
    } catch (error) {
      logger.error("Google registration failed:", error);
      logger.error("Error response data:", error.response?.data);
      logger.error("Error status:", error.response?.status);

      // Re-throw to be handled by outer catch
      throw error;
    }
  } catch (error) {
    logger.error("Google registration failed:", error);

    // Handle token expiration specifically
    if (error.response?.status === 401 && error.response?.data?.tokenExpired) {
      logger.auth(
        "Token expired during registration, requesting user to sign in again"
      );
      return {
        success: false,
        tokenExpired: true,
        error: "Your session has expired. Please sign in with Google again.",
      };
    }

    return {
      user: null,
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed",
    };
  }
};

/**
 * Initiate signup process with basic user data
 */
export const initiateSignup = async (basicData) => {
  try {
    const response = await apiClient.post("/auth/signup/initiate", {
      firstName: basicData.firstname,
      lastName: basicData.lastname,
      email: basicData.email,
      password: basicData.password,
    });

    logger.auth("Signup initiation response", response.data);

    return {
      success: true,
      registrationId: response.data.registrationId,
      tempToken: response.data.tempToken || response.data.token,
      message: response.data.message || "Registration initiated successfully",
    };
  } catch (error) {
    logger.error("Registration initiation failed:", error);

    // Handle validation errors from backend
    if (error.response?.status === 400 && error.response.data?.errors) {
      const fieldErrors = {};

      // Map backend field errors to frontend field names
      error.response.data.errors.forEach((err) => {
        // Map backend field names to frontend field names
        let fieldName = err.field;
        if (fieldName === "firstName") fieldName = "firstname";
        if (fieldName === "lastName") fieldName = "lastname";

        fieldErrors[fieldName] = err.message;
      });

      return {
        success: false,
        error: error.response.data.message || "Validation failed",
        details: fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Registration failed. Please try again.",
    };
  }
};

/**
 * Complete signup process with academic details
 */
export const completeSignup = async (completeData) => {
  try {
    const mappedCourse =
      completeData.course === "BSIS"
        ? "Bachelor of Science in Information Systems"
        : completeData.course === "ACT"
        ? "Associate in Computer Technology"
        : completeData.course;

    const mappedYearLevel =
      completeData.yearLevel === "1"
        ? "First Year"
        : completeData.yearLevel === "2"
        ? "Second Year"
        : completeData.yearLevel === "3"
        ? "Third Year"
        : completeData.yearLevel === "4"
        ? "Fourth Year"
        : completeData.yearLevel;

    logger.auth("Completing signup", {
      studentNumber: completeData.studentNo,
      course: mappedCourse,
      yearLevel: mappedYearLevel,
    });

    const response = await apiClient.post("/auth/signup/complete", {
      tempToken: completeData.tempToken,
      studentNumber: completeData.studentNo,
      course: mappedCourse,
      yearLevel: mappedYearLevel,
    });

    const { token, requiresEmailVerification } = response.data;

    if (token) {
      storeToken(token);
    }

    return {
      success: true,
      token,
      requiresEmailVerification,
      message: response.data.message || "Registration completed successfully",
    };
  } catch (error) {
    logger.error("Registration completion failed:", error);

    // Handle validation errors from backend
    if (error.response?.status === 400 && error.response.data?.errors) {
      const fieldErrors = {};

      // Map backend field errors to frontend field names
      error.response.data.errors.forEach((err) => {
        // Map backend field names to frontend field names
        let fieldName = err.field;
        if (fieldName === "studentNumber") fieldName = "studentNo";

        fieldErrors[fieldName] = err.message;
      });

      return {
        success: false,
        error: error.response.data.message || "Validation failed",
        details: fieldErrors,
      };
    }

    // Handle unauthorized error (expired or invalid token)
    if (error.response?.status === 401) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Session expired or invalid. Please start the signup process again.",
        sessionExpired: true,
      };
    }

    // Handle other error cases
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Registration failed. Please try again.",
    };
  }
};

/**
 * One-shot register aliasing two-step initiation
 */
export const register = initiateSignup;

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    logger.auth("Fetching current user data");
    const token = localStorage.getItem("authToken");

    if (!token) {
      logger.warn("No auth token found when fetching current user");
      return { success: false, error: "No authentication token found" };
    } // Use verify endpoint which already returns user data
    const res = await apiClient.get("/auth/verify");
    logger.auth("Current user response", {
      status: res.status,
      valid: res.data?.valid,
      hasUser: !!res.data?.user,
    });

    if (!res.data?.valid || !res.data?.user) {
      logger.error("Invalid response or missing user data");
      removeToken();
      return { success: false, error: "Could not retrieve user data" };
    }

    const normalizedUser = normalizeUserData(res.data.user);
    if (!normalizedUser) {
      removeToken();
      return { success: false, error: "Failed to process user data" };
    }

    return {
      success: true,
      user: normalizedUser,
    };
  } catch (error) {
    logger.error("Get current user failed:", error);

    if (error.response?.status === 401) {
      removeToken();
      return { success: false, error: "Session expired" };
    }

    return { success: false, error: "Failed to fetch user data" };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    logger.auth("Logging out user");
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        logger.warn("Logout API call failed:", error);
        // Continue with local logout even if API call fails
      }
    }

    // Always remove token and clear user data
    removeToken();
    return { success: true };
  } catch (error) {
    logger.error("Logout failed:", error);
    // Still remove token even if API call fails
    removeToken();
    return { success: true };
  }
};

/**
 * Password reset flow
 */
export const requestPasswordReset = async (data) => {
  try {
    const res = await apiClient.post("/password-reset/forgot-password", data);
    return {
      success: true,
      message: res.data.message,
      expiresAt: res.data.expiresAt,
    };
  } catch (error) {
    logger.error("Password reset request failed:", error);

    // Check for specific error types
    if (error.response?.status === 429) {
      const retryAfter =
        parseInt(error.response?.headers?.["retry-after"]) || 300;
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Too many requests. Please try again later.",
        isRateLimited: true,
        retryAfter,
      };
    }

    if (error.response?.data?.code === "EMAIL_NOT_FOUND") {
      return {
        success: false,
        error: "No account found with this email address.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Request failed. Please try again later.",
    };
  }
};

export const verifyResetCode = async (data) => {
  try {
    const res = await apiClient.post("/password-reset/verify-code", data);
    return {
      success: true,
      resetToken: res.data.resetToken,
      message: res.data.message,
    };
  } catch (error) {
    logger.error("Verify reset code failed:", error);

    // Check for specific error types
    if (
      error.response?.status === 400 &&
      error.response?.data?.code === "INVALID_CODE"
    ) {
      return {
        success: false,
        error: "The verification code is invalid or has expired.",
      };
    }

    if (error.response?.status === 429) {
      return {
        success: false,
        error: "Too many failed attempts. Please try again later.",
        isRateLimited: true,
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Verification failed. Please try again.",
    };
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await apiClient.post("/password-reset/reset", data);
    return { success: true, message: res.data.message };
  } catch (error) {
    logger.error("Password reset failed:", error);

    // Check for specific error types
    if (
      error.response?.status === 400 &&
      error.response?.data?.code === "INVALID_TOKEN"
    ) {
      return {
        success: false,
        error: "Password reset session has expired. Please start over.",
      };
    }

    if (
      error.response?.status === 400 &&
      error.response?.data?.code === "PASSWORD_REQUIREMENTS"
    ) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Password does not meet security requirements.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to reset password. Please try again.",
    };
  }
};

/**
 * Token verification and status
 */
export const verifyToken = async () => {
  try {
    logger.auth("Verifying authentication token");
    const token = localStorage.getItem("authToken");

    if (!token) {
      logger.warn("No token found during verification");
      return null;
    }

    // First check client-side if token is expired to avoid unnecessary API calls
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        logger.warn("Token expired based on client-side validation");
        removeToken();
        return null;
      }
    } catch (decodeError) {
      logger.error("Failed to decode token:", decodeError);
      // Continue to server validation as fallback
    }

    // Then verify with the server
    try {
      const response = await apiClient.get("/auth/verify", {
        timeout: 5000, // Add timeout to prevent hanging
      });
      logger.auth("Token verification response", response.data);

      if (response.data?.valid && response.data?.user) {
        const normalizedUser = normalizeUserData(response.data.user);
        // Update cached user data
        queryClient.setQueryData(["user"], normalizedUser);
        return {
          valid: true,
          user: normalizedUser,
        };
      }

      logger.warn(
        "Token verification failed: invalid token or missing user data"
      );
      removeToken();
      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        logger.warn("Token verification failed: unauthorized");
        removeToken();
        return null;
      }

      if (error.code === "ECONNABORTED") {
        logger.warn("Token verification request timed out");
        // Don't remove token on timeout, could be server issue
        return null;
      }

      // For other errors (like network issues), keep the token
      logger.error("Token verification request failed:", error.message);
      return null;
    }
  } catch (error) {
    logger.error("Token verification failed:", error);
    removeToken();
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    const decoded = jwtDecode(token);
    const isValid = decoded.exp > Date.now() / 1000;

    if (!isValid) {
      logger.warn("Token expired during authentication check");
      removeToken();
    }

    return isValid;
  } catch (error) {
    logger.error("Authentication check failed:", error);
    removeToken();
    return false;
  }
};

/**
 * Verify email address
 */
export const verifyEmail = async (userId, verificationCode) => {
  try {
    const response = await apiClient.get(
      `/auth/verify-email/${userId}/${verificationCode}`
    );

    return {
      success: true,
      message: response.data.message || "Email verified successfully",
    };
  } catch (error) {
    logger.error("Email verification failed:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Verification failed",
    };
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async () => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const response = await apiClient.post("/auth/resend-verification");

    return {
      success: true,
      message: response.data.message || "Verification email sent",
    };
  } catch (error) {
    logger.error("Failed to resend verification email:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to send verification email",
    };
  }
};

export const authService = {
  login,
  loginWithGoogle,
  completeGoogleRegistration,
  logout,
  getCurrentUser,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyToken,
  isAuthenticated,
  onAuthStateChanged,
  initiateSignup,
  completeSignup,
  register,
  checkGoogleRedirectResult,
  verifyEmail,
  resendVerificationEmail,
};
