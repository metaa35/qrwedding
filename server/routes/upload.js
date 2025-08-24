const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { authenticateToken } = require('../middleware/auth');
const { requireUploadPermission, requireGalleryPermission } = require('../middleware/permissions');
const googleDriveService = require('../services/googleDrive');
const supabase = require('../services/supabase');

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

// Tek dosya yükleme - Yetkili kullanıcılar kullanabilir
router.post('/single', authenticateToken, requireUploadPermission, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message, qrId } = req.body;
    
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
    // QR ID varsa dosya adına ekle, yoksa sadece event name kullan
    const fileName = qrId 
      ? `${qrId}_${Date.now()}_${req.file.originalname}`
      : `${eventName}_${Date.now()}_${req.file.originalname}`;
    
         const uploadedFile = await googleDriveService.uploadFile(
       filePath, 
       fileName, 
       req.file.mimetype, // Gerçek MIME type
       uploaderName || 'Anonim',
       eventName,
       message,
       qrId // QR ID'yi Google Drive servisine gönder
     );

         // Supabase'e kaydet - QR ID ile
     const { data: uploadRecord, error: supabaseError } = await supabase
       .from('uploads')
       .insert([{
         file_id: uploadedFile.fileId,
         file_name: uploadedFile.fileName,
         file_size: req.file.size,
         mime_type: req.file.mimetype,
         web_view_link: uploadedFile.webViewLink,
         event_name: eventName,
         qr_id: qrId || null, // QR ID'yi kaydet
         uploader_name: uploaderName || 'Anonim',
         message: message
       }])
       .select()
       .single();

    if (supabaseError) {
      console.error('Supabase kayıt hatası:', supabaseError);
      // Google Drive'dan dosyayı sil
      try {
        await googleDriveService.deleteFile(uploadedFile.fileId);
      } catch (deleteError) {
        console.error('Google Drive dosya silme hatası:', deleteError);
      }
      throw supabaseError;
    }

    // Local dosyayı sil
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi!',
      file: {
        id: uploadRecord.id,
        fileId: uploadedFile.fileId,
        name: uploadedFile.fileName,
        size: req.file.size,
        mimeType: req.file.mimetype,
        webViewLink: uploadedFile.webViewLink,
        eventName: eventName,
        uploaderName: uploaderName || 'Anonim',
        message: message,
        uploadedAt: uploadRecord.uploaded_at
      }
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    
    // Local dosyayı temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme başarısız!',
      error: error.message
    });
  }
});

// Çoklu dosya yükleme
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message, qrId } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const filePath = file.path;
        // QR ID varsa dosya adına ekle, yoksa sadece event name kullan
        const fileName = qrId 
          ? `${qrId}_${Date.now()}_${file.originalname}`
          : `${eventName}_${Date.now()}_${file.originalname}`;
        
                 const uploadedFile = await googleDriveService.uploadFile(
           filePath, 
           fileName, 
           file.mimetype,
           uploaderName || 'Anonim',
           eventName,
           message,
           qrId // QR ID'yi Google Drive servisine gönder
         );

                 // Supabase'e kaydet - QR ID ile
         const { data: uploadRecord, error: supabaseError } = await supabase
           .from('uploads')
           .insert([{
             file_id: uploadedFile.fileId,
             file_name: uploadedFile.fileName,
             file_size: file.size,
             mime_type: file.mimetype,
             web_view_link: uploadedFile.webViewLink,
             event_name: eventName,
             qr_id: qrId || null, // QR ID'yi kaydet
             uploader_name: uploaderName || 'Anonim',
             message: message
           }])
           .select()
           .single();

        if (supabaseError) {
          throw supabaseError;
        }

        uploadedFiles.push({
          id: uploadRecord.id,
          fileId: uploadedFile.fileId,
          name: uploadedFile.fileName,
          size: file.size,
          mimeType: file.mimetype,
          webViewLink: uploadedFile.webViewLink,
          eventName: eventName,
          uploaderName: uploaderName || 'Anonim',
          message: message,
          uploadedAt: uploadRecord.uploaded_at
        });

        // Local dosyayı sil
        fs.unlinkSync(filePath);

      } catch (error) {
        console.error(`Dosya yükleme hatası (${file.originalname}):`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
        
        // Local dosyayı temizle
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} dosya başarıyla yüklendi!`,
      files: uploadedFiles,
      errors: errors
    });

  } catch (error) {
    console.error('Çoklu dosya yükleme hatası:', error);
    
    // Tüm local dosyaları temizle
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme başarısız!',
      error: error.message
    });
  }
});

// Dosyaları listele
router.get('/files', authenticateToken, requireGalleryPermission, async (req, res) => {
  try {
    const { eventName, qr, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('uploads')
      .select('*')
      .order('uploaded_at', { ascending: false });

         // QR ID varsa, sadece o QR koduna ait dosyaları getir
     if (qr) {
       query = query.eq('qr_id', qr);
     } else if (eventName) {
       // QR ID yoksa, event name'e göre getir (geriye uyumluluk)
       query = query.eq('event_name', eventName);
     }

    // Sayfalama
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: files, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      files: files || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosyalar listelenemedi!',
      error: error.message
    });
  }
});

// Toplu ZIP indirme - Galeri sayfasından erişim için yetki kontrolü yok
router.get('/download-all', async (req, res) => {
  try {
    const { eventName, qr } = req.query;

    if (!eventName && !qr) {
      return res.status(400).json({
        success: false,
        message: 'Event adı veya QR ID gerekli!'
      });
    }

    // Dosyaları getir
    let query = supabase
      .from('uploads')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (qr) {
      query = query.eq('qr_id', qr);
    } else if (eventName) {
      query = query.eq('event_name', eventName);
    }

    const { data: files, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Dosyalar yüklenirken hata oluştu!'
      });
    }

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İndirilecek dosya bulunamadı!'
      });
    }

    // ZIP dosyası oluştur
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maksimum sıkıştırma
    });

    const fileName = qr ? `${qr}_dosyalar.zip` : `${eventName}_dosyalar.zip`;
    res.attachment(fileName);
    archive.pipe(res);

    // Her dosya için Google Drive'dan indir ve ZIP'a ekle
    for (const file of files) {
      try {
        const fileId = file.file_id;
        const fileName = file.file_name;
        
        // Google Drive'dan dosya stream'i al
        const fileStream = await googleDriveService.getFileStream(fileId);
        
        if (fileStream) {
          archive.append(fileStream, { name: fileName });
        }
      } catch (fileError) {
        console.error(`Dosya indirme hatası (${file.file_name}):`, fileError);
        // Hata olsa bile devam et
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('ZIP indirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'ZIP dosyası oluşturulurken hata oluştu!'
    });
  }
});

// Dosya sil
router.delete('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Dosyayı Supabase'den al
    const { data: file, error: fetchError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı!'
      });
    }

    // Google Drive'dan sil
    try {
      await googleDriveService.deleteFile(file.file_id);
    } catch (driveError) {
      console.error('Google Drive silme hatası:', driveError);
    }

    // Supabase'den sil
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: 'Dosya başarıyla silindi!'
    });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya silinemedi!',
      error: error.message
    });
  }
});

module.exports = router; 