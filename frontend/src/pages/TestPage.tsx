import React from 'react';

const TestPage: React.FC = () => {
  console.log('TestPage component is rendering');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SADS Test Page</h1>
        <p className="text-lg text-gray-600 mb-8">If you can see this, the React app is working!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Frontend is running successfully</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;






