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

// Multer konfigürasyonu - Vercel için memory storage kullan
const upload = multer({ 
  storage: multer.memoryStorage(), // Dosyaları memory'de tut
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

// Tek dosya yükleme - QR ID gerekli
router.post('/single', upload.single('file'), async (req, res) => {
  const qrId = req.body.qrId;
  
  // QR ID yoksa erişim engellendi
  if (!qrId) {
    return res.status(403).json({
      success: false,
      message: 'QR kod gerekli! Bu sayfaya sadece QR kodundan erişebilirsiniz.'
    });
  }
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    if (!uploaderName || uploaderName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Yükleyici adı gerekli!'
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

    // QR ID varsa etkinlik adını QR kodundan al, client'tan gelen etkinlik adını kullanma
    let finalEventName = eventName;
    if (qrId) {
      try {
        // QR kodundan etkinlik adını al
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('event_name')
          .eq('qr_id', qrId)
          .single();

        if (qrError || !qrCode) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz QR kod!'
          });
        }

        // QR kodundan gelen etkinlik adını kullan
        finalEventName = qrCode.event_name;
        console.log('🔒 QR ID ile gelen etkinlik adı kullanılıyor:', finalEventName);
      } catch (error) {
        console.error('QR kod doğrulama hatası:', error);
        return res.status(400).json({
          success: false,
          message: 'QR kod doğrulanamadı!'
        });
      }
    }

    // QR ID varsa dosya adına ekle, yoksa sadece event name kullan
    const fileName = qrId 
      ? `${qrId}_${Date.now()}_${req.file.originalname}`
      : `${finalEventName}_${Date.now()}_${req.file.originalname}`;
    
    // Google Drive'a yükle - memory'den direkt
    const uploadedFile = await googleDriveService.uploadFileFromBuffer(
      req.file.buffer, // Memory'deki dosya buffer'ı
      fileName, 
      req.file.mimetype,
      uploaderName || 'Anonim',
      finalEventName,
      message,
      qrId
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
        event_name: finalEventName,
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

    // Memory storage kullandığımız için dosya silme işlemi gerekmez

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
        eventName: finalEventName,
        uploaderName: uploaderName || 'Anonim',
        message: message,
        uploadedAt: uploadRecord.uploaded_at
      }
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Memory storage kullandığımız için dosya temizleme işlemi gerekmez
    
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme başarısız!',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Çoklu dosya yükleme - QR ID gerekli
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  const qrId = req.body.qrId;
  
  // QR ID yoksa erişim engellendi
  if (!qrId) {
    return res.status(403).json({
      success: false,
      message: 'QR kod gerekli! Bu sayfaya sadece QR kodundan erişebilirsiniz.'
    });
  }
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

    if (!uploaderName || uploaderName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Yükleyici adı gerekli!'
      });
    }

    // QR ID varsa etkinlik adını QR kodundan al, client'tan gelen etkinlik adını kullanma
    let finalEventName = eventName;
    if (qrId) {
      try {
        // QR kodundan etkinlik adını al
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('event_name')
          .eq('qr_id', qrId)
          .single();

        if (qrError || !qrCode) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz QR kod!'
          });
        }

        // QR kodundan gelen etkinlik adını kullan
        finalEventName = qrCode.event_name;
        console.log('🔒 QR ID ile gelen etkinlik adı kullanılıyor (çoklu):', finalEventName);
      } catch (error) {
        console.error('QR kod doğrulama hatası (çoklu):', error);
        return res.status(400).json({
          success: false,
          message: 'QR kod doğrulanamadı!'
        });
      }
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // QR ID varsa dosya adına ekle, yoksa sadece event name kullan
        const fileName = qrId 
          ? `${qrId}_${Date.now()}_${file.originalname}`
          : `${finalEventName}_${Date.now()}_${file.originalname}`;
        
        // Google Drive'a yükle - memory'den direkt
        const uploadedFile = await googleDriveService.uploadFileFromBuffer(
          file.buffer, // Memory'deki dosya buffer'ı
          fileName, 
          file.mimetype,
          uploaderName || 'Anonim',
          finalEventName,
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
             event_name: finalEventName,
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
           eventName: finalEventName,
           uploaderName: uploaderName || 'Anonim',
           message: message,
           uploadedAt: uploadRecord.uploaded_at
         });

        // Memory storage kullandığımız için dosya silme işlemi gerekmez

      } catch (error) {
        console.error(`Dosya yükleme hatası (${file.originalname}):`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
        
        // Memory storage kullandığımız için dosya temizleme işlemi gerekmez
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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Memory storage kullandığımız için dosya temizleme işlemi gerekmez
    
    res.status(500).json({
      success: false,
      message: 'Dosya yükleme başarısız!',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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