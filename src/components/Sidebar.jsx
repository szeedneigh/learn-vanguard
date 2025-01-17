import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, BookOpen, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { name: 'Events', href: '/dashboard/events', icon: Calendar }
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex flex-col min-h-screen bg-white shadow-xl relative",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 bg-white rounded-full shadow-lg",
          "p-1.5 hover:bg-gray-50 hover:scale-110",
          "transition-all duration-300 ease-in-out",
          "hover:shadow-md active:scale-95"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-300" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600 transition-transform duration-300" />
        )}
      </button>

      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-in-out">
        <div className={cn(
          "flex items-center h-[76px] transition-all duration-300 ease-in-out",
          isCollapsed ? "justify-center px-4" : "px-6 space-x-3"
        )}>
          <div className={cn(
            "bg-white rounded-xl shadow-lg flex items-center justify-center flex-shrink-0",
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "w-12 h-12" : "w-10 h-10"
          )}>
            <span className="text-blue-600 text-lg font-bold">S</span>
          </div>
          <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"
          )}>
            <span className="font-semibold text-white text-lg whitespace-nowrap">
              Student <br/> Resource Hub
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isCollapsed ? "px-2 py-4" : "p-4",
        "space-y-2"
      )}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center rounded-xl group',
                'transition-all duration-300 ease-in-out',
                isCollapsed ? "justify-center p-3" : "px-4 py-3",
                'hover:scale-[1.02] hover:shadow-md',
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon 
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5",
                  isActive ? "scale-110" : "",
                  "group-hover:rotate-3"
                )} 
              />
              <div className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100 ml-3"
              )}>
                <span className={cn(
                  "font-medium whitespace-nowrap",
                  isActive ? "font-semibold" : ""
                )}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;