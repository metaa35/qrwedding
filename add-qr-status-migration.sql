-- QR kod oluşturma durumu için yeni alanlar ekle
-- Bu migration'ı Supabase SQL Editor'da çalıştırın

-- Users tablosuna yeni alanlar ekle
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_created_qr BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS qr_created_at TIMESTAMP WITH TIME ZONE;

-- Mevcut kullanıcılar için varsayılan değerleri ayarla
UPDATE users 
SET has_created_qr = FALSE, qr_created_at = NULL 
WHERE has_created_qr IS NULL;

-- QR kodları oluşturmuş kullanıcıları güncelle
UPDATE users 
SET has_created_qr = TRUE, qr_created_at = qr_codes.created_at
FROM qr_codes 
WHERE users.id = qr_codes.user_id 
AND qr_codes.is_active = TRUE;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_users_has_created_qr ON users(has_created_qr);
CREATE INDEX IF NOT EXISTS idx_users_qr_created_at ON users(qr_created_at);

-- Migration tamamlandı mesajı
SELECT 'QR status migration completed successfully!' as message;
