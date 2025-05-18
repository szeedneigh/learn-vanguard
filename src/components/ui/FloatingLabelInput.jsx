import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

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

export default FloatingLabelInput; 