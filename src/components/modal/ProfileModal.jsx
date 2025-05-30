import { Camera, LogOut, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { PERMISSIONS } from '@/lib/constants';
import PropTypes from 'prop-types';
import { getUserInitials, formatUserRole } from '@/utils/userUtils';
import PopoverModal from '@/components/ui/PopoverModal';
import toast from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, user = null, triggerRef }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = usePermission();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Failed to log out. Please try again.');
    }
  };

  return (
    <PopoverModal
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      className="w-80"
      align="end"
    >
      {/* Profile Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-semibold">
                {user ? getUserInitials(user.name) : 'U'}
              </span>
            </div>
            <button 
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Upload photo functionality to be implemented')}
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">
            {user ? user.name : 'Current User'}
          </h3>
          <p className="text-sm text-gray-500">
            {user ? formatUserRole(user.role) : 'Role'}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      {user && user.email && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-2 py-2 space-y-1">
        {hasPermission(PERMISSIONS.VIEW_USERS) && (
          <Link
            to="/dashboard/users"
            onClick={onClose}
            className="w-full px-2 py-2 text-left text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-2 py-2 text-left text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </PopoverModal>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  triggerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default ProfileModal;