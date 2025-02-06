import { useRef, useEffect } from 'react';
import { Camera, LogOut, User, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50",
        "transition-all duration-300 ease-in-out transform origin-top",
        isOpen 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
      )}
    >
      {/* Close Button */}
      <div className="absolute right-2 top-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-semibold">JD</span>
            </div>
            <button 
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Upload photo')}
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">John Doe</h3>
          <p className="text-sm text-gray-500">Student</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="text-sm">john.doe@example.com</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">@johndoe</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-2">
        <button
          onClick={handleLogout}
          className="w-full px-2 py-2 text-left text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;