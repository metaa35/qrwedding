const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Tüm kullanıcıları listele - Sadece admin
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenemedi!'
    });
  }
});

// Kullanıcı yetkilerini güncelle - Sadece admin
router.put('/users/:userId/permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { canCreateQR, canUploadFiles, canAccessGallery, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    // Yetkileri güncelle
    if (canCreateQR !== undefined) user.canCreateQR = canCreateQR;
    if (canUploadFiles !== undefined) user.canUploadFiles = canUploadFiles;
    if (canAccessGallery !== undefined) user.canAccessGallery = canAccessGallery;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'Kullanıcı yetkileri güncellendi!',
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Yetki güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkiler güncellenemedi!'
    });
  }
});

// Kullanıcıyı admin yap - Sadece admin
router.put('/users/:userId/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({
      success: true,
      message: `Kullanıcı ${isAdmin ? 'admin' : 'normal kullanıcı'} yapıldı!`,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Admin yetkisi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Admin yetkisi güncellenemedi!'
    });
  }
});

// Kullanıcıyı sil - Sadece admin
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kendini silmeye çalışıyorsa engelle
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi silemezsiniz!'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi!'
    });

  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi!'
    });
  }
});

// Sistem istatistikleri - Sadece admin
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const usersWithQRAccess = await User.countDocuments({ canCreateQR: true });
    const usersWithUploadAccess = await User.countDocuments({ canUploadFiles: true });
    const usersWithGalleryAccess = await User.countDocuments({ canAccessGallery: true });

    // Son 7 günde kayıt olan kullanıcılar
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        usersWithQRAccess,
        usersWithUploadAccess,
        usersWithGalleryAccess,
        newUsersThisWeek
      }
    });

  } catch (error) {
    console.error('İstatistik alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı!'
    });
  }
});

// Toplu yetki güncelleme - Sadece admin
router.post('/users/bulk-permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userIds, permissions } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'leri gerekli!'
      });
    }

    const updateData = {};
    if (permissions.canCreateQR !== undefined) updateData.canCreateQR = permissions.canCreateQR;
    if (permissions.canUploadFiles !== undefined) updateData.canUploadFiles = permissions.canUploadFiles;
    if (permissions.canAccessGallery !== undefined) updateData.canAccessGallery = permissions.canAccessGallery;
    if (permissions.isActive !== undefined) updateData.isActive = permissions.isActive;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} kullanıcının yetkileri güncellendi!`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Toplu yetki güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkiler güncellenemedi!'
    });
  }
});

module.exports = router;
