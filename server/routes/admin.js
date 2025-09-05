const express = require('express');
const supabase = require('../services/supabase');
<<<<<<< HEAD
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Tüm admin route'larını koruma altına al
router.use(authenticateToken);
router.use(requireAdmin);
=======
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm admin route'ları için authentication gerekli
router.use(authenticateToken);

// Admin kontrolü middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin yetkisi gerekli!'
    });
  }
  next();
};
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9

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

// QR hakkını sıfırla - kullanıcının qr_created_count'unu sıfırla ve mevcut QR kodlarını pasif yap
router.post('/users/:id/reset-qr-limit', async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanıcının qr_created_count'unu sıfırla
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        qr_created_count: 0,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (userError) throw userError;

    // Kullanıcının mevcut aktif QR kodlarını pasif yap
    const { error: qrError } = await supabase
      .from('qr_codes')
      .update({
        is_active: false,
        updated_at: new Date()
      })
      .eq('user_id', id)
      .eq('is_active', true);

    if (qrError) {
      console.error('QR kodları pasif yapma hatası:', qrError);
      // Bu hata kritik değil, devam et
    }

    // Şifreyi gizle
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'QR hakkı sıfırlandı! Kullanıcının mevcut QR kodları pasif yapıldı ve yeni QR kod oluşturabilir.',
      user: safeUser
    });

  } catch (error) {
    console.error('QR hakkı sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR hakkı sıfırlanamadı!',
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

// QR hakkı resetle
router.post('/users/:id/reset-qr', async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanıcının QR kodlarını sil
    const { error: qrError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('user_id', id);

    if (qrError) {
      console.error('QR kodları silme hatası:', qrError);
      throw qrError;
    }

    // Kullanıcı bilgilerini güncelle (qr_count alanı yoksa sadece updated_at)
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (userError) {
      console.error('Kullanıcı güncelleme hatası:', userError);
      throw userError;
    }

    // Şifreyi gizle
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Kullanıcının QR hakları sıfırlandı!',
      user: safeUser
    });

  } catch (error) {
    console.error('QR hakkı resetleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR hakları sıfırlanamadı!',
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

<<<<<<< HEAD
// Kullanıcının QR oluşturma hakkını sıfırla
router.post('/reset-user-qr/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID gerekli!'
      });
    }

    // Kullanıcının mevcut aktif QR kodlarını pasif yap
    const { error: qrError } = await supabase
      .from('qr_codes')
      .update({
        is_active: false,
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (qrError) {
      console.error('QR kodları pasif yapma hatası:', qrError);
      // Bu hata kritik değil, devam et
    }

    // Kullanıcının QR oluşturma durumunu sıfırla
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        has_created_qr: false,
        qr_created_at: null,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('QR sıfırlama hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'QR hakkı sıfırlanamadı!',
        error: error.message
      });
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    res.json({
      success: true,
      message: 'Kullanıcının QR oluşturma hakkı başarıyla sıfırlandı! Mevcut QR kodları pasif yapıldı.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        has_created_qr: updatedUser.has_created_qr,
        qr_created_at: updatedUser.qr_created_at
      }
    });

  } catch (error) {
    console.error('QR sıfırlama genel hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR hakkı sıfırlanırken bir hata oluştu!',
      error: error.message
    });
  }
});

// Tüm kullanıcıların QR oluşturma haklarını sıfırla
router.post('/reset-all-qr', async (req, res) => {
  try {
    // Önce tüm aktif QR kodlarını pasif yap
    const { error: qrError } = await supabase
      .from('qr_codes')
      .update({
        is_active: false,
        updated_at: new Date()
      })
      .eq('is_active', true);

    if (qrError) {
      console.error('QR kodları pasif yapma hatası:', qrError);
      // Bu hata kritik değil, devam et
    }

    // Tüm kullanıcıların QR oluşturma durumunu sıfırla
    const { data: updatedUsers, error } = await supabase
      .from('users')
      .update({
        has_created_qr: false,
        qr_created_at: null,
        updated_at: new Date()
      })
      .neq('is_admin', true) // Admin kullanıcıları hariç tut
      .select('id, username, email, has_created_qr, qr_created_at');

    if (error) {
      console.error('Toplu QR sıfırlama hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'QR hakları sıfırlanamadı!',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `Tüm kullanıcıların QR oluşturma hakları başarıyla sıfırlandı! Mevcut QR kodları pasif yapıldı. (${updatedUsers.length} kullanıcı)`,
      affectedUsers: updatedUsers.length,
      users: updatedUsers
    });

  } catch (error) {
    console.error('Toplu QR sıfırlama genel hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR hakları sıfırlanırken bir hata oluştu!',
      error: error.message
    });
  }
});
=======

>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9

module.exports = router;
