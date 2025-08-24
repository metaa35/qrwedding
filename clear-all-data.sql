-- SADECE VERİLERİ SİLME SCRIPTİ (Güvenli)
-- Bu script tabloları silmez, sadece verileri temizler

-- 1. Tüm verileri sil (foreign key sırasına göre)
DELETE FROM uploads;
DELETE FROM qr_codes;
DELETE FROM users;

-- 2. İndeksleri yeniden oluştur
DROP INDEX IF EXISTS idx_uploads_qr_id;
CREATE INDEX idx_uploads_qr_id ON uploads(qr_id);

-- 3. Veritabanını temizle
VACUUM;
ANALYZE;

-- 4. Onay mesajı
SELECT 'Tüm veriler başarıyla silindi! Tablolar korundu.' as message;
