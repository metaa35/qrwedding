const express = require('express');
const supabase = require('../services/supabase');

const router = express.Router();

// Tüm kullanıcıları listele
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Sayfalama
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Şifreleri gizle
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      users: safeUsers || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenemedi!',
      error: error.message
    });
  }
});

// Kullanıcı yetkilerini güncelle
router.put('/users/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin, can_create_qr, can_upload_files, can_access_gallery } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        is_admin: is_admin,
        can_create_qr: can_create_qr,
        can_upload_files: can_upload_files,
        can_access_gallery: can_access_gallery,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Şifreyi gizle
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Kullanıcı yetkileri güncellendi!',
      user: safeUser
    });

  } catch (error) {
    console.error('Kullanıcı yetki güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yetkileri güncellenemedi!',
      error: error.message
    });
  }
});

// Kullanıcı durumunu güncelle
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_verified, email_verified } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        is_active: is_active,
        is_verified: is_verified,
        email_verified: email_verified,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Şifreyi gizle
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Kullanıcı durumu güncellendi!',
      user: safeUser
    });

  } catch (error) {
    console.error('Kullanıcı durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı durumu güncellenemedi!',
      error: error.message
    });
  }
});

// Admin yetkisini güncelle
router.put('/users/:id/admin', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        is_admin: isAdmin,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Şifreyi gizle
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: `Kullanıcı ${isAdmin ? 'admin' : 'normal kullanıcı'} yapıldı!`,
      user: safeUser
    });

  } catch (error) {
    console.error('Admin yetkisi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Admin yetkisi güncellenemedi!',
      error: error.message
    });
  }
});



// Toplu yetki güncelleme
router.post('/users/bulk-permissions', async (req, res) => {
  try {
    const { userIds, permissions } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'leri gerekli!'
      });
    }

    const { data: users, error } = await supabase
      .from('users')
      .update({
        ...permissions,
        updated_at: new Date()
      })
      .in('id', userIds)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: `${users.length} kullanıcının yetkileri güncellendi!`,
      modifiedCount: users.length
    });

  } catch (error) {
    console.error('Toplu yetki güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkiler güncellenemedi!',
      error: error.message
    });
  }
});



// Kullanıcı sil
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi!'
    });

  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi!',
      error: error.message
    });
  }
});

// İstatistikler
router.get('/stats', async (req, res) => {
  try {
    // Kullanıcı sayısı
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Aktif kullanıcı sayısı
    const { count: activeUserCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Admin sayısı
    const { count: adminCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);

    // Upload sayısı
    const { count: uploadCount } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true });

    // QR kod sayısı
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });

    // Aktif QR kod sayısı
    const { count: activeQrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Son 7 gün içinde yüklenen dosyalar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUploads } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true })
      .gte('uploaded_at', sevenDaysAgo.toISOString());

    res.json({
      success: true,
      stats: {
        totalUsers: userCount || 0,
        activeUsers: activeUserCount || 0,
        admins: adminCount || 0,
        totalUploads: uploadCount || 0,
        totalQrCodes: qrCount || 0,
        activeQrCodes: activeQrCount || 0,
        recentUploads: recentUploads || 0
      }
    });

  } catch (error) {
    console.error('İstatistik alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı!',
      error: error.message
    });
  }
});

// Sistem durumu
router.get('/health', async (req, res) => {
  try {
    // Supabase bağlantı testi
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });

  } catch (error) {
    console.error('Sistem durumu hatası:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
