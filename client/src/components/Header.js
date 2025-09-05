import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  Menu, 
  X, 
  QrCode,
  LogOut,
  Shield,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollY } = useScroll();

  // Scroll direction detection
  useMotionValueEvent(scrollY, "change", (current) => {
    const diff = current - scrollY.getPrevious();
    setScrollDirection(diff > 0 ? "down" : "up");
    setIsScrolled(current > 10);
  });

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
    navigate('/');
  };

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: null },
    { name: 'Nasıl Çalışır', href: '/how-it-works', icon: null },
    { name: 'Özellikler', href: '/features', icon: null },
    { name: 'Fiyatlandırma', href: '/pricing', icon: null },
    { name: 'QR Oluştur', href: '/qr-generator', icon: QrCode },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header 
      className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm" 
      style={{borderBottom: '1px solid #BEB5A9'}}
      animate={{
        y: scrollDirection === "down" && isScrolled ? -100 : 0,
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.95)",
        boxShadow: isScrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img 
              src="/logo.png" 
              alt="Hatıra Köşesi Logo" 
              className="h-8 w-8 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: 5 }}
            />
            <motion.span 
              className="text-xl font-medium text-gray-800 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              style={{color: '#291C0E'}}
            >
              Hatıra Köşesi
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  color: isActive(item.href) ? '#291C0E' : '#6b7280',
                  backgroundColor: isActive(item.href) ? '#E1D4C2' : 'transparent'
                }}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-gray-500 text-xs">
                      {user.is_admin ? 'Admin' : 'Kullanıcı'}
                    </div>
                  </div>
                </div>

                {/* Admin Panel Link */}
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-gray-500 text-xs">
                          {user.is_admin ? 'Admin' : 'Kullanıcı'}
                        </div>
                      </div>
                    </div>

                    {user.is_admin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Paneli</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-center"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;