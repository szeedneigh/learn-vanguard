import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, BookOpen, Calendar, Check } from "lucide-react";
import PropTypes from "prop-types";
import { authService } from "@/services/authService";
import { getCurrentUserToken } from "@/config/firebase";

// Reuse components from SignUp.jsx
const FloatingLabelInput = React.memo(
  ({
    id,
    label,
    type = "text",
    value,
    onChange,
    required = false,
    icon: Icon,
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
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
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
            className={`w-full h-12 ${
              Icon ? "pl-10" : "pl-3.5"
            } pt-3 pb-1 rounded-lg
              bg-white ring-1 ${
                error ? "ring-red-500" : "ring-gray-200"
              } focus:ring-2 focus:ring-blue-500
              text-gray-900 text-sm transition-all duration-200 outline-none
              peer placeholder-transparent shadow-sm`}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => value.length === 0 && setIsFocused(false)}
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
  error: PropTypes.string,
};

const SelectInput = React.memo(
  ({ id, value, onChange, options, label, icon: Icon, error }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full group">
        <div className="relative flex items-center">
          {Icon && (
            <motion.div
              className="absolute left-3.5 text-gray-400 group-focus-within:text-blue-500"
              animate={{ scale: isFocused ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          )}
          <select
            id={id}
            value={value}
            onChange={onChange}
            className={`w-full h-12 ${
              Icon ? "pl-10" : "pl-3.5"
            } pt-3 pb-1 rounded-lg
              bg-white ring-1 ${
                error ? "ring-red-500" : "ring-gray-200"
              } focus:ring-2 focus:ring-blue-500
              text-gray-900 text-sm transition-all duration-200 outline-none
              peer ${value ? "" : "text-gray-400"} appearance-none shadow-sm`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <motion.label
            htmlFor={id}
            className={`absolute left-0 ${
              Icon ? "ml-10" : "ml-3.5"
            } transition-all duration-200
              transform -translate-y-2 scale-75 top-2 z-10 origin-[0]
              ${
                error ? "text-red-500" : "text-gray-500"
              } peer-focus:text-blue-500 text-sm font-medium`}
          >
            {label}
            <span className="text-red-500 ml-0.5">*</span>
          </motion.label>
          <div className="absolute right-3.5 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

SelectInput.displayName = "SelectInput";
SelectInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  error: PropTypes.string,
};

const GoogleRegistration = ({ email, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentNo: "",
    course: "",
    yearLevel: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [yearLevelOptions, setYearLevelOptions] = useState([
    { value: "", label: "Select Year Level", disabled: true },
    { value: "1", label: "First Year" },
    { value: "2", label: "Second Year" },
    { value: "3", label: "Third Year" },
    { value: "4", label: "Fourth Year" },
  ]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "studentNo":
        return !value.trim() ? "Student number is required" : "";
      case "course":
        return !value ? "Course is required" : "";
      case "yearLevel":
        return !value ? "Year level is required" : "";
      default:
        return "";
    }
  }, []);

  const validateForm = useCallback(() => {
    const currentErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) currentErrors[field] = error;
    });

    if (!acceptedTerms) {
      currentErrors.terms = "You must accept the terms and conditions";
    }

    return currentErrors;
  }, [formData, acceptedTerms, validateField]);

  const handleInputChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
      const error = validateField(id, value);
      setErrors((prev) => ({ ...prev, [id]: error, form: "" }));

      // Update year level options based on selected course
      if (id === "course") {
        if (value === "ACT") {
          setYearLevelOptions([
            { value: "", label: "Select Year Level", disabled: true },
            { value: "1", label: "First Year" },
            { value: "2", label: "Second Year" },
          ]);
          // Reset year level if it was set to 3 or 4
          if (formData.yearLevel === "3" || formData.yearLevel === "4") {
            setFormData((prev) => ({ ...prev, yearLevel: "" }));
          }
        } else {
          setYearLevelOptions([
            { value: "", label: "Select Year Level", disabled: true },
            { value: "1", label: "First Year" },
            { value: "2", label: "Second Year" },
            { value: "3", label: "Third Year" },
            { value: "4", label: "Fourth Year" },
          ]);
        }
      }
    },
    [validateField, formData.yearLevel]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get a fresh Firebase token to avoid token expiration issues
      const freshToken = await getCurrentUserToken();

      if (!freshToken) {
        toast({
          title: "Authentication Error",
          description:
            "Unable to get authentication token. Please try signing in with Google again.",
          variant: "destructive",
        });
        setErrors({
          form: "Authentication session expired. Please try again.",
        });
        if (onCancel) onCancel();
        return;
      }

      // Call API to complete Google registration
      const result = await authService.completeGoogleRegistration({
        idToken: freshToken, // Use fresh token instead of passed prop
        studentNo: formData.studentNo, // This will be mapped to studentNumber in the service
        course: formData.course,
        yearLevel: formData.yearLevel,
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        });

        if (onSuccess) {
          onSuccess(result);
        } else {
          // Check if email verification is required
          if (result.requiresEmailVerification) {
            toast({
              title: "Email Verification Required",
              description: "Please check your email to verify your account.",
            });
            // Wait a moment to ensure auth state is updated
            setTimeout(() => {
              navigate("/verify-email");
            }, 500);
          } else {
            // Wait a moment to ensure auth state is updated
            setTimeout(() => {
              navigate("/dashboard");
            }, 500);
          }
        }
      } else {
        setErrors({
          form: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Google registration error:", error);
      setErrors({
        form: "An unexpected error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="googleRegistration"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Complete Your Registration
          </h1>
          <p className="text-gray-600 text-sm">
            Please provide additional information to complete your account
            setup.
          </p>
          <p className="text-sm font-medium text-blue-600">{email}</p>
        </div>

        {errors.form && (
          <Alert
            variant="destructive"
            className="mb-4 shadow-lg"
            role="alert"
            aria-live="assertive"
          >
            <AlertDescription>{errors.form}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            id="course"
            value={formData.course}
            onChange={(e) =>
              handleInputChange({
                target: { id: "course", value: e.target.value },
              })
            }
            options={[
              { value: "", label: "Select Course", disabled: true },
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
            error={errors.course}
          />

          <SelectInput
            id="yearLevel"
            value={formData.yearLevel}
            onChange={(e) =>
              handleInputChange({
                target: { id: "yearLevel", value: e.target.value },
              })
            }
            options={yearLevelOptions}
            label="Select Year Level"
            icon={Calendar}
            error={errors.yearLevel}
          />

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2 mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, terms: "" }));
                  }
                }}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="terms"
                className={`font-medium ${
                  errors.terms ? "text-red-500" : "text-gray-700"
                }`}
              >
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Terms and Conditions
                </button>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
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
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

GoogleRegistration.propTypes = {
  email: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default GoogleRegistration;
