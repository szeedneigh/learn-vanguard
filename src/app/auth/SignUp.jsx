import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowRight,
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import PropTypes from 'prop-types';

const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FloatingLabelInput = React.memo(
  ({
    id,
    label,
    type = "text",
    value,
    onChange,
    required = false,
    icon: Icon,
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
            className={`w-full h-12 ${
              Icon ? "pl-10" : "pl-3.5"
            } pr-3.5 pt-3 pb-1 rounded-lg
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
        </div>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';
FloatingLabelInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
};

const SelectInput = ({ value, onChange, options, label, icon: Icon }) => (
  <div className="relative w-full">
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full h-12 ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 rounded-lg
                bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500
                text-gray-900 text-sm transition-all duration-200 outline-none`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

SelectInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
};

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

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 data
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    // Step 2 data
    studentNo: "",
    course: "",
    yearLevel: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmitStep1 = useCallback((e) => {
    e.preventDefault();
    setStep(2);
  }, []);

  const handleSubmitStep2 = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle successful signup
      navigate('/dashboard')
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Form Section */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto w-full space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-2 mb-6">
                    <h1
                      className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 
                                            bg-clip-text text-transparent"
                    >
                      Welcome aboard
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Already have an account?{" "}
                      <Link to="/login">
                        <motion.span
                          className="text-blue-600 font-medium hover:text-blue-700"
                          whileHover={{ scale: 1.05 }}
                          transition={smoothTransition}
                        >
                          Sign in
                        </motion.span>
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmitStep1} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingLabelInput
                        id="firstname"
                        label="First Name"
                        value={formData.firstname}
                        onChange={handleChange("firstname")}
                        required
                        icon={User}
                      />
                      <FloatingLabelInput
                        id="lastname"
                        label="Last Name"
                        value={formData.lastname}
                        onChange={handleChange("lastname")}
                        required
                        icon={User}
                      />
                    </div>

                    <FloatingLabelInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      required
                      icon={Mail}
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
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <motion.button
                          type="button"
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 
                                            text-white rounded-lg font-medium shadow-md shadow-blue-500/20 
                                            flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={smoothTransition}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                      Signup with Google
                    </AnimatedButton>
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
                    <h1
                      className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 
                                            bg-clip-text text-transparent"
                    >
                      Academic Details
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Please provide your student information
                    </p>
                  </div>

                  <form onSubmit={handleSubmitStep2} className="space-y-5">
                    <FloatingLabelInput
                      id="studentNo"
                      label="Student Number"
                      value={formData.studentNo}
                      onChange={handleChange("studentNo")}
                      required
                      icon={GraduationCap}
                    />

                    <SelectInput
                      value={formData.course}
                      onChange={handleChange("course")}
                      options={[
                        {
                          value: "BSIS",
                          label: "Bachelor of Science in Information Systems",
                        },
                        {
                          value: "ACT",
                          label: "Associate in Computer Technology",
                        },
                      ]}
                      label="Select Course"
                      icon={BookOpen}
                    />

                    <SelectInput
                      value={formData.yearLevel}
                      onChange={handleChange("yearLevel")}
                      options={[
                        { value: "1", label: "First Year" },
                        { value: "2", label: "Second Year" },
                        { value: "3", label: "Third Year" },
                        { value: "4", label: "Fourth Year" },
                      ]}
                      label="Select Year Level"
                      icon={Calendar}
                    />

                    <div className="flex items-start space-x-2">
                      <motion.input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 
                                                focus:ring-blue-500 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I accept the{" "}
                        <motion.button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                          whileHover={{ scale: 0.95 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Terms and Conditions & Privacy Policy
                        </motion.button>
                      </label>
                    </div>

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
                        className="w-2/3 h-12 bg-gradient-to-r from-blue-600 to-blue-600 
                                                text-white rounded-lg font-medium shadow-md shadow-blue-500/20 
                                                flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={smoothTransition}
                        disabled={!acceptedTerms || isLoading}
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

        {/* Background Image Section */}
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-900/85 to-blue-800/75" />
          </div>
        </motion.div>
      </div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="prose prose-sm max-h-96 overflow-y-auto">
                  <p className="text-gray-600">
                    <strong>Terms & Conditions</strong>
                    <br />
                    Welcome to Student Resource Hub. By accessing or using our
                    platform, you agree to comply with the following terms and
                    conditions. If you disagree with any part of these terms,
                    please discontinue use of the platform.
                    <br />
                    <br />
                    1. Introduction <br />
                    The Student Resource Hub provides tools and resources to
                    assist students and the institution in academic excellence. By
                    using our services, you agree to these Terms and Conditions.
                    <br />
                    <br />
                    2. User Responsibilities <br />
                    Users must provide accurate information when creating
                    accounts. Users must respect intellectual property rights
                    and avoid unauthorized sharing of resources. Users must not
                    engage in any activity that disrupts the platform&apos;s
                    operation.
                    <br />
                    <br />
                    3. Privacy Policy
                    <br />
                    We collect and process your personal information in
                    accordance with our Privacy Policy. Your data will be used
                    only for the purposes specified in our Privacy Policy. We
                    implement appropriate security measures to protect your
                    personal information.
                    <br />
                    <br />
                    4. Account Security
                    <br />
                    You are responsible for maintaining the confidentiality of
                    your account credentials. You must notify us immediately of
                    any unauthorized use of your account.
                    <br />
                    <br />
                    5. Prohibited Activities
                    <br />
                    Users must not:
                    <br />- Share account credentials
                    <br />- Upload malicious content
                    <br />- Attempt to breach system security
                    <br />- Engage in unauthorized data collection
                    <br />
                    <br />
                    <br />
                    <strong>Privacy Policy</strong>
                    <br />
                    At Student Resource Hub, we prioritize your privacy and are
                    committed to protecting your personal information. This
                    policy explains how we collect, use, and manage your data.
                    <br />
                    <br />
                    1. Information We Collect
                    <br />
                    Personal Information: Name, email address, and other details
                    you provide during registration. Usage Data: Information
                    about your interactions with the platform, such as page
                    visits and clicks.
                    <br />
                    <br />
                    2. How We Use Your Data
                    <br />
                    We use the collected information to:
                    <br />
                    Provide and maintain our services. Personalize your user
                    experience. Improve our platform&apos;s performance and
                    functionality.
                    <br />
                    <br />
                    3. Sharing Your Information
                    <br />
                    We may share your information with:
                    <br />
                    Third-party services, such as analytics providers, for
                    improving platform functionality. Legal authorities, if
                    required by law.
                    <br />
                    <br />
                    4. Data Security
                    <br />
                    We implement industry-standard measures to protect your
                    data. However, no method of transmission over the internet
                    is 100% secure, and we cannot guarantee absolute security.
                    <br />
                    <br />
                    5. Your Rights
                    <br />
                    You have the right to:
                    <br />
                    Access the personal information we hold about you. Request
                    correction or deletion of your data. Opt out of data
                    collection for certain purposes.
                    <br />
                    <br />
                    6. Contact Us
                    <br />
                    If you have any questions or concerns about this Privacy
                    Policy, please contact us at learnvanguard@laverdad.edu.ph.
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={() => {
                      setIsModalOpen(false);
                      setAcceptedTerms(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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