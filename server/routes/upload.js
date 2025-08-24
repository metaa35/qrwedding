const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const googleDriveService = require('../services/googleDrive');

const router = express.Router();

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'));
    }
  }
});

// Tek dosya yükleme - Herkes kullanabilir
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message } = req.body;
    
    console.log('📥 Upload request body:', req.body);
    console.log('📥 uploaderName:', JSON.stringify(uploaderName));
    console.log('📥 eventName:', JSON.stringify(eventName));
    console.log('📥 message:', JSON.stringify(message));

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }

    // Google Drive'a yükle
    const filePath = req.file.path;
    const fileName = `${eventName}_${Date.now()}_${req.file.originalname}`;
    
    const uploadedFile = await googleDriveService.uploadFile(
      filePath, 
      fileName, 
      req.file.mimetype, // Gerçek MIME type
      uploaderName || 'Anonim',
      eventName,
      message
    );

    // Local dosyayı sil
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi!',
             file: {
         id: uploadedFile.fileId,
         name: uploadedFile.fileName,
         size: req.file.size,
         mimeType: req.file.mimetype,
         webViewLink: uploadedFile.webViewLink,
         eventName: eventName,
         uploaderName: uploaderName || 'Anonim',
         message: message,
         uploadedAt: new Date()
       }
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    
    // Hata durumunda local dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Dosya yüklenemedi!',
      error: error.message
    });
  }
});

// Çoklu dosya yükleme - Herkes kullanabilir
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileName = `${eventName}_${Date.now()}_${file.originalname}`;
                 const uploadedFile = await googleDriveService.uploadFile(
           file.path, 
           fileName, 
           file.mimetype, // Gerçek MIME type
           uploaderName || 'Anonim',
           eventName,
           message
         );
        
                 uploadedFiles.push({
           id: uploadedFile.fileId,
           name: uploadedFile.fileName,
           size: 0,
           mimeType: file.mimetype,
           webViewLink: uploadedFile.webViewLink,
           eventName: eventName,
           uploaderName: uploaderName || 'Anonim',
           message: message,
           uploadedAt: new Date()
         });

        // Local dosyayı sil
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Dosya yükleme hatası: ${file.originalname}`, error);
        // Hata durumunda local dosyayı sil
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} dosya başarıyla yüklendi!`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Çoklu dosya yükleme hatası:', error);
    
    // Hata durumunda tüm local dosyaları sil
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Dosyalar yüklenemedi!',
      error: error.message
    });
  }
});

// Dosyaları listele - Herkes kullanabilir
router.get('/files', async (req, res) => {
  try {
    const { eventName } = req.query;
    
    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }

    const files = await googleDriveService.listFiles(null, eventName);

    res.json({
      success: true,
      files: files,
      eventName: eventName
    });

  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosyalar listelenemedi!'
    });
  }
});

// Dosya sil - Herkes kullanabilir
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    await googleDriveService.deleteFile(fileId);

    res.json({
      success: true,
      message: 'Dosya başarıyla silindi!'
    });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya silinemedi!'
    });
  }
});

// Proxy endpoint - Dosya içeriğini stream et
router.get('/proxy/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileContent = await googleDriveService.getFileContent(fileId);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Stream the file content
    res.send(fileContent);

  } catch (error) {
    console.error('Proxy hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya alınamadı!'
    });
  }
});

// Google Drive bağlantı ve yetki testi
router.get('/test-permissions', async (req, res) => {
  try {
    await googleDriveService.testConnectionAndPermissions();
    res.json({
      success: true,
      message: 'Google Drive bağlantısı ve yetkileri başarılı!'
    });
  } catch (error) {
    console.error('Google Drive bağlantı/yetki testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Google Drive bağlantısı veya yetkilerinde sorun var!',
      error: error.message
    });
  }
});

// Google Drive test dosyası oluştur
router.post('/test-upload', async (req, res) => {
  try {
    const testContent = 'Bu bir test dosyasıdır. ' + new Date().toISOString();
    const testFilePath = path.join(__dirname, '../test-file.txt');
    
    fs.writeFileSync(testFilePath, testContent);
    
    const uploadedFile = await googleDriveService.uploadFile(
      testFilePath,
      'test-file.txt',
      'text/plain',
      'Test User',
      'Test Event',
      'Test mesajı'
    );
    
    // Test dosyasını sil
    fs.unlinkSync(testFilePath);
    
    res.json({
      success: true,
      message: 'Test dosyası başarıyla yüklendi!',
      file: uploadedFile
    });
  } catch (error) {
    console.error('Test upload hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test dosyası yüklenemedi!',
      error: error.message
    });
  }
});

module.exports = router; 