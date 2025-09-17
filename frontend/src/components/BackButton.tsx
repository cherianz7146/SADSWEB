import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = '/admin', label = 'Back to Home' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;