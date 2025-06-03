import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, Lock } from "lucide-react";
import FloatingLabelInput from "./FloatingLabelInput";

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

export default PasswordInput; 