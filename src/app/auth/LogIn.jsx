import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

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
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => {
      if (value.length === 0) setIsFocused(false);
    }, [value]);

    return (
      <div className="relative w-full group">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
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
                    bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500
                    text-gray-900 text-sm transition-all duration-200 outline-none
                    peer placeholder-transparent`}
            placeholder={label}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <label
            htmlFor={id}
            className={`absolute left-0 ${
              Icon ? "ml-10" : "ml-3.5"
            } transition-all duration-200
                    transform -translate-y-2 scale-75 top-2 z-10 origin-[0] 
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
                    peer-focus:scale-75 peer-focus:-translate-y-2
                    text-gray-500 peer-focus:text-blue-500 text-sm`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {rightIcon}
        </div>
      </div>
    );
  }
);

const AnimatedButton = React.memo(
  motion(({ className, children, isLoading, ...props }) => (
    <button
      className={cn(
        "px-4 py-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </div>
    </button>
  ))
);

AnimatedButton.displayName = "AnimatedButton";

export default function LogIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // login logic here
      navigate('/dashboard');  
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto w-full space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="loginForm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                    Welcome back
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link to="/signup">
                      <motion.span
                        className="text-blue-600 font-medium hover:text-blue-700"
                        whileHover={{ scale: 1.05 }}
                        transition={smoothTransition}
                      >
                        Sign up
                      </motion.span>
                    </Link>
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <FloatingLabelInput
                    id="emailOrUsername"
                    label="Email or Username"
                    value={formData.emailOrUsername}
                    onChange={handleChange("emailOrUsername")}
                    required
                    icon={User}
                  />

                  <div className="relative">
                    <FloatingLabelInput
                      id="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange("password")}
                      required
                      icon={Lock}
                      rightIcon={
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <motion.button
                            type="button"
                            className="p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                  </div>

                  <div className="flex justify-end">
                    <motion.a
                      href="#"
                      className="text-sm text-blue-600 hover:underline"
                      whileHover={{ scale: 1.05 }}
                      transition={smoothTransition}
                    >
                      Forgot your password?
                    </motion.a>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 
                               text-white rounded-lg font-medium shadow-md shadow-blue-500/20 
                               flex items-center justify-center gap-2 group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>Login</>
                    )}
                  </motion.button>

                  <div className="relative text-center my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative z-10">
                      <span className="px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 text-sm text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <AnimatedButton
                    type="button"
                    className="w-full border border-slate-300 text-slate-700 hover:border-slate-400 bg-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 mr-2 inline-block"
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
                    Login with Google
                  </AnimatedButton>
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
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-600/30 to-blue-600/30 backdrop-blur-sm" />
           <img src="/images/headLogo.png" alt="Logo" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 drop-shadow-xl" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
