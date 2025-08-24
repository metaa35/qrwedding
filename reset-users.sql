-- Mevcut kullanıcıları sil
DELETE FROM users WHERE email IN ('admin@example.com', 'test@example.com');

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
  is_active
) VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$oKh7/VSKxGofTYjU/Pz8BOvGXcMyrxEBf5rFIN344ZK3OBIbawryW',
  'Admin Company',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
);

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
  '$2b$10$oKh7/VSKxGofTYjU/Pz8BOvGXcMyrxEBf5rFIN344ZK3OBIbawryW',
  'Test Company',
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
);
