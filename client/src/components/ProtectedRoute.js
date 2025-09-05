import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Yükleme durumunda bekle
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin yetkisi gerekiyorsa ve kullanıcı admin değilse ana sayfaya yönlendir
  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  // Tüm kontroller geçildi, içeriği göster
  return children;
};

export default ProtectedRoute;
