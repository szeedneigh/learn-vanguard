import logger from "@/utils/logger";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen, Calendar } from "lucide-react";
import PropTypes from "prop-types";
import { authService } from "@/services/authService";
import { getCurrentUserToken } from "@/config/firebase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Reusable input components
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
          <select
              peer ${value ? "" : "text-gray-400"} appearance-none shadow-sm`}
            onBlur={() => setIsFocused(false)}
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
            <span className="text-red-500 ml-0.5">*</span>
          <div className="absolute right-3.5 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
SelectInput.displayName = "SelectInput";
SelectInput.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
const GoogleAcademicDetailsStep = ({
  email,
  onSubmit,
  onCancel,
  flowType = "login",
}) => {
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
  const courseOptions = [
    { value: "", label: "Select Course", disabled: true },
    { value: "BSIT", label: "BS in Information Technology" },
    { value: "BSCS", label: "BS in Computer Science" },
    { value: "ACT", label: "Associate in Computer Technology" },
  ];
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
    return currentErrors;
  }, [formData, acceptedTerms, validateField]);
  const handleInputChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
      const error = validateField(id, value);
      setErrors((prev) => ({ ...prev, [id]: error, form: "" }));
      if (id === "course") {
        if (value === "ACT") {
          setYearLevelOptions([
            { value: "", label: "Select Year Level", disabled: true },
            { value: "1", label: "First Year" },
            { value: "2", label: "Second Year" },
          ]);
          if (formData.yearLevel === "3" || formData.yearLevel === "4") {
            setFormData((prev) => ({ ...prev, yearLevel: "" }));
          }
        } else {
            { value: "3", label: "Third Year" },
            { value: "4", label: "Fourth Year" },
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
    setIsLoading(true);
    setErrors({});
    try {
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
        if (onCancel) onCancel();
        return;
      if (onSubmit) {
        await onSubmit({ ...formData, email });
    } catch (error) {
      logger.error("Registration error:", error);
      setErrors({
        form: "An error occurred during registration. Please try again.",
      });
      toast({
        title: "Registration Error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
    } finally {
      setIsLoading(false);
  };
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Academic Details</h2>
        <p className="text-gray-500">
          {flowType === "login"
            ? "Complete your profile to continue"
            : "Please provide your academic information"}
        </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <Alert variant="destructive">
            <AlertDescription>{errors.form}</AlertDescription>
          </Alert>
        <FloatingLabelInput
          id="studentNo"
          label="Student Number"
          value={formData.studentNo}
          onChange={handleInputChange}
          required
          icon={GraduationCap}
          error={errors.studentNo}
        />
        <SelectInput
          id="course"
          label="Course"
          value={formData.course}
          options={courseOptions}
          icon={BookOpen}
          error={errors.course}
          id="yearLevel"
          label="Year Level"
          value={formData.yearLevel}
          options={yearLevelOptions}
          icon={Calendar}
          error={errors.yearLevel}
        <div className="flex items-center gap-2">
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              if (e.target.checked) {
                setErrors((prev) => ({ ...prev, terms: "" }));
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the terms and conditions
          </label>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isLoading}
            Cancel
          </Button>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Continue"}
      </form>
    </div>
GoogleAcademicDetailsStep.propTypes = {
  email: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  flowType: PropTypes.oneOf(["login", "signup"]),
export default GoogleAcademicDetailsStep;
