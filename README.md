# Düğün QR Kod Yükleme Sistemi

Düğün ve nişanlar için QR kod ile fotoğraf/video yükleme sistemi.

## 🚀 Yayınlama Talimatları

### Vercel ile Yayınlama (Önerilen)

1. **GitHub'a Yükleyin:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/kullaniciadi/proje-adi.git
   git push -u origin main
   ```

2. **Vercel'e Bağlayın:**
   - [Vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin
   - "Deploy" butonuna tıklayın

3. **Ortam Değişkenlerini Ayarlayın:**
   Vercel dashboard'da projenizin ayarlarına gidin ve şu ortam değişkenlerini ekleyin:
   - `MONGODB_URI`: MongoDB bağlantı URL'iniz
   - `JWT_SECRET`: JWT gizli anahtarınız
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `GOOGLE_DRIVE_FOLDER_ID`: Google Drive klasör ID'si

### Alternatif Yayınlama Seçenekleri

#### Netlify + Railway
1. **Frontend (Netlify):**
   - Netlify'da yeni site oluşturun
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`

2. **Backend (Railway):**
   - Railway'de yeni proje oluşturun
   - Server klasörünü yükleyin
   - Ortam değişkenlerini ayarlayın

#### Heroku
1. Heroku CLI kurun
2. Heroku'da yeni uygulama oluşturun
3. Projeyi push edin:
   ```bash
   heroku create
   git push heroku main
   ```

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

## 📝 Notlar

- Production'da MongoDB Atlas kullanmanız önerilir
- Google Drive API için service account oluşturmanız gerekir
- SSL sertifikası otomatik olarak Vercel/Netlify tarafından sağlanır 