import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  BellIcon,
  ShieldCheckIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define all menu items with their required permissions
  const allMenuItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, permission: null }, // Always visible
    { name: 'Camera Detection', href: '/dashboard/camera', icon: CameraIcon, permission: 'canViewCameras' as const },
    { name: 'Device Health', href: '/dashboard/device-health', icon: HeartIcon, permission: null }, // Always visible
    { name: 'Detection Report', href: '/dashboard/detection-report', icon: ChartBarIcon, permission: null }, // Always visible for all managers
    { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon, permission: null }, // Always visible
    { name: 'Alert Settings', href: '/dashboard/alert-settings', icon: DevicePhoneMobileIcon, permission: null }, // Always visible
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => {
    // Show items with no permission requirement
    if (!item.permission) return true;
    
    // Admin can see everything
    if (user?.role === 'admin') return true;
    
    // Check if manager has the required permission
    return user?.permissions?.[item.permission] === true;
  });

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">SADS Manager</span>
        </div>
      </div>
      
      <nav className="mt-8 flex-1">
        {/* Home Link */}
        {menuItems.filter(item => item.name === 'Home').map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        {/* Profile Link - Right after Home */}
        <Link
          to="/dashboard/profile"
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            location.pathname === '/dashboard/profile'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <UserIcon className="h-5 w-5 mr-3" />
          My Profile
        </Link>
        
        {/* Other Menu Items */}
        {menuItems.filter(item => item.name !== 'Home').map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        {/* Logout Button - At the bottom of navigation */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default UserSidebar;











