import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@/context/AuthContext';
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // Authentication check - redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authorization check - verify user has required role if specified
  const isAuthorized = !allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.includes(user.role));

  if (allowedRoles && !isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized - render child routes
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  allowedRoles: null,
};

export default ProtectedRoute;