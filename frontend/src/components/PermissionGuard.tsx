import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: 'canViewCameras' | 'canViewReports' | 'canManageSettings' | 'canManageStaff';
  fallback?: React.ReactNode;
}

/**
 * Permission Guard Component
 * Shows children only if user has the required permission
 * Otherwise shows a fallback or blocked message
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  fallback 
}) => {
  const { user } = useAuth();

  // Admin always has all permissions
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // Check if manager has the specific permission
  const hasPermission = user?.permissions?.[permission] === true;

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default blocked message
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <ShieldExclamationIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 max-w-md">
            You don't have permission to access this feature. Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;




