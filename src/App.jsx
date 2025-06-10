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

function App() {
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
