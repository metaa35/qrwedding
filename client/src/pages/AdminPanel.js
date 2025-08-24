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
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Paneli</h1>
          <p className="text-gray-600">Kullanıcı yetkilerini yönetin ve sistem istatistiklerini görün</p>
        </div>

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedUsers.length} kullanıcı seçildi
              </h3>
              <button
                onClick={deselectAllUsers}
                className="text-sm text-gray-500 hover:text-gray-700"
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
                className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
              >
                <Image className="h-4 w-4 mr-1" />
                Galeri Yetkisi Ver
              </button>
              
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Kullanıcılar</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tümünü Seç
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={deselectAllUsers}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Seçimi Kaldır
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectedUsers.length === users.length ? deselectAllUsers : selectAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yetkiler
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
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
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.can_create_qr ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <QrCode className="h-3 w-3 mr-1" />
                          QR
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.can_upload_files ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Upload className="h-3 w-3 mr-1" />
                          Yükle
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.can_access_gallery ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Image className="h-3 w-3 mr-1" />
                          Galeri
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                        {user.is_admin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
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
                          onClick={() => updateAdminStatus(user.id, !user.is_admin)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
