-- Admin kullanıcısı oluştur (şifre: admin123)
-- Bu hash bcrypt ile oluşturuldu: $2a$10$rounds=10$salt$hash
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
  is_active
) VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin Company',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Test kullanıcısı oluştur (şifre: test123)
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
  is_active
) VALUES (
  'testuser',
  'test@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Test Company',
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;
