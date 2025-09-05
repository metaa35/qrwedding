const User = require('./models/User');

async function testAdminUser() {
  try {
    console.log('Admin kullanıcısını arıyor...');
    
    // Admin kullanıcısını bul
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      console.log('Admin kullanıcısı bulundu:');
      console.log('ID:', adminUser.id);
      console.log('Username:', adminUser.username);
      console.log('Email:', adminUser.email);
      console.log('is_admin:', adminUser.is_admin);
      console.log('is_active:', adminUser.is_active);
      console.log('can_create_qr:', adminUser.can_create_qr);
      console.log('can_upload_files:', adminUser.can_upload_files);
      console.log('can_access_gallery:', adminUser.can_access_gallery);
      
      // toSafeObject metodunu test et
      const safeUser = adminUser.toSafeObject();
      console.log('\nSafe object:');
      console.log('is_admin:', safeUser.is_admin);
      console.log('Full safe object:', safeUser);
    } else {
      console.log('Admin kullanıcısı bulunamadı!');
    }
  } catch (error) {
    console.error('Test hatası:', error);
  }
}

testAdminUser();

