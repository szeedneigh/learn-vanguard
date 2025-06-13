import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const smoothTransition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

/**
 * FloatingLabelInput
 */
const FloatingLabelInput = React.memo(
  ({
    id,
    label,
    type = "text",
    value,
    onChange,
    required = false,
    icon: Icon,
    rightIcon,
    error,
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full group">
        <div className="relative flex items-center">
          {Icon && (
            <motion.div
              className="absolute left-3.5 text-gray-400 group-focus-within:text-blue-500"
              animate={{ scale: isFocused ? 1.1 : 1 }}
              transition={smoothTransition}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full h-12 ${Icon ? "pl-10" : "pl-3.5"} ${
              rightIcon ? "pr-10" : "pr-3.5"
            } pt-3 pb-1 rounded-lg
              bg-white ring-1 ${
                error ? "ring-red-500" : "ring-gray-200"
              } focus:ring-2 focus:ring-blue-500
              text-gray-900 text-sm transition-all duration-200 outline-none
              peer placeholder-transparent shadow-sm`}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => value.length === 0 && setIsFocused(false)}
            autoComplete={type === "password" ? "current-password" : "username"}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <motion.label
            htmlFor={id}
            className={`absolute left-0 ${
              Icon ? "ml-10" : "ml-3.5"
            } transition-all duration-200
              transform -translate-y-2 scale-75 top-2 z-10 origin-[0]
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
              peer-focus:scale-75 peer-focus:-translate-y-2
              ${
                error ? "text-red-500" : "text-gray-500"
              } peer-focus:text-blue-500 text-sm font-medium`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </motion.label>
          {rightIcon}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-red-500 text-sm mt-1 pl-3.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";
FloatingLabelInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
  rightIcon: PropTypes.node,
  error: PropTypes.string,
};

/**
 * PasswordInput
 */
const PasswordInput = React.memo(({ id, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = React.useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );

  return (
    <FloatingLabelInput
      id={id}
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      required
      icon={Lock}
      error={error}
      rightIcon={
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <motion.button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={togglePasswordVisibility}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPassword ? (
                <motion.div
                  key="eyeOff"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeOffIcon className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeIcon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      }
    />
  );
});
PasswordInput.displayName = "PasswordInput";
PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

/**
 * LogIn Component
 */
export default function LogIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    login,
    loginWithGoogle,
    isLoading: authIsLoading,
    user,
    loading,
  } = useAuth();
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@student\.laverdad\.edu\.ph$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const trimmed = formData.emailOrUsername.trim();

    if (!trimmed) {
      errors.emailOrUsername = "Email or username is required";
    } else if (trimmed.includes("@")) {
      // If input contains @, validate as email with specific domain
      if (!emailRegex.test(trimmed)) {
        errors.emailOrUsername =
          "Must use a valid school email (student.laverdad.edu.ph)";
      }
    } else if (!usernameRegex.test(trimmed)) {
      // Otherwise validate as username
      errors.emailOrUsername = "Invalid username format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    return errors;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setFormErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Call the login function with emailOrUsername and password
      // The AuthContext will handle determining if it's an email or username
      const result = await login(formData.emailOrUsername, formData.password);

      if (result.success) {
        navigate("/dashboard");
      } else if (result.requiresEmailVerification) {
        // Redirect to email verification page if email is not verified
        navigate("/verify-email");
      } else {
        setApiError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiError("An unexpected error occurred. Please try again later.");
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setApiError(null);
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogle();

      if (result?.success) {
        if (result.user) {
          queryClient.setQueryData(["user"], result.user);
        }
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else if (result?.needsRegistration) {
        // Instead of showing registration form, direct user to sign up page
        toast({
          title: "Account Required",
          description: "No account found for this email. Please sign up first.",
          variant: "destructive",
        });
        navigate("/signup");
      } else if (result?.tokenExpired) {
        setApiError("Your session has expired. Please sign in with Google again.");
      } else {
        setApiError(result?.error || "Google sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setApiError("An unexpected error occurred during Google sign-in.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-violet-50/95 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Login Form */}
        <motion.div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </motion.div>

            {/* Main content */}
            <motion.div
              key="loginForm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert
                        variant="destructive"
                        className="shadow-lg"
                        role="alert"
                        aria-live="assertive"
                      >
                        <AlertDescription>{apiError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      Welcome back
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {/* Email/Username */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FloatingLabelInput
                        id="emailOrUsername"
                        label="Email or Username"
                        value={formData.emailOrUsername}
                        onChange={handleChange("emailOrUsername")}
                        required
                        icon={User}
                        error={formErrors.emailOrUsername}
                      />
                      <p className="text-xs text-gray-500 mt-1 pl-3.5">
                        For email login, use your @student.laverdad.edu.ph
                        address
                      </p>
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <PasswordInput
                        id="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={formErrors.password}
                      />
                    </motion.div>

                    {/* Forgot password */}
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Forgot your password?
                      </Link>
                    </motion.div>

                    {/* Sign in button */}
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <button
                        type="submit"
                        disabled={authIsLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        {authIsLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </motion.div>

                    {/* Or continue with Google (or other) */}
                    <motion.div
                      className="relative text-center my-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative z-10 px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 text-sm text-gray-500">
                        Or continue with
                      </div>
                    </motion.div>

                    {/* Google Sign-in Button */}
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full h-12 bg-white text-gray-700 rounded-xl font-medium shadow-lg
                                 flex items-center justify-center gap-2 relative overflow-hidden
                                 hover:shadow-gray-200/50 transition-all border border-gray-200"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={smoothTransition}
                    >
                      {isGoogleLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                          >
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                           Sign in with Google
                        </>
                      )}
                    </motion.button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Google sign-in is restricted to @student.laverdad.edu.ph
                      accounts
                    </p>
                  </form>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Image */}
        <motion.div
          className="hidden lg:block w-1/2 bg-cover bg-center bg-no-repeat relative overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/images/LVauthbg.png')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-600/30 to-blue-600/30 backdrop-blur-sm" />
            <img
              src="/images/LearnVanguard_LOGO.png"
              alt="Learn Vanguard Logo"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 max-w-[600px] drop-shadow-xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
