import { useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileModal from './ProfileModal';

const Topbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const notifications = 3;

  return (
    <>
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          {/* Left side - Title */}
          <div className="flex items-center">
            {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1> */}
          </div>

          {/* Right side - Search and Actions */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <div className={cn(
                "relative flex items-center transition-all duration-300",
                isSearchFocused ? "w-96" : "w-64"
              )}>
                <Search className={cn(
                  "absolute left-3 transition-colors duration-200",
                  isSearchFocused ? "text-blue-500" : "text-gray-400",
                  "h-4 w-4"
                )} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anything..."
                  className={cn(
                    "pl-10 pr-10 py-2.5 w-full",
                    "rounded-xl bg-gray-50",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white",
                    "hover:bg-gray-100 focus:hover:bg-white"
                  )}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchValue && (
                  <button 
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200",
                "group relative"
              )}>
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{notifications}</span>
                  </span>
                )}
              </button>
            </div>

            {/* Profile Button */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Topbar;