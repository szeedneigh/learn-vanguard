import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

const smoothTransition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

const FloatingLabelInput = React.memo(
  ({ id, label, type = "text", value, onChange, required = false, icon: Icon, rightIcon, error }) => {
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
                    bg-white ring-1 ${error ? "ring-red-500" : "ring-gray-200"} focus:ring-2 focus:ring-blue-500
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
                    ${error ? "text-red-500" : "text-gray-500"} peer-focus:text-blue-500 text-sm font-medium`}
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

// Add displayName for debugging
FloatingLabelInput.displayName = "FloatingLabelInput";

// Add PropTypes validation
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


const PasswordInput = React.memo(({ id, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

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

// Add displayName for debugging
PasswordInput.displayName = "PasswordInput";

// Add PropTypes validation
PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default function LogIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const validateForm = () => {

    const errors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const usernameRegex = /^[a-zA-Z0-9_]+$/; 

    const trimmedInput = formData.emailOrUsername.trim();
    if (!trimmedInput) {
      errors.emailOrUsername = "Email or username is required";
    } else if (
      !emailRegex.test(trimmedInput) && 
      !usernameRegex.test(trimmedInput)
    ) {
      errors.emailOrUsername = "Invalid email or username format";
    }

    // Validate Password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) { 
      errors.password = "Password must be at least 8 characters";
    }
    return errors;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors([]);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err); 
      setErrors({ form: "An error occurred during login. Please try again." }); 
    } finally {
      setIsLoading(false);
    }
  }, [navigate, formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-violet-50/95 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto w-full space-y-6">
            <motion.div
              className="flex justify-start mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                aria-label="Return to homepage"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="relative">
                  Back to home
                  <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left transform scale-x-0 transition-transform duration-300 hover:scale-x-100" />
                </span>
              </Link>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key="loginForm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="shadow-lg" role="alert" aria-live="assertive">
                      <AlertDescription>{errors.form}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <motion.div 
                  className="text-center space-y-2 mb-6"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Welcome back
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-700 relative">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        transition={smoothTransition}
                        className="inline-block"
                      >
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 origin-bottom transform scale-x-0 transition-transform duration-300 hover:scale-x-100" />
                        Sign up
                      </motion.span>
                    </Link>
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                      error={errors.emailOrUsername}
                    />
                  </motion.div>

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
                      error={errors.password}
                    />
                  </motion.div>

                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 relative"
                    >
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        transition={smoothTransition}
                        className="inline-block"
                      >
                        <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left transform scale-x-0 transition-transform duration-300 hover:scale-x-100" />
                        Forgot your password?
                      </motion.span>
                    </Link>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 
                             text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 
                             flex items-center justify-center gap-2 group relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.01,
                      background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                    disabled={isLoading}
                    aria-label={isLoading ? "Logging in..." : "Login"}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>
                        <span className="relative z-10">Login</span>
                        <motion.div
                          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0 }}
                        />
                      </>
                    )}
                  </motion.button>

                  <motion.div
                    className="relative text-center my-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative z-10">
                      <span className="px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 text-sm text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </motion.div>

                  <motion.a
                    href="https://accounts.google.com"
                    rel="noopener noreferrer"
                    className="w-full h-12 border border-gray-300 text-gray-700 rounded-lg
                             font-medium flex items-center justify-center gap-2 shadow-sm
                             hover:border-gray-400 hover:shadow-md bg-white relative
                             transition-all duration-300"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                  >
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
                    <span>Continue with Google</span>
                    <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-lg" />
                  </motion.a>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:block w-1/2 bg-cover bg-center bg-no-repeat relative overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/images/LVauthbg.png')`,
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-600/20 to-blue-600/10 backdrop-blur-[2px]"
              animate={{
                opacity: [0.8, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.img 
              src="/images/headLogo.png"
              alt="Application Logo"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 drop-shadow-xl"
              loading="lazy"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
