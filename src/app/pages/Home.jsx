import React from "react";
import { useAuth } from "@/context/AuthContext";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import PIODashboard from "@/components/dashboard/PIODashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

/**
 * HOME PAGE - Role-Based Dashboard Router
 * Renders the appropriate dashboard based on user role
 */
const Home = () => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-h5 font-medium">
            Loading your dashboard...
          </h3>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'PIO':
      return <PIODashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
};

export default Home;
