-- Upload type alanını uploads tablosuna ekle
ALTER TABLE uploads ADD COLUMN upload_type VARCHAR(20) DEFAULT 'file';

-- Upload type indeksi ekle
CREATE INDEX idx_uploads_upload_type ON uploads(upload_type);

-- Mevcut kayıtları güncelle
UPDATE uploads SET upload_type = 'photo' WHERE mime_type LIKE 'image/%';
UPDATE uploads SET upload_type = 'video' WHERE mime_type LIKE 'video/%';
UPDATE uploads SET upload_type = 'audio' WHERE mime_type LIKE 'audio/%';
UPDATE uploads SET upload_type = 'message' WHERE file_name = 'message.txt';
