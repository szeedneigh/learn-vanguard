import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/error/ErrorBoundary";
import SkipNav from "./components/accessibility/SkipNav";
import React, { lazy, Suspense, useEffect } from "react";

// Code splitting - lazy load routes
const LandingPage = lazy(() => import("./app/pages/LandingPage"));
const SignUp = lazy(() => import("./app/auth/SignUp"));
const LogIn = lazy(() => import("./app/auth/LogIn"));
const Dashboard = lazy(() => import("./app/pages/Dashboard"));
const NotFound = lazy(() => import("./app/pages/NotFound"));
const ForgotPassword = lazy(() => import("./app/auth/ForgotPassword"));
const ProtectedRoute = lazy(() => import("./app/auth/ProtectedRoute"));
const UnauthorizedPage = lazy(() => import("./app/pages/UnauthorizedPage"));
const EmailVerification = lazy(() => import("./app/EmailVerification"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
      <SkipNav />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
        <Toaster />
      </Router>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </ErrorBoundary>
  );
}

export default App;
