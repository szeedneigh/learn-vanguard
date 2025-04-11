import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  Calendar,
  X,
} from "lucide-react";
import PropTypes from 'prop-types'; 
import { Alert, AlertDescription } from "@/components/ui/alert";

const smoothTransition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

const FloatingLabelInput = React.memo(
  ({ id, label, type = "text", value, onChange, required = false, icon: Icon, error }) => {
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
            className={`w-full h-12 ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 pt-3 pb-1 rounded-lg
                    bg-white ring-1 ${error ? "ring-red-500" : "ring-gray-200"} focus:ring-2 focus:ring-blue-500
                    text-gray-900 text-sm transition-all duration-200 outline-none
                    peer placeholder-transparent`}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => value.length === 0 && setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete={type === "password" ? "new-password" : "off"}
          />
          <label
            htmlFor={id}
            className={`absolute left-0 ${
              Icon ? "ml-10" : "ml-3.5"
            } transition-all duration-200
                    transform -translate-y-2 scale-75 top-2 z-10 origin-[0] 
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
                    peer-focus:scale-75 peer-focus:-translate-y-2
                    ${error ? "text-red-500" : "text-gray-500"} peer-focus:text-blue-500 text-sm`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
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

FloatingLabelInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
  error: PropTypes.string,
};

FloatingLabelInput.displayName = 'FloatingLabelInput';

const PasswordInput = React.memo(({ id, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <FloatingLabelInput
        id={id}
        label={label}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        icon={Lock}
        error={error}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <motion.button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          onClick={() => setShowPassword((prev) => !prev)}
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
    </div>
  );
});

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

PasswordInput.displayName = 'PasswordInput';

const SelectInput = React.memo(({ value, onChange, options, label, icon: Icon, error }) => (
  <div className="relative w-full group">
    <div className="relative flex items-center">
      {Icon && (
        <motion.div
          className="absolute left-3.5 text-gray-400 group-focus-within:text-blue-500"
          transition={smoothTransition}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full h-12 ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 rounded-lg
                bg-white ring-1 ${error ? "ring-red-500" : "ring-gray-200"} focus:ring-2 focus:ring-blue-500
                text-gray-900 text-sm transition-all duration-200 outline-none appearance-none`}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1 pl-3.5">
          {error}
        </p>
      )}
    </div>
  </div>
));

SelectInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  error: PropTypes.string,
};

SelectInput.displayName = 'SelectInput';

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    studentNo: "",
    course: "",
    yearLevel: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Validation Logic ---
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'firstname':
        return !value.trim() ? "First name is required" : "";
      case 'lastname':
        return !value.trim() ? "Last name is required" : "";
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return "Email is required";
        return !emailRegex.test(value) ? "Invalid email format" : "";
      }
      case 'password': {
        if (!value) return "Password is required";
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        if (value.length < minLength) return `Password must be at least ${minLength} characters`;
        if (!hasUpperCase) return "Password must include an uppercase letter";
        if (!hasLowerCase) return "Password must include a lowercase letter";
        if (!hasNumber) return "Password must include a number";
        if (!hasSpecialChar) return "Password must include a special character";
        return "";
      }
      case 'studentNo':
        return !value.trim() ? "Student number is required" : "";
      case 'course':
        return !value ? "Course is required" : "";
      case 'yearLevel':
        return !value ? "Year level is required" : "";
      default:
        return "";
    }
  }, []);

  const validateStep = useCallback((stepToValidate) => {
    const errors = {};
    const fieldsToValidate = stepToValidate === 1
      ? ['firstname', 'lastname', 'email', 'password']
      : ['studentNo', 'course', 'yearLevel'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    if (stepToValidate === 2 && !acceptedTerms) {
      errors.terms = "You must accept the terms and conditions";
    }

    return errors;
  }, [formData, acceptedTerms, validateField]);
  // --- End Validation Logic ---

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    const error = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: error }));
  }, [validateField]);

  const clearError = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  const handleSubmitStep1 = useCallback((e) => {
    e.preventDefault();
    const stepErrors = validateStep(1);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep(2);
  }, [validateStep]);

  const handleSubmitStep2 = useCallback(async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(2);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // --- Secure API Call Placeholder ---
    // IMPORTANT: Replace this mock delay with a real API call
    // - Use HTTPS for all communication.
    // - Send data securely (e.g., as JSON payload).
    // - Implement robust server-side validation for all fields.
    // - Handle potential API errors gracefully (network issues, server errors).
    // - Implement server-side rate limiting to prevent brute-force attacks.
    // - Consider CSRF protection if using session-based authentication.
    try {
      console.log("Submitting registration data:", formData); // Log data for debugging (remove in production)
      // Example: const response = await fetch('/api/register', { method: 'POST', ... });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Assuming successful registration:
      navigate('/dashboard'); // Or to an email verification page

    } catch (error) {
      console.error("Registration failed:", error);
      // Provide user-friendly error messages. Avoid exposing internal details.
      setErrors({ form: "Registration failed. Please check your details or try again later." });
    } finally {
      setIsLoading(false);
    }
    // --- End Secure API Call Placeholder ---

  }, [formData, validateStep, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 backdrop-blur-sm">
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

              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      Welcome aboard
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 relative">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          transition={smoothTransition}
                          className="inline-block"
                        >
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 origin-bottom transform scale-x-0 transition-transform duration-300 hover:scale-x-100" />
                          Sign in
                        </motion.span>
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmitStep1} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="firstname"
                        label="First Name"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        error={errors.firstname}
                        required
                        icon={User}
                      />
                      <FloatingLabelInput
                        id="lastname"
                        label="Last Name"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        error={errors.lastname}
                        required
                        icon={User}
                      />
                    </div>

                    <FloatingLabelInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                      icon={Mail}
                    />

                    <div>
                      <PasswordInput
                        id="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                      />
                      {errors.password && !formData.password && ( 
                        <p className="text-gray-500 text-xs mt-1 pl-1">
                          Minimum of 8 characterss, upper, lower, number, special char.
                        </p>
                      )}
                    </div>

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
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <div className="relative text-center my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative z-10">
                        <span className="px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 text-sm text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

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
                      <span>Sign up with Google</span>
                      <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-lg" />
                    </motion.a>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      Academic Details
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Please provide your student information
                    </p>
                  </div>

                  <form onSubmit={handleSubmitStep2} className="space-y-5" noValidate>
                      <FloatingLabelInput
                        id="studentNo"
                        label="Student Number"
                        value={formData.studentNo}
                        onChange={handleInputChange}
                        error={errors.studentNo}
                        required
                        icon={GraduationCap}
                      />

                    <SelectInput
                      value={formData.course}
                      onChange={(e) => handleInputChange({ target: { id: 'course', value: e.target.value } })}
                      options={[
                        { value: "", label: "Select Course", disabled: true }, 
                        { value: "BSIS", label: "Bachelor of Science in Information Systems" },
                        { value: "ACT", label: "Associate in Computer Technology" },
                      ]}
                      label="Course"
                      icon={BookOpen}
                      error={errors.course}
                    />

                    <SelectInput
                      value={formData.yearLevel}
                      onChange={(e) => handleInputChange({ target: { id: 'yearLevel', value: e.target.value } })}
                      options={[
                        { value: "", label: "Select Year Level", disabled: true },
                        { value: "1", label: "First Year" },
                        { value: "2", label: "Second Year" },
                        { value: "3", label: "Third Year" },
                        { value: "4", label: "Fourth Year" },
                      ]}
                      label="Year Level"
                      icon={Calendar}
                      error={errors.yearLevel}
                    />

                    <div className="flex items-start space-x-2 pt-1">
                      <motion.input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (!e.target.checked && errors.terms) {
                             setErrors(prev => ({ ...prev, terms: "You must accept the terms and conditions" }));
                          } else {
                             clearError('terms');
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600
                                  focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I accept the{" "}
                        <motion.button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium relative"
                          whileHover={{ scale: 0.95 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left transform scale-x-0 transition-transform duration-300 hover:scale-x-100" />
                          Terms and Conditions & Privacy Policy
                        </motion.button>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-sm mt-1 pl-3.5">
                        {errors.terms}
                      </p>
                    )}

                    <div className="flex gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 h-12 bg-white ring-1 ring-gray-200
                                  text-gray-700 rounded-lg font-medium
                                  flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={smoothTransition}
                      >
                        Back
                      </motion.button>

                      <motion.button
                        type="submit"
                        className="w-2/3 h-12 bg-gradient-to-r from-blue-600 to-blue-500 
                                  text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 
                                  flex items-center justify-center gap-2 group relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.01,
                          background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={smoothTransition}
                        disabled={!acceptedTerms || isLoading}
                        aria-label={isLoading ? "Creating account..." : "Create Account"}
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
                          "Create Account"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
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

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-50"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Terms and Conditions & Privacy Policy
                  </h2>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close terms modal"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="prose prose-sm max-h-96 overflow-y-auto">
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Terms of Service</h3>
                    
                    <section aria-labelledby="acceptance-of-terms">
                      <h4 id="acceptance-of-terms" className="font-medium">1. Acceptance of Terms</h4>
                      <p>
                        By accessing or using the LearnVanguard platform, you agree to be bound by these Terms of Service. 
                        If you do not agree to all terms, do not use our services.
                      </p>
                    </section>

                    <section aria-labelledby="user-responsibilities">
                      <h4 id="user-responsibilities" className="font-medium">2. User Responsibilities</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate and complete registration information</li>
                        <li>Maintain confidentiality of your account credentials</li>
                        <li>Use the platform only for lawful educational purposes</li>
                        <li>Do not share copyrighted materials without authorization</li>
                      </ul>
                    </section>

                    <section aria-labelledby="intellectual-property">
                      <h4 id="intellectual-property" className="font-medium">3. Intellectual Property</h4>
                      <p>
                        All course materials, logos, and software are property of La Verdad Christian College. 
                        Users are granted limited, non-exclusive license for personal educational use only.
                      </p>
                    </section>

                    <h3 className="font-semibold text-gray-900 mt-6">Privacy Policy</h3>

                    <section aria-labelledby="data-collection">
                      <h4 id="data-collection" className="font-medium">1. Information We Collect</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Personal identification (Name, Student Number, Email)</li>
                        <li>Academic information (Course, Year Level)</li>
                        <li>Usage data and platform interactions</li>
                        <li>Technical information (IP address, device type)</li>
                      </ul>
                    </section>

                    <section aria-labelledby="data-usage">
                      <h4 id="data-usage" className="font-medium">2. Use of Information</h4>
                      <p>We use collected data to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide and improve educational services</li>
                        <li>Personalize learning experiences</li>
                        <li>Communicate important platform updates</li>
                        <li>Ensure compliance with academic policies</li>
                      </ul>
                    </section>

                    <section aria-labelledby="data-protection">
                      <h4 id="data-protection" className="font-medium">3. Data Protection</h4>
                      <p>
                        We implement industry-standard security measures including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>SSL/TLS encryption for data transmission</li>
                        <li>Regular security audits</li>
                        <li>Role-based access controls</li>
                        <li>Secure server infrastructure</li>
                      </ul>
                    </section>

                    <section aria-labelledby="policy-changes">
                      <h4 id="policy-changes" className="font-medium">4. Policy Changes</h4>
                      <p>
                        We reserve the right to modify these terms. Users will be notified of significant changes
                        through their registered email address.
                      </p>
                    </section>

                    <section aria-labelledby="contact-info">
                      <h4 id="contact-info" className="font-medium">Contact Information</h4>
                      <p>
                        For questions regarding these policies, contact our support team:<br />
                        Email: learnvanguard@laverdad.edu.ph<br />
                        Phone: +63 123 456 7890<br />
                        Office Hours: Mon-Fri 8:00 AM - 5:00 PM PST
                      </p>
                    </section>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={() => {
                      setIsModalOpen(false);
                      setAcceptedTerms(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Accept & Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUp;
