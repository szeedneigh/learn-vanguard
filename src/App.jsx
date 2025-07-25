import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "./app/pages/LandingPage";
import SignUp from "./app/auth/SignUp";
import LogIn from "./app/auth/LogIn";
import Dashboard from "./app/pages/Dashboard";
import NotFound from "./app/pages/NotFound";
import ForgotPassword from "./app/auth/ForgotPassword";
import ProtectedRoute from "./app/auth/ProtectedRoute";
import UnauthorizedPage from "./app/pages/UnauthorizedPage";
import ErrorBoundary from "./components/error/ErrorBoundary";
import EmailVerification from "./app/EmailVerification";
import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleNetworkError = (e) => {
      window.toast &&
        window.toast({
          title: "Network Error",
          description:
            e.detail?.message ||
            "You appear to be offline. Some features may not work.",
          variant: "destructive",
        });
    };
    const handleTimeout = (e) => {
      window.toast &&
        window.toast({
          title: "Request Timeout",
          description: `Request to ${e.detail?.url || "the server"} timed out. Please check your connection.`,
          variant: "destructive",
        });
    };
    const handleServerError = (e) => {
      window.toast &&
        window.toast({
          title: "Server Error",
          description:
            e.detail?.message ||
            "A server error occurred. Please try again later.",
          variant: "destructive",
        });
    };
    window.addEventListener("api:network-error", handleNetworkError);
    window.addEventListener("api:timeout", handleTimeout);
    window.addEventListener("api:server-error", handleServerError);
    return () => {
      window.removeEventListener("api:network-error", handleNetworkError);
      window.removeEventListener("api:timeout", handleTimeout);
      window.removeEventListener("api:server-error", handleServerError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected dashboard route - open to any authenticated user */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Email verification routes */}
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route
            path="/verify-email/:userId/:code"
            element={<EmailVerification />}
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </ErrorBoundary>
  );
}

export default App;
