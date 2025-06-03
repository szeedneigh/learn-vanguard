import { useState, useRef, useEffect } from "react";
import { Camera, LogOut, Users, Edit, Save, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import PropTypes from "prop-types";
import { getUserInitials, formatUserRole } from "@/utils/userUtils";
import PopoverModal from "@/components/ui/PopoverModal";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCurrentUserProfile, uploadUserAvatar } from "@/lib/api/userApi";

const ProfileModal = ({ isOpen, onClose, user = null, triggerRef }) => {
  const navigate = useNavigate();
  const { logout, refreshUserData } = useAuth();
  const { hasPermission } = usePermission();
  const fileInputRef = useRef(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Update form data and avatar when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(error.message || "Failed to log out. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateImageFile = (file) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image is too large. Maximum size is 5MB");
      return false;
    }

    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate the file is an image and not too large
    if (!validateImageFile(file)) {
      e.target.value = ""; // Reset the file input
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadUserAvatar(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        toast.success("Profile picture updated successfully");
        // Update avatar URL locally instead of reloading
        setAvatarUrl(result.url);
        // Refresh user data in context without page reload
        refreshUserData();
      } else {
        toast.error(result.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateCurrentUserProfile(formData);

      if (result.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Refresh user data in context without page reload
        refreshUserData();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || "Current User";
  };

  return (
    <PopoverModal
      isOpen={isOpen}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      triggerRef={triggerRef}
      className="w-80"
      align="end"
    >
      {/* Profile Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white"
                onError={(e) => {
                  console.error("Error loading avatar:", e);
                  // Prevent infinite error loop
                  e.target.onerror = null;
                  // Hide the image
                  e.target.style.display = "none";
                  // Show the fallback div
                  const parent = e.target.parentNode;
                  if (!parent.querySelector(".avatar-fallback")) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md avatar-fallback";
                    const span = document.createElement("span");
                    span.className = "text-white text-xl font-semibold";
                    span.textContent = user
                      ? getUserInitials(user.firstName, user.lastName)
                      : "U";
                    fallback.appendChild(span);
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-semibold">
                  {user ? getUserInitials(user.firstName, user.lastName) : "U"}
                </span>
              </div>
            )}
            <button
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {isUploading && (
            <div className="w-full mt-2">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {!isEditing ? (
            <>
              <h3 className="mt-3 font-semibold text-gray-900">
                {getDisplayName()}
              </h3>
              <p className="text-sm text-gray-500">
                {user ? formatUserRole(user.role) : "Role"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user?.email || ""}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit Profile
              </button>
            </>
          ) : (
            <div className="mt-3 w-full space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">First Name</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-8 text-sm"
                  disabled
                />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveProfile}
                  className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-2 py-2">
        {hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD) && (
          <Link
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            <Users className="w-4 h-4" />
            Admin Dashboard
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </PopoverModal>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  triggerRef: PropTypes.object,
};

export default ProfileModal;
