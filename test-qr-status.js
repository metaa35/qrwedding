const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
const supabaseUrl = 'https://wrcppnttgkxfeaovuyfs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY3BwbnR0Z2t4ZmVhb3Z1eWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAyMzg2NCwiZXhwIjoyMDcxNTk5ODY0fQ.bRGyvThao_39ASZB2c9VTHRL62nANa399GSVPWgaHN4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQrStatus() {
  try {
    console.log('🔍 QR durumu kontrol ediliyor...');
    
    // Kullanıcıları listele
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, qr_created_count, is_admin')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ Kullanıcılar alınamadı:', usersError);
      return;
    }
    
    console.log(`📋 ${users.length} kullanıcı bulundu:`);
    console.log('='.repeat(80));
    
    for (const user of users) {
      // Her kullanıcı için aktif QR kodları kontrol et
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, qr_id, event_name, is_active, created_at')
        .eq('user_id', user.id);
      
      const activeQrCount = qrCodes ? qrCodes.filter(qr => qr.is_active).length : 0;
      const totalQrCount = qrCodes ? qrCodes.length : 0;
      
      console.log(`👤 ${user.username} (${user.email})`);
      console.log(`   Admin: ${user.is_admin ? '✅' : '❌'}`);
      console.log(`   QR Count: ${user.qr_created_count || 0}`);
      console.log(`   Aktif QR: ${activeQrCount}/${totalQrCount}`);
      
      if (qrCodes && qrCodes.length > 0) {
        qrCodes.forEach(qr => {
          console.log(`   - ${qr.event_name} (${qr.is_active ? 'Aktif' : 'Pasif'}) - ${qr.qr_id}`);
        });
      }
      console.log('');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

checkQrStatus();
