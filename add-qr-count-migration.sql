-- Users tablosuna qr_created_count sütunu ekleme (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'qr_created_count') THEN
        ALTER TABLE users ADD COLUMN qr_created_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Mevcut kullanıcılar için qr_created_count'u 0 olarak ayarlama
UPDATE users SET qr_created_count = 0 WHERE qr_created_count IS NULL;

-- QR kodları olan kullanıcıların qr_created_count'unu 1 yapma
UPDATE users
SET qr_created_count = 1
WHERE id IN (
    SELECT DISTINCT user_id
    FROM qr_codes
    WHERE user_id IS NOT NULL
);
