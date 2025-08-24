-- Users tablosu
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(100),
  drive_folder_id VARCHAR(255),
  
  -- Yetki alanları
  is_admin BOOLEAN DEFAULT FALSE,
  can_create_qr BOOLEAN DEFAULT FALSE,
  can_upload_files BOOLEAN DEFAULT FALSE,
  can_access_gallery BOOLEAN DEFAULT FALSE,
  
  -- İletişim bilgileri
  phone VARCHAR(20),
  website VARCHAR(255),
  
     -- Hesap durumu
   is_active BOOLEAN DEFAULT TRUE,
   is_verified BOOLEAN DEFAULT FALSE,
   email_verified BOOLEAN DEFAULT FALSE,
   
   -- Ödeme durumu
   has_paid BOOLEAN DEFAULT FALSE,
   payment_date TIMESTAMP WITH TIME ZONE,
   payment_amount DECIMAL(10,2),
  
  -- Zaman damgaları
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uploads tablosu
CREATE TABLE uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  web_view_link TEXT,
  event_name VARCHAR(100) NOT NULL,
  qr_id VARCHAR(100), -- QR ID sütunu eklendi
  uploader_name VARCHAR(100),
  message TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Codes tablosu
CREATE TABLE qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_date DATE,
  custom_message TEXT,
  url TEXT NOT NULL,
  qr_code_image TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Users için RLS politikaları
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Uploads için RLS politikaları
CREATE POLICY "Anyone can view uploads" ON uploads
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete uploads" ON uploads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- QR Codes için RLS politikaları
CREATE POLICY "Anyone can view QR codes" ON qr_codes
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create QR codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own QR codes" ON qr_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own QR codes" ON qr_codes
  FOR UPDATE USING (user_id = auth.uid());

-- İndeksler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_uploads_event_name ON uploads(event_name);
CREATE INDEX idx_uploads_qr_id ON uploads(qr_id); -- QR ID indeksi eklendi
CREATE INDEX idx_uploads_uploaded_at ON uploads(uploaded_at);
CREATE INDEX idx_qr_codes_qr_id ON qr_codes(qr_id);
CREATE INDEX idx_qr_codes_event_name ON qr_codes(event_name);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- Admin kullanıcısı oluştur (şifre: admin123)
INSERT INTO users (
  username, 
  email, 
  password_hash, 
  company_name, 
  is_admin, 
  can_create_qr, 
  can_upload_files, 
  can_access_gallery,
  is_verified,
  email_verified,
  is_active,
  has_paid
) VALUES (
  'admin',
  'admin@example.com',
     '$2b$10$oKh7/VSKxGofTYjU/Pz8BOvGXcMyrxEBf5rFIN344ZK3OBIbawryW', -- admin123
  'Admin Company',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
);
