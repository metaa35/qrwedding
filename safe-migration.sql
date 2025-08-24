-- GÜVENLİ MIGRATION SCRIPTİ
-- Bu script sadece eksik olan sütunları ve indeksleri ekler

-- 1. qr_id sütunu ekleme (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'uploads' AND column_name = 'qr_id') THEN
        ALTER TABLE uploads ADD COLUMN qr_id VARCHAR(100);
        RAISE NOTICE 'qr_id sütunu eklendi';
    ELSE
        RAISE NOTICE 'qr_id sütunu zaten mevcut';
    END IF;
END $$;

-- 2. QR ID için indeks oluşturma (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_uploads_qr_id') THEN
        CREATE INDEX idx_uploads_qr_id ON uploads(qr_id);
        RAISE NOTICE 'idx_uploads_qr_id indeksi oluşturuldu';
    ELSE
        RAISE NOTICE 'idx_uploads_qr_id indeksi zaten mevcut';
    END IF;
END $$;

-- 3. Mevcut kayıtlar için qr_id'yi null olarak ayarlama
UPDATE uploads SET qr_id = NULL WHERE qr_id IS NULL;

-- 4. Onay mesajı
SELECT 'Migration başarıyla tamamlandı!' as message;
