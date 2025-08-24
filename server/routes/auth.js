const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const supabase = require('../services/supabase');

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, companyName } = req.body;

    // Gerekli alanları kontrol et
    if (!username || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gerekli!'
      });
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi girin!'
      });
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email }) || await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor!'
      });
    }

    // Drive folder ID oluştur
    const driveFolderId = `folder_${companyName}_${Date.now()}`;

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
      companyName,
      driveFolderId
    });

    // Token oluştur
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu!',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt işlemi başarısız!',
      error: error.message
    });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gerekli!'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre!'
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre!'
      });
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı!'
      });
    }

    // Son giriş tarihini güncelle
    user.last_login = new Date();
    await user.save();

    // Token oluştur
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Giriş başarılı!',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş işlemi başarısız!',
      error: error.message
    });
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgisi alınamadı!'
    });
  }
});

// Şifre değiştirme
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre ve yeni şifre gerekli!'
      });
    }

    const user = User.findById(req.user.id);

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış!'
      });
    }

    // Yeni şifreyi güncelle
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi!'
    });

  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilemedi!'
    });
  }
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı!',
      error: error.message
    });
  }
});

// Ödeme durumunu güncelle
router.post('/update-payment', authenticateToken, async (req, res) => {
  try {
    const { has_paid, payment_amount, payment_date } = req.body;
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        has_paid: has_paid,
        payment_amount: payment_amount,
        payment_date: payment_date,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Ödeme durumu güncellendi!',
      user: safeUser
    });

  } catch (error) {
    console.error('Ödeme güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme durumu güncellenemedi!',
      error: error.message
    });
  }
});

module.exports = router;