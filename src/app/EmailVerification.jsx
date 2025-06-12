import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function EmailVerification() {
  const { userId, code } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail, isLoading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(
    userId && code ? "verifying" : "instructions"
  );
  const [errorMessage, setErrorMessage] = useState("");

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
    const result = await resendVerificationEmail();

    if (result.success) {
      toast({
        title: "Email Sent",
        description: "A new verification email has been sent to your address.",
      });
    } else {
      toast({
        title: "Failed to Send",
        description: result.error || "Failed to send verification email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-6"
      >
        {verificationStatus === "verifying" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verifying your email...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">
              Email Verified!
            </h2>
            <p className="text-gray-500 mt-2">
              Your email has been successfully verified.
            </p>
            <p className="text-gray-500 mt-1">
              You will be redirected to login shortly...
            </p>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 rounded-full bg-red-100 p-3 w-fit">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verification Failed
            </h2>
            <p className="text-gray-500 mt-2">{errorMessage}</p>
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        )}

        {verificationStatus === "instructions" && (
          <div className="text-center py-8">
            <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">
              Verify Your Email
            </h2>
            <p className="text-gray-500 mt-2">
              We've sent a verification email to your address. Please check your
              inbox and click the verification link.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
            <div className="mt-4">
              <button
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
