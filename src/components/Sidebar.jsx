import { Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, BookOpen, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { name: 'Events', href: '/dashboard/events', icon: Calendar }
];

const Sidebar = () => {
  const location = useLocation();
  console.log("Current location:", location.pathname); // Debug log

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <span className="font-semibold">Student Resource Hub</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm rounded-lg mb-1',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;