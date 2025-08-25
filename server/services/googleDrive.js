const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    // Constructor'da init çağırma - lazy initialization yapacağız
  }

  async ensureInitialized() {
    if (!this.drive) {
      await this.init();
    }
  }

  async init() {
    try {
      let auth;
      
      // Önce GOOGLE_CREDENTIALS_JSON'i dene
      if (process.env.GOOGLE_CREDENTIALS_JSON) {
        console.log('🔑 Environment variable\'dan credentials okunuyor...');
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata'
          ]
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Dosya yolu olarak ayarlanmışsa, dosyayı oku
        console.log('📁 Dosyadan credentials okunuyor:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
        try {
          const credentialsContent = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
          const credentials = JSON.parse(credentialsContent);
          auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: [
              'https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive.appdata'
            ]
          });
        } catch (fileError) {
          console.log('❌ Dosya okunamadı, environment variable olarak denenecek...');
          // Dosya yoksa, environment variable'ın kendisi JSON olabilir
          try {
            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            auth = new google.auth.GoogleAuth({
              credentials: credentials,
              scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.appdata'
              ]
            });
          } catch (jsonError) {
            throw new Error('Google Drive credentials geçersiz format!');
          }
        }
      } else {
        throw new Error('Google Drive credentials bulunamadı!');
      }

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive bağlantısı başarılı');
      console.log('📁 Shared Drive ID:', this.folderId);
    } catch (error) {
      console.error('❌ Google Drive bağlantı hatası:', error.message);
      throw error;
    }
  }

  async uploadFile(filePath, fileName, mimeType, guestName = '', eventName = '', message = '', qrId = '') {
    try {
      console.log('🚀 Dosya yükleme başlatılıyor...');
      console.log('📝 Parametreler:', { fileName, mimeType, guestName, eventName, message, qrId });
      
      if (!this.drive) {
        console.log('❌ Drive bağlantısı yok, yeniden başlatılıyor...');
        await this.init();
      }

      // QR ID varsa klasör adına ekle, yoksa sadece event name kullan
      const folderName = qrId ? `${eventName}_${qrId}` : (eventName || 'Genel');
      console.log('📁 Klasör aranıyor/oluşturuluyor:', folderName);
      let targetFolderId = await this.findOrCreateFolder(folderName);
      console.log('✅ Hedef klasör ID:', targetFolderId);
      
      // Dosya adı zaten QR ID ile geliyor, misafir adını ekle
      const displayName = guestName ? `${guestName}_${fileName}` : fileName;
      console.log('📄 Dosya adı:', displayName);
      
      const descriptionText = `Misafir: ${guestName || 'Anonim'}\nEtkinlik: ${eventName || 'Özel Etkinlik'}\nMesaj: ${message || 'Mesaj yok'}`;
      
      const fileMetadata = {
        name: displayName, // Misafir adı + QR ID + timestamp + original name
        parents: [targetFolderId], // Event klasörüne yükle
        description: descriptionText
      };
      
      console.log('📋 Dosya metadata:', fileMetadata);
      console.log('📋 RAW guestName:', JSON.stringify(guestName));
      console.log('📋 Description text:', JSON.stringify(descriptionText));

      // Dosyayı oku ve stream oluştur
      const stream = fs.createReadStream(filePath);

      const media = {
        mimeType: mimeType,
        body: stream
      };

      console.log('📤 Drive\'a yükleme başlatılıyor...');
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, description',
        supportsAllDrives: true,
        supportsTeamDrives: true
      }, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.bytesRead * 100) / progressEvent.totalBytes);
          console.log(`📤 Yükleme ilerlemesi: %${percentCompleted}`);
        }
      });

      console.log('✅ Dosya başarıyla yüklendi:', response.data);

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      };

    } catch (error) {
      console.error('❌ Dosya yükleme hatası:', error);
      throw error;
    }
  }

  // Memory buffer'dan dosya yükleme (Vercel için)
  async uploadFileFromBuffer(buffer, fileName, mimeType, guestName = '', eventName = '', message = '', qrId = '') {
    try {
      console.log('🚀 Buffer dosya yükleme başlatılıyor...');
      console.log('📝 Parametreler:', { fileName, mimeType, guestName, eventName, message, qrId });
      
      // Drive bağlantısını kontrol et ve gerekirse başlat
      await this.ensureInitialized();

      // QR ID varsa klasör adına ekle, yoksa sadece event name kullan
      const folderName = qrId ? `${eventName}_${qrId}` : (eventName || 'Genel');
      console.log('📁 Klasör aranıyor/oluşturuluyor:', folderName);
      let targetFolderId = await this.findOrCreateFolder(folderName);
      console.log('✅ Hedef klasör ID:', targetFolderId);
      
      // Dosya adı zaten QR ID ile geliyor, misafir adını ekle
      const displayName = guestName ? `${guestName}_${fileName}` : fileName;
      console.log('📄 Dosya adı:', displayName);
      
      const descriptionText = `Misafir: ${guestName || 'Anonim'}\nEtkinlik: ${eventName || 'Özel Etkinlik'}\nMesaj: ${message || 'Mesaj yok'}`;
      
      const fileMetadata = {
        name: displayName, // Misafir adı + QR ID + timestamp + original name
        parents: [targetFolderId], // Event klasörüne yükle
        description: descriptionText
      };
      
      console.log('📋 Dosya metadata:', fileMetadata);

      // Buffer'ı stream'e çevir
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const media = {
        mimeType: mimeType,
        body: stream // Stream kullan
      };

      console.log('📤 Drive\'a yükleme başlatılıyor...');
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, description',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      console.log('✅ Dosya başarıyla yüklendi:', response.data);

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      };

    } catch (error) {
      console.error('❌ Buffer dosya yükleme hatası:', error);
      throw error;
    }
  }

  async findOrCreateFolder(folderName) {
    try {
      console.log('🔍 Klasör arama/oluşturma başlatılıyor:', folderName);
      
      // Drive bağlantısını kontrol et ve gerekirse başlat
      await this.ensureInitialized();

      console.log('📁 Ana klasör ID:', this.folderId);

      // Önce klasörü ara - daha geniş arama
      const searchQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      console.log('🔍 Arama sorgusu:', searchQuery);
      
      const searchResponse = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id, name, parents)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      console.log('📋 Arama sonucu:', searchResponse.data);

      // Eğer klasör varsa ve ana klasörün altındaysa, ID'sini döndür
      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        for (const file of searchResponse.data.files) {
          if (file.parents && file.parents.includes(this.folderId)) {
            console.log(`✅ Klasör bulundu: ${folderName} (ID: ${file.id})`);
            return file.id;
          }
        }
      }

      // Klasör yoksa oluştur
      console.log(`📁 Klasör oluşturuluyor: ${folderName}`);
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      };

      console.log('📋 Klasör metadata:', fileMetadata);

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      console.log(`✅ Klasör oluşturuldu: ${folderName} (ID: ${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Klasör bulma/oluşturma hatası:', error);
      console.error('❌ Hata detayı:', error.message);
      throw new Error('Klasör bulunamadı veya oluşturulamadı');
    }
  }

  async createFolder(folderName) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
      });

      return {
        folderId: response.data.id,
        folderName: response.data.name
      };
    } catch (error) {
      console.error('Klasör oluşturma hatası:', error);
      throw new Error('Klasör oluşturulamadı');
    }
  }

  async listFiles(folderId = null, eventName = null) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      let query;
      
      if (folderId) {
        // Belirli bir klasörden listele
        query = `'${folderId}' in parents and trashed=false`;
      } else if (eventName) {
        // Belirli bir event klasöründen listele
        let targetFolderId = await this.findOrCreateFolder(eventName);
        query = `'${targetFolderId}' in parents and trashed=false`;
      } else {
        // Ana klasörden tüm dosyaları listele (tüm eventler)
        query = `'${this.folderId}' in parents and trashed=false`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, createdTime, webViewLink, webContentLink, thumbnailLink, description)',
        orderBy: 'createdTime desc',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

                                                       // Dosya description'ından bilgileri parse et
         const files = response.data.files.map(file => {
           const description = file.description || '';
           console.log('🔍 Parsing description:', description);
           
           const guestNameMatch = description.match(/Misafir: (.*?)(?:\r?\n|$)/);
           const eventNameMatch = description.match(/Etkinlik: (.*?)(?:\r?\n|$)/);
           const messageMatch = description.match(/Mesaj: (.*?)(?:\r?\n|$)/);
           
           console.log('🔍 RAW Description:', JSON.stringify(description));
           console.log('🔍 Guest match:', guestNameMatch);
           console.log('🔍 Event match:', eventNameMatch);
           console.log('🔍 Message match:', messageMatch);
           console.log('🔍 Guest match[1]:', guestNameMatch ? guestNameMatch[1] : 'NULL');
           
           // Description'dan gelen ismi kullan
           let uploaderName = guestNameMatch ? guestNameMatch[1].trim() : 'Anonim';
           const eventName = eventNameMatch ? eventNameMatch[1].trim() : 'Özel Etkinlik';
           const message = messageMatch ? messageMatch[1].trim() : 'Mesaj yok';
           
           // Eğer uploaderName boş ise "Anonim" olarak ayarla, ama "Anonim" yazısı varsa gerçek ismi kullan
           if (!uploaderName || uploaderName === '') {
             uploaderName = 'Anonim';
           }
           
           console.log('📝 Parsed data:', { uploaderName, eventName, message });

           return {
             ...file,
             uploaderName,
             eventName,
             message
           };
         });

      return files;
    } catch (error) {
      console.error('Dosya listesi alma hatası:', error);
      throw new Error('Dosyalar listelenemedi');
    }
  }

  async deleteFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      await this.drive.files.delete({
        fileId: fileId,
        supportsAllDrives: true
      });

      return { success: true, message: 'Dosya silindi' };
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      throw new Error('Dosya silinemedi');
    }
  }

  async getFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size',
        supportsAllDrives: true
      });
      return response.data;
    } catch (error) {
      console.error('❌ Dosya getirme hatası:', error.message);
      throw error;
    }
  }

  async getFileContent(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      console.log('📥 Dosya içeriği alınıyor:', fileId);

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      });

      console.log('✅ Dosya stream alındı');
      return response.data;
    } catch (error) {
      console.error('❌ Dosya içeriği getirme hatası:', error.message);
      throw error;
    }
  }

  async getFileStream(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive bağlantısı kurulmamış');
      }

      console.log('📥 Dosya stream alınıyor:', fileId);

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'stream'
      });

      console.log('✅ Dosya stream alındı');
      return response.data;
    } catch (error) {
      console.error('❌ Dosya stream getirme hatası:', error.message);
      throw error;
    }
  }

  async testPermissions() {
    try {
      console.log('🔍 Service Account izinleri kontrol ediliyor...');
      
      if (!this.drive) {
        console.log('❌ Drive bağlantısı yok, başlatılıyor...');
        await this.init();
      }

      // 1. Ana klasörü kontrol et
      console.log('📁 Ana klasör kontrol ediliyor:', this.folderId);
      try {
        const folderInfo = await this.drive.files.get({
          fileId: this.folderId,
          fields: 'id, name, permissions',
          supportsAllDrives: true
        });
        console.log('✅ Ana klasör bulundu:', folderInfo.data.name);
      } catch (error) {
        console.log('❌ Ana klasör erişim hatası:', error.message);
        return false;
      }

      // 2. Test dosyası oluşturmayı dene
      console.log('📝 Test dosyası oluşturuluyor...');
      const testMetadata = {
        name: `test_${Date.now()}.txt`,
        parents: [this.folderId],
        mimeType: 'text/plain'
      };

      const testContent = 'Bu bir test dosyasıdır.';
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(testContent);
      stream.push(null);

      const testMedia = {
        mimeType: 'text/plain',
        body: stream
      };

      const testResponse = await this.drive.files.create({
        resource: testMetadata,
        media: testMedia,
        fields: 'id, name',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      console.log('✅ Test dosyası oluşturuldu:', testResponse.data.id);

      // 3. Test dosyasını sil
      console.log('🗑️ Test dosyası siliniyor...');
      await this.drive.files.delete({
        fileId: testResponse.data.id,
        supportsAllDrives: true
      });
      console.log('✅ Test dosyası silindi');

      console.log('🎉 Service Account izinleri doğru!');
      return true;

    } catch (error) {
      console.error('❌ İzin testi başarısız:', error.message);
      console.error('❌ Hata detayı:', error);
      return false;
    }
  }

  async testConnectionAndPermissions() {
    try {
      if (!this.drive) {
        await this.init();
      }
      // Kök klasör bilgilerini almaya çalışarak bağlantıyı test et
      await this.drive.files.get({
        fileId: this.folderId,
        fields: 'id, name',
        supportsAllDrives: true
      });
      console.log('✅ Google Drive bağlantısı ve ana klasör erişimi başarılı.');
      return true;
    } catch (error) {
      console.error('❌ Google Drive bağlantı veya yetki testi başarısız:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService(); 