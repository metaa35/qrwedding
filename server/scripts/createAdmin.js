const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('✅ JSON dosyası tabanlı sistem başlatılıyor...');

    // Admin kullanıcı bilgileri
    const adminData = {
      username: 'admin',
      email: 'admin@qrgallery.com',
      password: 'admin123',
      companyName: 'QR Gallery Admin',
      driveFolderId: 'admin-folder',
      isAdmin: true,
      canCreateQR: true,
      canUploadFiles: true,
      canAccessGallery: true,
      isActive: true,
      isVerified: true
    };

    // Kullanıcı var mı kontrol et
    const existingUser = User.findOne({ 
      $or: [{ email: adminData.email }, { username: adminData.username }] 
    });

    if (existingUser) {
      console.log('⚠️ Admin kullanıcısı zaten mevcut!');
      console.log('Email:', existingUser.email);
      console.log('Şifre: admin123');
      return;
    }

    // Yeni admin kullanıcısı oluştur
    const adminUser = await User.create(adminData);

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Email:', adminData.email);
    console.log('Şifre:', adminData.password);
    console.log('Admin paneline erişmek için: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Admin kullanıcısı oluşturulamadı:', error);
  }
}

// Script'i çalıştır
createAdminUser();
