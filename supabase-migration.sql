-- Uploads tablosuna qr_id sütunu ekleme
ALTER TABLE uploads ADD COLUMN qr_id VARCHAR(100);

-- QR ID için indeks oluşturma
CREATE INDEX idx_uploads_qr_id ON uploads(qr_id);

-- Mevcut kayıtlar için qr_id'yi null olarak ayarlama
UPDATE uploads SET qr_id = NULL WHERE qr_id IS NULL;
