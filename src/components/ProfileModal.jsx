import { Camera, Settings, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // logout logic here
    localStorage.clear(); // Clear any stored user data
    navigate('/'); // Redirect to landing page
    onClose(); // Close the modal
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Implement profile update logic
    console.log('Updating profile...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-semibold">JD</span>
            </div>
            <button 
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Upload photo')}
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <h3 className="mt-4 font-semibold text-lg">John Doe</h3>
          <p className="text-sm text-gray-500">Student</p>
        </div>

        <Separator />

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
        </form>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => console.log('Settings clicked')}>
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-600" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;