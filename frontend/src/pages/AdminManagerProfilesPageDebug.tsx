// Debug version to test if the component renders
import React from 'react';
import AdminLayout from '../components/AdminLayout';

const AdminManagerProfilesPageDebug: React.FC = () => {
  console.log('AdminManagerProfilesPageDebug: Component rendering');
  
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manager Profiles Debug Page</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">If you can see this, the component is rendering correctly.</p>
          <p className="text-gray-500 mt-2">Check the browser console for any errors.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminManagerProfilesPageDebug;





