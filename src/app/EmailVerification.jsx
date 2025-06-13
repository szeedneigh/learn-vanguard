import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, X, ChevronLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

function EmailVerification() {
  const { userId, code } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail, isLoading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(
    userId && code ? "verifying" : "instructions"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  useEffect(() => {
    const verifyEmailAddress = async () => {
      if (userId && code) {
        // Handle direct link verification
        const result = await verifyEmail(userId, code);

        if (result.success) {
          setVerificationStatus("success");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setErrorMessage(result.error || "Verification failed");
        }
      }
    };

    if (userId && code) {
      verifyEmailAddress();
    }
  }, [userId, code, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(30); // 30 seconds cooldown
    setResendSuccess(false);

    const result = await resendVerificationEmail();

    if (result.success) {
      setErrorMessage("");
      setResendSuccess(true);
    } else {
      setErrorMessage(result.error || "Failed to send verification email.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-violet-50/95 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Content */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto w-full space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={verificationStatus}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => navigate("/login")}
                      whileHover={{ scale: 1.05 }}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                      {verificationStatus === "verifying"
                        ? "Verifying Email"
                        : verificationStatus === "success"
                        ? "Email Verified"
                        : verificationStatus === "error"
                        ? "Verification Failed"
                        : "Verify Your Email"}
                    </h1>
                  </div>
                </div>

                {/* Error Display */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Success Message */}
                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="mb-4 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        Verification email has been resent successfully.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Content Section */}
                {verificationStatus === "verifying" && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Verifying your email...
                    </h2>
                    <p className="text-gray-500">
                      Please wait while we verify your email address.
                    </p>
                  </motion.div>
                )}

                {verificationStatus === "success" && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Email Verified!
                    </h2>
                    <p className="text-gray-500 mb-2">
                      Your email has been successfully verified.
                    </p>
                    <p className="text-gray-500">
                      You will be redirected to login shortly...
                    </p>
                  </motion.div>
                )}

                {verificationStatus === "error" && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="rounded-full bg-red-100 p-3">
                        <X className="h-10 w-10 text-red-500" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Verification Failed
                    </h2>
                    <p className="text-gray-500 mb-6">{errorMessage}</p>

                    <motion.button
                      onClick={handleResendVerification}
                      disabled={isLoading || !canResend}
                      className={`w-full h-12 rounded-xl font-medium shadow-lg
                               flex items-center justify-center gap-2 relative overflow-hidden
                               transition-all ${
                                 canResend
                                   ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white hover:shadow-blue-500/20"
                                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
                               }`}
                      whileHover={canResend ? { scale: 1.01 } : {}}
                      whileTap={canResend ? { scale: 0.98 } : {}}
                      transition={smoothTransition}
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
                      ) : canResend ? (
                        "Resend Verification Email"
                      ) : (
                        `Resend available in ${resendTimer}s`
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {verificationStatus === "instructions" && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <Mail className="h-16 w-16 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Verify Your Email
                    </h2>
                    <p className="text-gray-500 mb-2">
                      We&apos;ve sent a verification email to your address.
                      Please check your inbox and click the verification link.
                    </p>
                    <p className="text-gray-500 mb-6 text-sm">
                      If you don&apos;t see the email in your inbox, please
                      check your spam folder.
                    </p>

                    <motion.button
                      onClick={handleResendVerification}
                      disabled={isLoading || !canResend}
                      className={`w-full h-12 rounded-xl font-medium shadow-lg
                               flex items-center justify-center gap-2 relative overflow-hidden
                               transition-all ${
                                 canResend
                                   ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white hover:shadow-blue-500/20"
                                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
                               }`}
                      whileHover={canResend ? { scale: 1.01 } : {}}
                      whileTap={canResend ? { scale: 0.98 } : {}}
                      transition={smoothTransition}
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
                      ) : canResend ? (
                        "Resend Verification Email"
                      ) : (
                        `Resend available in ${resendTimer}s`
                      )}
                    </motion.button>

                    <div className="text-center text-sm text-gray-600 mt-4">
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
                  </motion.div>
                )}
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
              src="/images/LearnVanguard_LOGO.png"
              alt="Learn Vanguard Logo"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 max-w-[600px] drop-shadow-xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmailVerification;
