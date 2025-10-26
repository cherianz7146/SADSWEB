import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  BellIcon,
  ShieldCheckIcon,
  CameraIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Define all menu items with their required permissions
  const allMenuItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, permission: null }, // Always visible
    { name: 'Camera Detection', href: '/dashboard/camera', icon: CameraIcon, permission: 'canViewCameras' as const },
    { name: 'Detection Report', href: '/dashboard/detection-report', icon: ChartBarIcon, permission: 'canViewReports' as const },
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
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">SADS Manager</span>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
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
      </nav>
    </div>
  );
};

export default UserSidebar;











