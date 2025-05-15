import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types'; // Added for PropTypes
import apiClient from '../lib/api/client'; // Import apiClient

// Create the context
export const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data (id, name, role)
  const [isLoading, setIsLoading] = useState(true); // Track initial loading state
  const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Initialize token from localStorage

  // Function to fetch user data based on token
  const fetchUserData = async () => { // Removed authToken parameter, apiClient will use stored token
    setIsLoading(true);
    try {
      // Actual API call
      const response = await apiClient.get('/auth/me'); // Assuming endpoint /api/auth/me
      const userData = response.data; // Assuming API returns user data directly
      if (userData) {
        setUser(userData);
        // Token is already set or will be set by login, ensure consistency if needed
        // If /auth/me also returns a new token, update it here.
      } else {
        // No user data from /auth/me, treat as logged out
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
      }
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        // If there's a token, apiClient's interceptor will use it.
        // We still set it in state for the AuthContext to be aware and for potential direct use.
        setToken(storedToken); 
        await fetchUserData(); // fetchUserData will set user and handle loading
      } else {
        // No token, not loading user data, not setting mock user here anymore
        setIsLoading(false); 
      }
    };

    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed fetchUserData from dependency array as it's stable

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    
    // --- MOCK LOGIN CREDENTIALS ---
    const MOCK_LOGIN_ENABLED = true; // Set to false to use actual API
    const ADMIN_EMAIL = 'admin@example.com';
    const ADMIN_PASSWORD = 'password123';
    const PIO_EMAIL = 'pio@example.com';
    const PIO_PASSWORD = 'passwordPIO';
    const STUDENT_EMAIL = 'student@example.com';
    const STUDENT_PASSWORD = 'passwordStudent';

    if (MOCK_LOGIN_ENABLED) {
      const providedEmail = credentials.email || credentials.username;
      let mockUserData = null;

      if (providedEmail === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
        console.warn("AuthContext: Using MOCK ADMIN LOGIN. Credentials match.");
        mockUserData = {
          id: 'mock-admin-001',
          name: 'Admin User',
          email: ADMIN_EMAIL,
          role: 'ADMIN',
        };
      } else if (providedEmail === PIO_EMAIL && credentials.password === PIO_PASSWORD) {
        console.warn("AuthContext: Using MOCK PIO LOGIN. Credentials match.");
        mockUserData = {
          id: 'mock-pio-001',
          name: 'PIO User',
          email: PIO_EMAIL,
          role: 'PIO',
        };
      } else if (providedEmail === STUDENT_EMAIL && credentials.password === STUDENT_PASSWORD) {
        console.warn("AuthContext: Using MOCK STUDENT LOGIN. Credentials match.");
        mockUserData = {
          id: 'mock-student-001',
          name: 'Student User',
          email: STUDENT_EMAIL,
          role: 'STUDENT',
        };
      }

      if (mockUserData) {
        setUser(mockUserData);
        const mockAuthToken = `mock-valid-auth-token-${mockUserData.role.toLowerCase()}`;
        setToken(mockAuthToken);
        localStorage.setItem('authToken', mockAuthToken);
        setIsLoading(false);
        return true; // Indicate success
      } else {
        console.warn("AuthContext: MOCK LOGIN failed. Credentials do not match any mock user.");
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        setIsLoading(false);
        return false; // Indicate failure
      }
    }
    // --- END MOCK LOGIN CREDENTIALS ---

    // Actual API call (will only be reached if MOCK_LOGIN_ENABLED is false)
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user: userData, token: authToken } = response.data; 

      if (userData && authToken) {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        setIsLoading(false);
        return true; // Indicate success
      } else {
        console.error("Login failed: Invalid response from server", response);
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        setIsLoading(false);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error("Login API error:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      setIsLoading(false);
      return false; // Indicate failure
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out");
    setUser(null);
    setToken(null);
    // Replace with actual token removal
    localStorage.removeItem('authToken');
    // Optional: Redirect to login page or home page
  };

  // Value provided to consuming components
  const value = {
    user,
    isLoading,
    token,
    login,
    logout,
    fetchUserData, // Expose fetchUserData if needed elsewhere, e.g., for manual refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Add PropTypes validation for AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for easy context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 