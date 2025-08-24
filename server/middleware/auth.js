const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token oluşturma
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Token doğrulama middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Erişim token\'ı gerekli!'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token!'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş! Lütfen tekrar giriş yapın.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token!'
    });
  }
};

// Admin kontrolü
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin yetkisi gerekli!'
    });
  }
  next();
};

// QR oluşturma yetkisi kontrolü
const requireQRCreationPermission = (req, res, next) => {
  if (!req.user.canCreateQRCode()) {
    return res.status(403).json({
      success: false,
      message: 'QR kod oluşturma yetkiniz bulunmuyor! Lütfen admin ile iletişime geçin.',
      code: 'QR_PERMISSION_REQUIRED'
    });
  }
  next();
};

// Dosya yükleme yetkisi kontrolü
const requireUploadPermission = (req, res, next) => {
  if (!req.user.hasUploadPermission()) {
    return res.status(403).json({
      success: false,
      message: 'Dosya yükleme yetkiniz bulunmuyor! Lütfen admin ile iletişime geçin.',
      code: 'UPLOAD_PERMISSION_REQUIRED'
    });
  }
  next();
};

// Galeri erişim yetkisi kontrolü
const requireGalleryPermission = (req, res, next) => {
  if (!req.user.hasGalleryPermission()) {
    return res.status(403).json({
      success: false,
      message: 'Galeri erişim yetkiniz bulunmuyor! Lütfen admin ile iletişime geçin.',
      code: 'GALLERY_PERMISSION_REQUIRED'
    });
  }
  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  requireQRCreationPermission,
  requireUploadPermission,
  requireGalleryPermission
};
