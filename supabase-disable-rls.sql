-- RLS'yi geçici olarak devre dışı bırak (test için)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes DISABLE ROW LEVEL SECURITY;

-- Admin kullanıcısını manuel olarak ekle
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
  email_verified
) VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$rQZ8N3YqX9vK2mP1nL5sA.BCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  'Admin Company',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;
