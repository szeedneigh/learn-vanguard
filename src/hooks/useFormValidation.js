import logger from "@/utils/logger";
import { useState, useCallback, useMemo } from 'react';

/**
 * useFormValidation Hook
 *
 * Provides comprehensive form validation with real-time feedback.
 * Supports field-level and form-level validation, async validators,
 * and touched field tracking.
 *
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation rules per field
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.validateOnChange=false] - Validate on every change
 * @param {boolean} [options.validateOnBlur=true] - Validate on field blur
 * @param {Function} [options.onSubmit] - Submit handler
 * @returns {Object} - Form validation state and handlers
 *
 * @example
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
 *   useFormValidation(
 *     { email: '', password: '' },
 *     {
 *       email: [required('Email is required'), email()],
 *       password: [required('Password is required'), minLength(8)],
 *     }
 *   );
 */
export function useFormValidation(
  initialValues = {},
  validationSchema = {},
  options = {}
) {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Check if form is dirty (has changes from initial values)
  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key] !== initialValues[key]
    );
  }, [values, initialValues]);

  // Check if form is valid (no errors)
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (fieldName, value) => {
      const validators = validationSchema[fieldName];
      if (!validators || !Array.isArray(validators)) {
        return null;
      }

      // Run all validators for this field
      for (const validator of validators) {
        const error = await validator(value, values);
        if (error) {
          return error;
        }
      }

      return null;
    },
    [validationSchema, values]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback(async () => {
    setIsValidating(true);
    const newErrors = {};

    // Validate each field
    for (const fieldName of Object.keys(validationSchema)) {
      const error = await validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    }

    setErrors(newErrors);
    setIsValidating(false);

    return Object.keys(newErrors).length === 0;
  }, [validationSchema, values, validateField]);

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    async (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Validate on change if enabled or if field was already touched
      if (validateOnChange || touched[name]) {
        const error = await validateField(name, newValue);

        setErrors((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
          return newErrors;
        });
      }
    },
    [validateOnChange, touched, validateField]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    async (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        const error = await validateField(name, value);

        setErrors((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
          return newErrors;
        });
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(validationSchema).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate entire form
      const isFormValid = await validateForm();

      if (!isFormValid) {
        // Focus first error field
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.getElementsByName(firstErrorField)[0];
          if (element) {
            element.focus();
          }
        }
        return;
      }

      // Call onSubmit if provided
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          logger.error('Submit error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validationSchema, values, errors, onSubmit, validateForm]
  );

  /**
   * Programmatically set a field value
   */
  const setFieldValue = useCallback(
    async (fieldName, value, shouldValidate = true) => {
      setValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      if (shouldValidate) {
        const error = await validateField(fieldName, value);

        setErrors((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
          return newErrors;
        });
      }
    },
    [validateField]
  );

  /**
   * Programmatically set a field error
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  }, []);

  /**
   * Programmatically set multiple field errors
   */
  const setFieldErrors = useCallback((errors) => {
    setErrors((prev) => ({
      ...prev,
      ...errors,
    }));
  }, []);

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: isTouched,
    }));
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback((newInitialValues) => {
    const resetValues = newInitialValues || initialValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Set multiple values at once
   */
  const setFieldValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  return {
    // Form state
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    isValidating,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Programmatic setters
    setFieldValue,
    setFieldValues,
    setFieldError,
    setFieldErrors,
    setFieldTouched,

    // Validation
    validateField,
    validateForm,

    // Utilities
    resetForm,
    clearErrors,
  };
}
