import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CameraIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ManagerSidebarProps {
  onLogout: () => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ onLogout }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Overview', icon: HomeIcon },
    { path: '/dashboard/plantations', label: 'My Plantation', icon: MapPinIcon },
    { path: '/dashboard/cameras', label: 'Camera Feeds', icon: CameraIcon },
    { path: '/dashboard/deterrents', label: 'Deterrent Control', icon: ShieldCheckIcon },
    { path: '/dashboard/reports', label: 'Reports', icon: ChartBarIcon },
    { path: '/dashboard/settings', label: 'Settings', icon: Cog6ToothIcon },
    { path: '/dashboard/notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <HomeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SADS Manager</h1>
            <p className="text-sm text-gray-500">Plantation Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ManagerSidebar;



























