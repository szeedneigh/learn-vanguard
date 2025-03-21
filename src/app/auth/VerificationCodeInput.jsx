import { useRef, useEffect } from "react";

const VerificationCodeInput = ({ value, onChange, onComplete }) => {
  const inputRefs = useRef(Array(6).fill(null));

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index, e) => {
    const newValue = e.target.value;

    if (newValue.length > 1) {
      const pastedCode = newValue.replace(/\D/g, "").slice(0, 6);
      onChange(pastedCode);
      inputRefs.current[Math.min(pastedCode.length - 1, 5)]?.focus();
      return;
    }

    if (!/^\d*$/.test(newValue)) return;

    const newCode = (value || "").split("");
    newCode[index] = newValue;
    const newCodeStr = newCode.join("").slice(0, 6);

    onChange(newCodeStr);

    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCodeStr.length === 6) {
      onComplete();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value?.[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value?.[index] || ""}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => (inputRefs.current[index] = el)}
          className="w-12 h-12 text-2xl text-center border-2 border-gray-300 rounded-lg
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30
                     transition-all duration-150"
          aria-label={`Verification code digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;