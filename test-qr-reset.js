const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
const supabaseUrl = 'https://wrcppnttgkxfeaovuyfs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY3BwbnR0Z2t4ZmVhb3Z1eWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAyMzg2NCwiZXhwIjoyMDcxNTk5ODY0fQ.bRGyvThao_39ASZB2c9VTHRL62nANa399GSVPWgaHN4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQrReset() {
  try {
    console.log('🧪 QR hakkı sıfırlama testi başlatılıyor...');
    
    // mustafa.beren kullanıcısını bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, qr_created_count')
      .eq('username', 'mustafa.beren')
      .single();
    
    if (userError || !user) {
      console.error('❌ Kullanıcı bulunamadı:', userError);
      return;
    }
    
    console.log(`👤 Test kullanıcısı: ${user.username}`);
    console.log(`📊 Mevcut QR Count: ${user.qr_created_count}`);
    
    // Kullanıcının aktif QR kodlarını kontrol et
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, qr_id, event_name, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    if (qrError) {
      console.error('❌ QR kodları alınamadı:', qrError);
      return;
    }
    
    console.log(`🔍 Aktif QR kod sayısı: ${qrCodes ? qrCodes.length : 0}`);
    if (qrCodes && qrCodes.length > 0) {
      qrCodes.forEach(qr => {
        console.log(`   - ${qr.event_name} (${qr.qr_id})`);
      });
    }
    
    // QR hakkını sıfırla
    console.log('🔄 QR hakkı sıfırlanıyor...');
    
    // 1. qr_created_count'u sıfırla
    const { error: updateError } = await supabase
      .from('users')
      .update({
        qr_created_count: 0,
        updated_at: new Date()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ QR count güncelleme hatası:', updateError);
      return;
    }
    
    // 2. Aktif QR kodları pasif yap
    if (qrCodes && qrCodes.length > 0) {
      const { error: qrUpdateError } = await supabase
        .from('qr_codes')
        .update({
          is_active: false,
          updated_at: new Date()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (qrUpdateError) {
        console.error('❌ QR kodları pasif yapma hatası:', qrUpdateError);
      } else {
        console.log(`✅ ${qrCodes.length} QR kodu pasif yapıldı`);
      }
    }
    
    // Sonucu kontrol et
    console.log('🔍 Sonuç kontrol ediliyor...');
    
    const { data: updatedUser, error: checkUserError } = await supabase
      .from('users')
      .select('id, username, qr_created_count')
      .eq('id', user.id)
      .single();
    
    if (checkUserError) {
      console.error('❌ Güncellenmiş kullanıcı bilgisi alınamadı:', checkUserError);
      return;
    }
    
    const { data: updatedQrCodes, error: checkQrError } = await supabase
      .from('qr_codes')
      .select('id, qr_id, event_name, is_active')
      .eq('user_id', user.id);
    
    if (checkQrError) {
      console.error('❌ Güncellenmiş QR kodları alınamadı:', checkQrError);
      return;
    }
    
    const activeQrCount = updatedQrCodes ? updatedQrCodes.filter(qr => qr.is_active).length : 0;
    
    console.log('='.repeat(50));
    console.log('📊 SONUÇ:');
    console.log(`👤 Kullanıcı: ${updatedUser.username}`);
    console.log(`🔢 QR Count: ${updatedUser.qr_created_count}`);
    console.log(`✅ Aktif QR: ${activeQrCount}`);
    console.log('='.repeat(50));
    
    if (updatedUser.qr_created_count === 0 && activeQrCount === 0) {
      console.log('🎉 QR hakkı sıfırlama başarılı! Kullanıcı yeni QR kod oluşturabilir.');
    } else {
      console.log('❌ QR hakkı sıfırlama başarısız!');
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testQrReset();