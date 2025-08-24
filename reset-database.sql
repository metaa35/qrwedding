-- TÜM VERİTABANINI SIFIRLAMA SCRIPTİ
-- DİKKAT: Bu script tüm verileri silecek!

-- 1. Önce tüm verileri sil
DELETE FROM uploads;
DELETE FROM qr_codes;
DELETE FROM users;

-- 2. İndeksleri sil
DROP INDEX IF EXISTS idx_uploads_qr_id;

-- 3. Tabloları sil (foreign key sırasına göre)
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. RLS politikalarını sil (otomatik silinir ama emin olmak için)
-- Tablolar silindiğinde politikalar da otomatik silinir

-- 5. Sequence'leri sıfırla (eğer varsa)
-- PostgreSQL'de UUID kullandığımız için sequence yok

-- 6. Veritabanını temizle
VACUUM FULL;
ANALYZE;

-- 7. Onay mesajı
SELECT 'Tüm veritabanı başarıyla sıfırlandı!' as message;
