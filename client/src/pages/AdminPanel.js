import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Users, 
  Shield, 
  Upload, 
  QrCode, 
  Image, 
  Trash2,
  Edit,
  Check,
  BarChart3,
<<<<<<< HEAD
  Sparkles,
  Crown,
  Settings,
  Activity,
  Zap
=======
  RefreshCw
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
} from 'lucide-react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Kullanıcılar alınamadı:', error);
      toast.error('Kullanıcılar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };





  const updateAdminStatus = async (userId, isAdmin) => {
    try {
      await axios.put(`/api/admin/users/${userId}/admin`, { isAdmin });
      toast.success(`Kullanıcı ${isAdmin ? 'admin' : 'normal kullanıcı'} yapıldı!`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Admin yetkisi güncelleme hatası:', error);
      toast.error('Admin yetkisi güncellenemedi!');
    }
  };

  const resetUserQR = async (userId) => {
    try {
      await axios.post(`/api/admin/users/${userId}/reset-qr`);
      toast.success('Kullanıcının QR hakları sıfırlandı!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('QR hakları sıfırlanamadı:', error);
      toast.error('QR hakları sıfırlanamadı!');
    }
  };



  const deleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('Kullanıcı silindi!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast.error('Kullanıcı silinemedi!');
    }
  };

  const handleResetUserQR = async (userId, username) => {
    if (!window.confirm(`${username} kullanıcısının QR oluşturma hakkını sıfırlamak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await axios.post(`/api/admin/reset-user-qr/${userId}`);
      toast.success(response.data.message);
      fetchUsers(); // Kullanıcı listesini yenile
    } catch (error) {
      console.error('QR sıfırlama hatası:', error);
      toast.error('QR hakkı sıfırlanamadı!');
    }
  };

  const handleResetAllQR = async () => {
    if (!window.confirm('Tüm kullanıcıların QR oluşturma haklarını sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await axios.post('/api/admin/reset-all-qr');
      toast.success(response.data.message);
      fetchUsers(); // Kullanıcı listesini yenile
    } catch (error) {
      console.error('Toplu QR sıfırlama hatası:', error);
      toast.error('QR hakları sıfırlanamadı!');
    }
  };

  const resetQrLimit = async (userId) => {
    if (!window.confirm('Bu kullanıcının QR hakkını sıfırlamak istediğinizden emin misiniz? Kullanıcı yeni QR kod oluşturabilecek.')) {
      return;
    }

    try {
      const response = await axios.post(`/api/admin/users/${userId}/reset-qr-limit`);
      toast.success(response.data.message || 'QR hakkı sıfırlandı!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('QR hakkı sıfırlama hatası:', error);
      toast.error('QR hakkı sıfırlanamadı!');
    }
  };

  const bulkUpdatePermissions = async (permissions) => {
    if (selectedUsers.length === 0) {
      toast.error('Lütfen kullanıcı seçin!');
      return;
    }

    try {
      const response = await axios.post('/api/admin/users/bulk-permissions', {
        userIds: selectedUsers,
        permissions
      });
      toast.success(`${response.data.modifiedCount} kullanıcının yetkileri güncellendi!`);
      setSelectedUsers([]);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Toplu güncelleme hatası:', error);
      toast.error('Yetkiler güncellenemedi!');
    }
  };



  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#6E473B'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2]/50 via-white/30 to-[#BEB5A9]/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(110, 71, 59, 0.08)'}}></div>
        <div className="absolute top-40 right-32 w-48 h-48 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(167, 141, 120, 0.06)', animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(190, 181, 169, 0.05)', animationDelay: '4s'}}></div>
      </div>

<<<<<<< HEAD
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
=======

        {/* Kullanıcı Listesi */}
        <>
          {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admin</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.adminUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bu Hafta</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisWeek}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 animate-glow"
            >
              <Crown className="h-5 w-5" style={{color: '#6E473B'}} />
              <span className="text-sm font-medium text-white">Admin Paneli</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              <span className="text-gradient">Admin</span> <br />
              <span className="text-gradient-gold">Paneli</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Kullanıcı yetkilerini yönetin ve 
              <span className="font-semibold" style={{color: '#6E473B'}}> sistem istatistiklerini görün</span>
            </p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-center group hover:scale-105 transition-all duration-500 p-6 rounded-2xl backdrop-blur-xl border"
                style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold mb-2" style={{color: '#6E473B'}}>Toplam Kullanıcı</p>
                <p className="text-3xl font-bold" style={{color: '#291C0E'}}>{stats.totalUsers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-center group hover:scale-105 transition-all duration-500 p-6 rounded-2xl backdrop-blur-xl border"
                style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-500">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold mb-2" style={{color: '#6E473B'}}>Aktif Kullanıcı</p>
                <p className="text-3xl font-bold" style={{color: '#291C0E'}}>{stats.activeUsers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center group hover:scale-105 transition-all duration-500 p-6 rounded-2xl backdrop-blur-xl border"
                style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-500">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold mb-2" style={{color: '#6E473B'}}>Admin</p>
                <p className="text-3xl font-bold" style={{color: '#291C0E'}}>{stats.adminUsers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="text-center group hover:scale-105 transition-all duration-500 p-6 rounded-2xl backdrop-blur-xl border"
                style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-500">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold mb-2" style={{color: '#6E473B'}}>Bu Hafta</p>
                <p className="text-3xl font-bold" style={{color: '#291C0E'}}>{stats.newUsersThisWeek}</p>
              </motion.div>
            </motion.div>
          )}

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-2xl backdrop-blur-xl border"
              style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center" style={{color: '#291C0E'}}>
                  <Settings className="h-5 w-5 mr-2" style={{color: '#6E473B'}} />
                  {selectedUsers.length} kullanıcı seçildi
                </h3>
                <button
                  onClick={deselectAllUsers}
                  className="text-sm transition-colors duration-200"
                  style={{color: '#6E473B'}}
                >
                  Seçimi Kaldır
                </button>
              </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bulkUpdatePermissions({ can_create_qr: true })}
                className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <QrCode className="h-4 w-4 mr-1" />
                QR Yetkisi Ver
              </button>
              <button
                onClick={() => bulkUpdatePermissions({ can_upload_files: true })}
                className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                <Upload className="h-4 w-4 mr-1" />
                Yükleme Yetkisi Ver
              </button>
              <button
                onClick={() => bulkUpdatePermissions({ can_access_gallery: true })}
                className="flex items-center px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
                style={{backgroundColor: '#E1D4C2', color: '#291C0E'}}
              >
                <Image className="h-4 w-4 mr-1" />
                Galeri Yetkisi Ver
              </button>
              <button
                onClick={handleResetAllQR}
                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <QrCode className="h-4 w-4 mr-1" />
                Tüm QR Haklarını Sıfırla
              </button>
              
            </div>
          </motion.div>
        )}

          {/* Users Table */}
          <div className="overflow-hidden rounded-2xl backdrop-blur-xl border" style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}>
            <div className="px-8 py-6 border-b" style={{borderColor: '#BEB5A9'}}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{color: '#291C0E'}}>
                  <Users className="h-6 w-6 mr-3" style={{color: '#6E473B'}} />
                  Kullanıcılar
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAllUsers}
                    className="text-sm transition-colors duration-200"
                    style={{color: '#6E473B'}}
                  >
                    Tümünü Seç
                  </button>
                  <span style={{color: '#6E473B'}}>|</span>
                  <button
                    onClick={deselectAllUsers}
                    className="text-sm transition-colors duration-200"
                    style={{color: '#6E473B'}}
                  >
                    Seçimi Kaldır
                  </button>
                </div>
            </div>
          </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{borderColor: '#BEB5A9'}}>
                <thead style={{backgroundColor: '#BEB5A9'}}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{color: '#291C0E'}}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectedUsers.length === users.length ? deselectAllUsers : selectAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    Şirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    Yetkiler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    QR Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#291C0E'}}>
                    İşlemler
                  </th>
                </tr>
              </thead>
                <tbody className="divide-y" style={{backgroundColor: '#E1D4C2', borderColor: '#BEB5A9'}}>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="transition-colors duration-200"
                      style={{backgroundColor: '#E1D4C2'}}
                    >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold" style={{color: '#291C0E'}}>{user.username}</div>
                          <div className="text-sm" style={{color: '#6E473B'}}>{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#6E473B'}}>
                        {user.company_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.can_create_qr ? 'border' : 'border'
                          }`} style={{
                            backgroundColor: user.can_create_qr ? '#A78D78' : '#BEB5A9',
                            color: '#291C0E',
                            borderColor: '#6E473B'
                          }}>
                            <QrCode className="h-3 w-3 mr-1" />
                            QR
                          </span>
<<<<<<< HEAD
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.can_upload_files ? 'border' : 'border'
                          }`} style={{
                            backgroundColor: user.can_upload_files ? '#A78D78' : '#BEB5A9',
                            color: '#291C0E',
                            borderColor: '#6E473B'
                          }}>
                            <Upload className="h-3 w-3 mr-1" />
                            Yükle
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.can_access_gallery ? 'border' : 'border'
                          }`} style={{
                            backgroundColor: user.can_access_gallery ? '#A78D78' : '#BEB5A9',
                            color: '#291C0E',
                            borderColor: '#6E473B'
                          }}>
                            <Image className="h-3 w-3 mr-1" />
                            Galeri
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border`} style={{
                            backgroundColor: user.has_created_qr ? '#A78D78' : '#BEB5A9',
                            color: '#291C0E',
                            borderColor: '#6E473B'
                          }}>
                            {user.has_created_qr ? 'QR Oluşturdu' : 'QR Oluşturmadı'}
                          </span>
                          {user.has_created_qr && user.qr_created_at && (
                            <span className="text-xs" style={{color: '#6E473B'}}>
                              {new Date(user.qr_created_at).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border`} style={{
                            backgroundColor: user.is_active ? '#A78D78' : '#BEB5A9',
                            color: '#291C0E',
                            borderColor: '#6E473B'
                          }}>
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                          {user.is_admin && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border" style={{backgroundColor: '#E1D4C2', color: '#291C0E', borderColor: '#BEB5A9'}}>
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                            className="transition-colors duration-200 hover:scale-110"
                            style={{color: '#6E473B'}}
                            title="Düzenle"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => updateAdminStatus(user.id, !user.is_admin)}
                            className="transition-colors duration-200 hover:scale-110"
                            style={{color: '#6E473B'}}
                            title="Admin Yetkisi"
                          >
                            <Shield className="h-5 w-5" />
                          </button>
                          {user.has_created_qr && !user.is_admin && (
                            <button
                              onClick={() => handleResetUserQR(user.id, user.username)}
                              className="transition-colors duration-200 hover:scale-110"
                              style={{color: '#6E473B'}}
                              title="QR Hakkını Sıfırla"
                            >
                              <QrCode className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="transition-colors duration-200 hover:scale-110"
                            style={{color: '#6E473B'}}
                            title="Sil"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
=======
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => resetUserQR(user.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="QR haklarını sıfırla"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateAdminStatus(user.id, !user.is_admin)}
                          className="text-purple-600 hover:text-purple-900"
                          title={user.is_admin ? "Admin yetkisini kaldır" : "Admin yap"}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Kullanıcıyı sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
                      </div>
                    </td>
                  </motion.tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>

      </div>
    </div>
  );
};

export default AdminPanel;
