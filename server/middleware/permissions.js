const User = require('../models/User');

// QR oluşturma yetkisi kontrolü
const requireQrPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }
    
    if (!user.canCreateQRCode()) {
      return res.status(403).json({
        success: false,
        message: 'QR kod oluşturma yetkiniz yok!'
      });
    }
    
    next();
  } catch (error) {
    console.error('QR yetki kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetki kontrolü sırasında hata oluştu!'
    });
  }
};

// Dosya yükleme yetkisi kontrolü
const requireUploadPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }
    
    if (!user.hasUploadPermission()) {
      return res.status(403).json({
        success: false,
        message: 'Dosya yükleme yetkiniz yok!'
      });
    }
    
    next();
  } catch (error) {
    console.error('Upload yetki kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetki kontrolü sırasında hata oluştu!'
    });
  }
};

// Galeri erişim yetkisi kontrolü
const requireGalleryPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }
    
    if (!user.hasGalleryPermission()) {
      return res.status(403).json({
        success: false,
        message: 'Galeri erişim yetkiniz yok!'
      });
    }
    
    next();
  } catch (error) {
    console.error('Galeri yetki kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yetki kontrolü sırasında hata oluştu!'
    });
  }
};

module.exports = {
  requireQrPermission,
  requireUploadPermission,
  requireGalleryPermission
};
