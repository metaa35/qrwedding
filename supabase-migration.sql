-- Uploads tablosuna qr_id sütunu ekleme (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'uploads' AND column_name = 'qr_id') THEN
        ALTER TABLE uploads ADD COLUMN qr_id VARCHAR(100);
    END IF;
END $$;

-- QR ID için indeks oluşturma (eğer yoksa)
CREATE INDEX IF NOT EXISTS idx_uploads_qr_id ON uploads(qr_id);

-- Mevcut kayıtlar için qr_id'yi null olarak ayarlama
UPDATE uploads SET qr_id = NULL WHERE qr_id IS NULL;
