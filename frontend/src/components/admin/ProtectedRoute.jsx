import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#0066FF] animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
