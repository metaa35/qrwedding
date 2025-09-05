-- Company name alanını kaldır
ALTER TABLE users DROP COLUMN IF EXISTS company_name;

-- Mevcut verileri kontrol et ve gerekirse temizle
-- Bu migration company_name alanını tamamen kaldırır
