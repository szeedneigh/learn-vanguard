import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ChevronLeft,
  Lock,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import VerificationCodeInput from "./VerificationCodeInput";
import {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "@/services/authService";

const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // Input change handler
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "email") setEmailError("");
    if (field === "newPassword") setPasswordError("");
    if (field === "confirmPassword") setConfirmPasswordError("");
  };

  // Validation functions
  const validateEmail = () => {
    if (!formData.email) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    const requirements = {
      length: formData.newPassword.length >= 8,
      upper: /[A-Z]/.test(formData.newPassword),
      lower: /[a-z]/.test(formData.newPassword),
      numberSpecial: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        formData.newPassword
      ),
    };

    if (!Object.values(requirements).every(Boolean)) {
      setPasswordError("Password does not meet requirements");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // Password strength calculator
  const getPasswordStrength = (password) => {
    const conditions = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      numberSpecial: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metConditions = Object.values(conditions).filter(Boolean).length;
    const totalConditions = Object.keys(conditions).length;
    const strengthPercentage = (metConditions / totalConditions) * 100;

    if (metConditions === totalConditions)
      return { strength: "Strong", percentage: 100 };
    if (strengthPercentage >= 50) return { strength: "Medium", percentage: 66 };
    return { strength: "Weak", percentage: 33 };
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "Weak":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Strong":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  // Form submission handlers
  const handleResend = async () => {
    if (canResend) {
      setError(null);
      setCanResend(false);
      setResendTimer(30);

      try {
        const result = await requestPasswordReset({ email: formData.email });
        if (!result.success) {
          // Handle rate limiting specifically
          if (result.isRateLimited) {
            const retryAfter = result.retryAfter || 60;
            setResendTimer(retryAfter);
            setError(
              `Too many requests. Please try again in ${retryAfter} seconds.`
            );
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        setError("Failed to resend verification code");
      }
    }
  };

  const handleEmailSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateEmail()) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await requestPasswordReset({ email: formData.email });
        if (result.success) {
          setStep(2);
        } else {
          // Handle rate limiting specifically
          if (result.isRateLimited) {
            const retryAfter = result.retryAfter || 60;
            setResendTimer(retryAfter);
            setCanResend(false);
            setError(
              `Too many requests. Please try again in ${retryAfter} seconds.`
            );
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        setError("Failed to send verification code");
      } finally {
        setIsLoading(false);
      }
    },
    [formData.email]
  );

  const handleCodeSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (formData.code.length !== 6) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await verifyResetCode({
          email: formData.email,
          code: formData.code,
        });

        if (result.success) {
          // Store the resetToken in formData for the password reset step
          setFormData((prev) => ({ ...prev, resetToken: result.resetToken }));
          setStep(3);
        } else {
          // Handle rate limiting specifically
          if (result.isRateLimited) {
            setCanResend(false);
            setResendTimer(60); // Default to 60 seconds if no retry-after header
            setError("Too many failed attempts. Please try again later.");
          } else {
            setError(result.error || "Invalid verification code");
          }
        }
      } catch (err) {
        setError("Verification failed");
      } finally {
        setIsLoading(false);
      }
    },
    [formData.email, formData.code]
  );

  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validatePassword() || !validateConfirmPassword()) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await resetPassword({
          resetToken: formData.resetToken,
          password: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });

        if (result.success) {
          navigate("/login");
        } else {
          setError(result.error || "Failed to reset password");
        }
      } catch (err) {
        setError("Failed to reset password");
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData.resetToken,
      formData.newPassword,
      formData.confirmPassword,
      navigate,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-violet-50/95 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Form */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto w-full space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
                      whileHover={{ scale: 1.05 }}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                      {step === 1
                        ? "Reset Password"
                        : step === 2
                        ? "Verify Email"
                        : "New Password"}
                    </h1>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className={`h-2 w-8 rounded-full transition-all duration-300 ${
                          step >= num ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                {step === 1 && (
                  <p className="text-sm text-gray-600 mb-6 px-4 text-center">
                    Enter your email address to receive a verification code.
                  </p>
                )}
                {step === 2 && (
                  <p className="text-sm text-gray-600 mb-6 px-4 text-center">
                    We've sent a 6-digit code to{" "}
                    <span className="font-medium">{formData.email}</span>
                    <br />
                    <span className="text-gray-500 mt-2 block">
                      If you don't see the email in your inbox, please check
                      your spam folder.
                    </span>
                  </p>
                )}
                {step === 3 && (
                  <p className="text-sm text-gray-600 mb-6 px-4 text-center">
                    Create a new password. Make sure it's secure and easy to
                    remember.
                  </p>
                )}

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Form Sections */}
                <form
                  onSubmit={
                    step === 1
                      ? handleEmailSubmit
                      : step === 2
                      ? handleCodeSubmit
                      : handlePasswordSubmit
                  }
                  className="space-y-6"
                >
                  {/* Step 1 - Email Input */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <FloatingLabelInput
                        id="email"
                        label="Email address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        onBlur={validateEmail}
                        required
                        icon={Mail}
                        error={emailError}
                      />
                    </motion.div>
                  )}

                  {/* Step 2 - Verification Code */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      <VerificationCodeInput
                        value={formData.code}
                        onChange={(newCode) =>
                          setFormData((prev) => ({ ...prev, code: newCode }))
                        }
                        onComplete={handleCodeSubmit}
                      />
                      <div className="text-center text-sm">
                        <motion.button
                          type="button"
                          className={`flex items-center justify-center gap-2 w-full ${
                            canResend
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          whileHover={canResend ? { scale: 1.02 } : {}}
                          onClick={handleResend}
                          disabled={!canResend}
                        >
                          <span>
                            {canResend
                              ? "Didn't receive code?"
                              : `Resend available in ${resendTimer}s`}
                          </span>
                          {canResend && (
                            <span className="font-medium underline underline-offset-2">
                              Resend Code
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 - Password Inputs */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <FloatingLabelInput
                          id="newPassword"
                          label="New Password"
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={handleChange("newPassword")}
                          onBlur={validatePassword}
                          required
                          icon={Lock}
                          error={passwordError}
                          rightIcon={
                            <motion.button
                              type="button"
                              className="p-1.5 text-gray-500 hover:text-gray-700"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              whileHover={{ scale: 1.1 }}
                            >
                              {showNewPassword ? (
                                <EyeOffIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </motion.button>
                          }
                        />
                        {formData.newPassword && (
                          <div className="mt-3 space-y-2">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${
                                  {
                                    Weak: "bg-red-500",
                                    Medium: "bg-yellow-500",
                                    Strong: "bg-green-500",
                                  }[
                                    getPasswordStrength(formData.newPassword)
                                      .strength
                                  ]
                                }`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    getPasswordStrength(formData.newPassword)
                                      .percentage
                                  }%`,
                                }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p
                              className={`text-sm ${getStrengthColor(
                                getPasswordStrength(formData.newPassword)
                                  .strength
                              )}`}
                            >
                              {
                                getPasswordStrength(formData.newPassword)
                                  .strength
                              }{" "}
                              Password
                              {getPasswordStrength(formData.newPassword)
                                .strength !== "Strong" && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Requires 8+ characters, uppercase letters,
                                  lowercase letters, number or special
                                  characters)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <FloatingLabelInput
                          id="confirmPassword"
                          label="Confirm Password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange("confirmPassword")}
                          onBlur={validateConfirmPassword}
                          required
                          icon={Lock}
                          error={confirmPasswordError}
                          rightIcon={
                            <motion.button
                              type="button"
                              className="p-1.5 text-gray-500 hover:text-gray-700"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              whileHover={{ scale: 1.1 }}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </motion.button>
                          }
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 
                             text-white rounded-xl font-medium shadow-lg shadow-blue-500/10
                             flex items-center justify-center gap-2 relative overflow-hidden
                             hover:shadow-blue-500/20 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                    disabled={
                      isLoading ||
                      (step === 1 && emailError) ||
                      (step === 2 && formData.code.length !== 6) ||
                      (step === 3 && (passwordError || confirmPasswordError))
                    }
                  >
                    {isLoading && (
                      <motion.div
                        className="absolute inset-0 bg-blue-700/10 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
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
                        {step === 1 && "Send Code"}
                        {step === 2 && "Verify Account"}
                        {step === 3 && "Update Password"}
                      </>
                    )}
                  </motion.button>

                  {/* Back to Login */}
                  <div className="text-center text-sm text-gray-600">
                    Remembered your password?{" "}
                    <Link to="/login">
                      <motion.span
                        className="text-blue-600 hover:underline font-medium"
                        whileHover={{ scale: 1.05 }}
                        transition={smoothTransition}
                      >
                        Back to Login
                      </motion.span>
                    </Link>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
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
              src="/images/headLogo.png"
              alt="Logo"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 drop-shadow-xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Floating Label Input Component
const FloatingLabelInput = React.memo(
  ({ id, label, error, rightIcon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full group">
        <div className="relative flex items-center">
          {props.icon && (
            <motion.div
              className={`absolute left-3.5 ${
                error ? "text-red-500" : "text-gray-400"
              } group-focus-within:text-blue-500 transition-colors`}
              animate={{ scale: isFocused ? 1.1 : 1 }}
            >
              <props.icon className="h-5 w-5" />
            </motion.div>
          )}
          <input
            id={id}
            {...props}
            className={`w-full h-12 ${props.icon ? "pl-11" : "pl-4"} ${
              rightIcon ? "pr-11" : "pr-4"
            } pt-4 pb-2 rounded-xl bg-white ring-1 ${
              error ? "ring-red-500" : "ring-gray-200"
            } focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm transition-all duration-200 outline-none peer placeholder-transparent shadow-sm`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              props.onBlur?.();
            }}
          />
          <label
            htmlFor={id}
            className={`absolute left-0 ${
              props.icon ? "ml-11" : "ml-4"
            } transition-all duration-200 transform -translate-y-2.5 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 ${
              error ? "text-red-500" : "text-gray-500"
            } peer-focus:text-blue-500 text-sm font-medium`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 ml-1 text-red-500 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);
