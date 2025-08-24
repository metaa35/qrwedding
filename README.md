# Düğün QR Kod Yükleme Sistemi

Düğün ve nişanlar için QR kod ile fotoğraf/video yükleme sistemi. Supabase veritabanı ve Google Drive depolama kullanır.

## 🚀 Yayınlama Talimatları

### Vercel ile Yayınlama (Önerilen)

1. **Supabase Projesi Oluşturun:**
   - [Supabase.com](https://supabase.com) adresine gidin
   - "Start your project" butonuna tıklayın
   - GitHub hesabınızla giriş yapın
   - "New Project" butonuna tıklayın
   - Proje adını girin (örn: `wedding-qr-system`)
   - Veritabanı şifresi oluşturun
   - Bölge seçin (Avrupa için `West Europe` önerilir)
   - "Create new project" butonuna tıklayın

2. **Veritabanı Tablolarını Oluşturun:**
   - Supabase dashboard'da SQL Editor'a gidin
   - `supabase-schema.sql` dosyasındaki SQL kodunu çalıştırın

3. **Supabase API Anahtarlarını Alın:**
   - Settings > API bölümüne gidin
   - Project URL ve API keys'i kopyalayın

4. **GitHub'a Yükleyin:**
   ```bash
   git add .
   git commit -m "Supabase integration complete"
   git push origin main
   ```

5. **Vercel'e Bağlayın:**
   - [Vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin
   - "Deploy" butonuna tıklayın

6. **Ortam Değişkenlerini Ayarlayın:**
   Vercel dashboard'da projenizin ayarlarına gidin ve şu ortam değişkenlerini ekleyin:
   - `SUPABASE_URL`: Supabase proje URL'iniz
   - `SUPABASE_ANON_KEY`: Supabase anonim anahtarınız
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role anahtarınız
   - `JWT_SECRET`: Rastgele bir gizli anahtar (örn: `mysecretkey123`)
   - `GOOGLE_DRIVE_FOLDER_ID`: Google Drive klasör ID'niz
   - `CLIENT_URL`: Vercel URL'iniz (örn: `https://your-app.vercel.app`)

7. **Google Drive API Kurulumu:**
   - [Google Cloud Console](https://console.cloud.google.com/)'a gidin
   - Google Drive API'yi etkinleştirin
   - Service Account oluşturun
   - JSON anahtarını indirin ve `server/credentials.json` olarak kaydedin
   - Bu dosyayı GitHub'a yükleyin

### Alternatif Yayınlama Seçenekleri

#### Netlify + Railway
1. **Frontend (Netlify):**
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`

2. **Backend (Railway):**
   - Server klasörünü yükleyin
   - Ortam değişkenlerini ayarlayın
   - `credentials.json` dosyasını yükleyin

#### Render
1. [Render.com](https://render.com) adresine gidin
2. "New Web Service" seçin
3. GitHub repository'nizi bağlayın
4. Build command: `npm run install-all && npm run build`
5. Start command: `cd server && npm start`

## 🔧 Geliştirme

### Kurulum
```bash
npm run install-all
```

### Geliştirme Sunucusu
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 📊 Veritabanı Yapısı

### Users Tablosu
- `id`: UUID (Primary Key)
- `username`: VARCHAR(50) UNIQUE
- `email`: VARCHAR(255) UNIQUE
- `password_hash`: VARCHAR(255)
- `company_name`: VARCHAR(100)
- `drive_folder_id`: VARCHAR(255)
- `is_admin`: BOOLEAN
- `can_create_qr`: BOOLEAN
- `can_upload_files`: BOOLEAN
- `can_access_gallery`: BOOLEAN
- `is_active`: BOOLEAN
- `created_at`: TIMESTAMP

### Uploads Tablosu
- `id`: UUID (Primary Key)
- `file_id`: VARCHAR(255)
- `file_name`: VARCHAR(255)
- `file_size`: BIGINT
- `mime_type`: VARCHAR(100)
- `web_view_link`: TEXT
- `event_name`: VARCHAR(100)
- `uploader_name`: VARCHAR(100)
- `message`: TEXT
- `uploaded_by`: UUID (Foreign Key)
- `uploaded_at`: TIMESTAMP

### QR Codes Tablosu
- `id`: UUID (Primary Key)
- `qr_id`: VARCHAR(100) UNIQUE
- `event_name`: VARCHAR(100)
- `event_date`: DATE
- `event_location`: VARCHAR(255)
- `description`: TEXT
- `is_active`: BOOLEAN
- `created_by`: UUID (Foreign Key)
- `created_at`: TIMESTAMP

## 📝 Önemli Notlar

- **Supabase**: PostgreSQL tabanlı veritabanı kullanır
- **Google Drive**: Dosya yüklemeleri Google Drive'a yapılır
- **Vercel**: Serverless fonksiyonlar kullanır
- **Güvenlik**: Row Level Security (RLS) etkin
- **Admin**: Varsayılan admin kullanıcısı: `admin@example.com` / `admin123`

## 🔒 Güvenlik

- Row Level Security (RLS) politikaları
- JWT token tabanlı kimlik doğrulama
- Rate limiting (15 dakikada 100 istek)
- Helmet.js güvenlik başlıkları
- CORS koruması
- Dosya türü ve boyut kontrolü

## 🚀 API Endpoints

### Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Upload
- `POST /api/upload/single` - Tek dosya yükleme
- `POST /api/upload/multiple` - Çoklu dosya yükleme
- `GET /api/upload/files` - Dosyaları listele
- `DELETE /api/upload/files/:id` - Dosya sil

### QR Code
- `POST /api/qr/generate` - QR kod oluştur
- `GET /api/qr/verify/:qrId` - QR kod doğrula
- `GET /api/qr/info/:qrId` - QR kod bilgileri
- `GET /api/qr/list` - QR kodları listele

### Admin
- `GET /api/admin/users` - Kullanıcıları listele
- `PUT /api/admin/users/:id/permissions` - Yetkileri güncelle
- `GET /api/admin/stats` - İstatistikler
- `GET /api/admin/health` - Sistem durumu 