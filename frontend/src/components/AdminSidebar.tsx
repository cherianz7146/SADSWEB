import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CameraIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Home', href: '/admin', icon: HomeIcon },
    { name: 'Camera Detection', href: '/admin/camera', icon: CameraIcon },
    { name: 'Managers', href: '/admin/managers', icon: UsersIcon },
    { name: 'Detection Reports', href: '/admin/detection-report', icon: ChartBarIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Alert Settings', href: '/admin/alert-settings', icon: DevicePhoneMobileIcon },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">SADS Admin</span>
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

export default AdminSidebar;