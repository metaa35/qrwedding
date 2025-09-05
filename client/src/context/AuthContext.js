import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext useEffect başlıyor...');
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini al ve token'ı doğrula
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('AuthContext - token:', token ? 'var' : 'yok', 'userData:', userData ? 'var' : 'yok');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('AuthContext - parsedUser:', parsedUser);
        // Geçici olarak user'ı set et (token kontrolü sırasında)
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Rate limiting için debounce
        const timeoutId = setTimeout(() => {
          console.log('AuthContext - token validation başlıyor...');
          // Token'ın geçerli olup olmadığını server'dan kontrol et
          axios.get('/api/auth/me')
            .then(response => {
              console.log('AuthContext - token validation response:', response.data);
              if (response.data.success) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('AuthContext - user güncellendi:', response.data.user);
              } else {
                console.log('AuthContext - token geçersiz, temizleniyor...');
                // Token geçersiz, localStorage'ı temizle
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
              }
              // Her durumda loading'i false yap
              setLoading(false);
              console.log('AuthContext - loading false (token validation completed)');
            })
            .catch(error => {
              console.error('Token validation error:', error);
              // 429 hatası için özel işlem
              if (error.response?.status === 429) {
                console.log('Rate limit exceeded, using cached user data');
                // Rate limit aşıldıysa cached data'yı kullan
                setLoading(false);
                console.log('AuthContext - loading false (rate limit)');
                return;
              }
              // Token geçersiz, localStorage'ı temizle
              setUser(null);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              delete axios.defaults.headers.common['Authorization'];
              setLoading(false);
              console.log('AuthContext - loading false (token validation error)');
            })
        }, 1000); // 1 saniye bekle
      } catch (error) {
        console.error('User data parse error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        console.log('AuthContext - loading false (parse error)');
      }
    } else {
      console.log('AuthContext - token/userData yok, loading false');
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    // Debug: Login fonksiyonunda kullanıcı bilgilerini konsola yazdır
    console.log('AuthContext - Login called with userData:', userData);
    console.log('AuthContext - is_admin value:', userData.is_admin);
    
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yenilenemedi:', error);
      // Hata durumunda mevcut kullanıcı bilgilerini koru
    }
  };

  // Axios interceptor ekle - token süresi dolma kontrolü
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
