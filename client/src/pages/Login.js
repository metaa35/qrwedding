import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  User
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        // Debug: Login response'unu konsola yazdır
        console.log('Login response:', response.data);
        console.log('User object from login:', response.data.user);
        console.log('is_admin value:', response.data.user.is_admin);
        
        // Auth context ile giriş yap
        login(response.data.user, response.data.token);
        
        toast.success('Giriş başarılı!');
        
        // Admin ise admin paneline, değilse ana sayfaya yönlendir
        if (response.data.user.is_admin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(response.data.message || 'Giriş başarısız!');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Giriş yapılırken bir hata oluştu!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2]/50 via-white/30 to-[#BEB5A9]/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(110, 71, 59, 0.08)'}}></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(167, 141, 120, 0.06)', animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(190, 181, 169, 0.05)', animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
          >
            <Shield className="h-8 w-8" style={{color: '#6E473B'}} />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-gradient">Giriş Yap</span>
          </h1>
          <p className="text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{color: '#6E473B'}} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{color: '#6E473B'}} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Giriş Yap</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                to="/register"
                className="font-medium hover:underline"
                style={{color: '#6E473B'}}
              >
                Kayıt olun
              </Link>
            </p>
            
            <div className="pt-4 border-t" style={{borderColor: '#BEB5A9'}}>
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;