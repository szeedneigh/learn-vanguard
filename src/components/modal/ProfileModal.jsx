import { useState, useRef, useEffect } from "react";
import { Camera, LogOut, Users, Edit, Save, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import PropTypes from "prop-types";
import { getUserInitials, formatUserRole } from "@/utils/userUtils";
import PopoverModal from "@/components/ui/PopoverModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateCurrentUserProfile,
  uploadUserAvatar,
  getCurrentUserProfile,
} from "@/lib/api/userApi";

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
  // Add state for user profile data
  const [profileData, setProfileData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Fetch current user profile when modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchUserProfile = async () => {
        try {
          const result = await getCurrentUserProfile();

          if (result.success && result.data) {
            setProfileData(result.data);
            setFormData({
              firstName: result.data.firstName || "",
              lastName: result.data.lastName || "",
              email: result.data.email || "",
            });
            // Update avatar URL from fresh profile data
            setAvatarUrl(result.data.avatarUrl || user?.avatarUrl || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    } else {
      // Reset state when modal is closed
      setIsEditing(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen, user?.avatarUrl]);

  // Update form data and avatar when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || profileData?.firstName || "",
        lastName: user.lastName || profileData?.lastName || "",
        email: user.email || profileData?.email || "",
      });

      // Always use the current user's avatar URL only
      const newAvatarUrl = user.avatarUrl || null;
      console.log("ProfileModal: Setting avatar URL for user:", {
        userId: user.id,
        userEmail: user.email,
        avatarUrl: newAvatarUrl,
      });
      setAvatarUrl(newAvatarUrl);
    } else {
      // Clear avatar when no user is present
      console.log("ProfileModal: Clearing avatar URL - no user");
      setAvatarUrl(null);
    }
  }, [user, profileData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Image is too large. Maximum size is 5MB",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
          variant: "default",
        });
        // Update avatar URL locally instead of reloading
        setAvatarUrl(result.url);
        // Update profile data with the new user data
        if (result.data && result.data.user) {
          setProfileData(result.data.user);
        }
        // Refresh user data in context without page reload
        refreshUserData();
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload profile picture",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        });
        setIsEditing(false);
        // Update profile data with the new user data
        if (result.data) {
          setProfileData(result.data);
        }
        // Refresh user data in context without page reload
        refreshUserData();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || profileData?.name || "Current User";
  };

  // Get the email to display
  const getEmail = () => {
    return profileData?.email || user?.email || "";
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
                key={avatarUrl}
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
              <p className="text-xs text-gray-500 mt-1">{getEmail()}</p>

              {/* Show Course and Year Level for Students and PIOs only */}
              {(user?.role === "student" ||
                user?.role === "pio" ||
                profileData?.role === "student" ||
                profileData?.role === "pio") && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {profileData?.course ||
                      user?.course ||
                      "Course not specified"}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    {profileData?.yearLevel ||
                      user?.yearLevel ||
                      "Year not specified"}
                  </p>
                </div>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
