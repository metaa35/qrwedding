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
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit (video dosyaları için)
  },
  fileFilter: function (req, file, cb) {
    const allowedExtensions = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|flv|webm|wav|mp3|ogg/;
    const allowedMimeTypes = /image\/|video\/|audio\//;
    
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim, video ve ses dosyaları yüklenebilir!'));
    }
  }
});

<<<<<<< HEAD
// Tek dosya yükleme - QR ID kontrolü ile
router.post('/single', upload.single('file'), async (req, res) => {
  const qrId = req.body.qrId;
  
  // QR ID kontrolü
  if (!qrId) {
    return res.status(400).json({
      success: false,
      message: 'QR ID gerekli!'
    });
  }

  // QR kod doğrulama
  try {
    const { data: qrData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();

    if (qrError || !qrData) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz QR kod!'
      });
    }
  } catch (error) {
    console.error('QR validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'QR kod doğrulanamadı!'
=======
// Tek dosya yükleme - QR ID gerekli
router.post('/single', upload.single('file'), async (req, res) => {
  const qrId = req.body.qrId;
  
  // QR ID yoksa erişim engellendi
  if (!qrId) {
    return res.status(403).json({
      success: false,
      message: 'QR kod gerekli! Bu sayfaya sadece QR kodundan erişebilirsiniz.'
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
    });
  }
  try {
    console.log('🔍 Upload endpoint çağrıldı');
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Request file:', req.file ? 'Dosya var' : 'Dosya yok');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message, qrId } = req.body;

    if (!uploaderName || uploaderName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Yükleyici adı gerekli!'
      });
    }
    
    console.log('📥 Upload request body:', req.body);
    console.log('📥 uploaderName:', JSON.stringify(uploaderName));
    console.log('📥 eventName:', JSON.stringify(eventName));
    console.log('📥 message:', JSON.stringify(message));

    // Etkinlik adı artık zorunlu değil, varsayılan değer kullan
    const finalEventName = eventName || 'Etkinlik';

<<<<<<< HEAD
=======
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

>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
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

<<<<<<< HEAD
    // Upload type belirleme
    const uploadType = req.file.mimetype.startsWith('image/') ? 'photo' : 
                      req.file.mimetype.startsWith('video/') ? 'video' : 
                      req.file.mimetype.startsWith('audio/') ? 'audio' : 'file';

=======
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
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
<<<<<<< HEAD
        message: message,
        upload_type: uploadType
=======
        message: message
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
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
<<<<<<< HEAD
    // Hata tipine göre özel mesaj
    let errorMessage = 'Dosya yükleme başarısız!';
    if (error.message.includes('File too large')) {
      errorMessage = 'Dosya boyutu çok büyük! Maksimum 1GB yükleyebilirsiniz.';
    } else if (error.message.includes('Invalid file type')) {
      errorMessage = 'Desteklenmeyen dosya formatı! Sadece resim, video ve ses dosyaları yüklenebilir.';
    } else if (error.message.includes('Google Drive')) {
      errorMessage = 'Google Drive bağlantı hatası! Lütfen tekrar deneyin.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Yükleme zaman aşımına uğradı! Lütfen tekrar deneyin.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
=======
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
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
    });
  }
});

<<<<<<< HEAD
// Çoklu dosya yükleme - QR ID varsa authentication gerekmez
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  // QR ID varsa authentication kontrolü yapma
  const qrId = req.body.qrId;
  if (!qrId) {
    // QR ID yoksa authentication gerekli
    try {
      await authenticateToken(req, res, () => {});
      await requireUploadPermission(req, res, () => {});
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli!'
      });
    }
=======
// Çoklu dosya yükleme - QR ID gerekli
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  const qrId = req.body.qrId;
  
  // QR ID yoksa erişim engellendi
  if (!qrId) {
    return res.status(403).json({
      success: false,
      message: 'QR kod gerekli! Bu sayfaya sadece QR kodundan erişebilirsiniz.'
    });
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
  }
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi!'
      });
    }

    const { eventName, uploaderName, message, qrId } = req.body;

    // Etkinlik adı artık zorunlu değil, varsayılan değer kullan
    const finalEventName = eventName || 'Etkinlik';

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
<<<<<<< HEAD

        // Upload type belirleme
        const uploadType = file.mimetype.startsWith('image/') ? 'photo' : 
                          file.mimetype.startsWith('video/') ? 'video' : 
                          file.mimetype.startsWith('audio/') ? 'audio' : 'file';
=======
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9

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
             message: message,
             upload_type: uploadType
           }])
           .select()
           .single();

        if (supabaseError) {
          throw supabaseError;
        }

<<<<<<< HEAD
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
=======
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
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9

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

// Dosyaları listele - QR ID varsa authentication gerekmez
router.get('/files', async (req, res) => {
  const qrId = req.query.qrId;
  
  // QR ID kontrolü
  if (!qrId) {
    return res.status(400).json({
      success: false,
      message: 'QR ID gerekli!'
    });
  }

  // QR kod doğrulama
  try {
    const { data: qrData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();

    if (qrError || !qrData) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz QR kod!'
      });
    }
  } catch (error) {
    console.error('QR validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'QR kod doğrulanamadı!'
    });
  }
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Sadece bu QR ID'ye ait dosyaları getir
    let query = supabase
      .from('uploads')
      .select('*')
      .eq('qr_id', qrId)
      .order('uploaded_at', { ascending: false });

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

// Mesaj yükleme - dosya olmadan sadece metin
router.post('/message', async (req, res) => {
  const { qrId, uploaderName, eventName, message } = req.body;
  
  // QR ID kontrolü
  if (!qrId) {
    return res.status(400).json({
      success: false,
      message: 'QR ID gerekli!'
    });
  }

  // QR kod doğrulama
  try {
    const { data: qrData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();

    if (qrError || !qrData) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz QR kod!'
      });
    }

    // Mesajı Google Drive'a kaydet
    const messageFileName = `${qrId}_message_${Date.now()}.txt`;
    const messageBuffer = Buffer.from(message, 'utf8');
    
    const uploadedMessage = await googleDriveService.uploadFileFromBuffer(
      messageBuffer,
      messageFileName,
      'text/plain',
      uploaderName || 'Anonim',
      eventName || qrData.event_name,
      message,
      qrId
    );

    // Mesaj veritabanına kaydet
    const { data: messageData, error: messageError } = await supabase
      .from('uploads')
      .insert({
        file_id: uploadedMessage.fileId,
        file_name: uploadedMessage.fileName,
        file_size: message.length,
        mime_type: 'text/plain',
        web_view_link: uploadedMessage.webViewLink,
        event_name: eventName || qrData.event_name,
        qr_id: qrId,
        uploader_name: uploaderName,
        message: message,
        upload_type: 'message',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('Message upload error:', messageError);
      // Google Drive'dan dosyayı sil
      try {
        await googleDriveService.deleteFile(uploadedMessage.fileId);
      } catch (deleteError) {
        console.error('Google Drive dosya silme hatası:', deleteError);
      }
      return res.status(500).json({
        success: false,
        message: 'Mesaj kaydedilemedi!',
        error: messageError.message
      });
    }

    res.json({
      success: true,
      message: 'Mesaj başarıyla kaydedildi!',
      data: messageData
    });

  } catch (error) {
    console.error('Message upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj kaydedilemedi!',
      error: error.message
    });
  }
});

// Video streaming endpoint - CSP uyumlu video oynatma için
router.get('/stream/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log('🎥 Video streaming başlatılıyor - fileId:', fileId);
    
    // Supabase'den dosya bilgilerini al
    const { data: fileData, error: fileError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', fileId)
      .single();

    console.log('📋 Supabase response:', { fileData, fileError });

    if (fileError || !fileData) {
      console.log('❌ Dosya bulunamadı:', fileError);
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı!'
      });
    }

    console.log('📁 Google Drive file_id:', fileData.file_id);
    console.log('📄 MIME type:', fileData.mime_type);

    // Google Drive'dan dosyayı al
    const fileBuffer = await googleDriveService.getFileContent(fileData.file_id);
    
    // Video headers
    res.setHeader('Content-Type', fileData.mime_type || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Video dosyasını stream et
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Video streaming error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      fileId: req.params.fileId
    });
    res.status(500).json({
      success: false,
      message: 'Video oynatılamadı!',
      error: error.message
    });
  }
});

// Test endpoint - video streaming debug için
router.get('/test-stream/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log('🧪 Test streaming - fileId:', fileId);
    
    // Supabase'den dosya bilgilerini al
    const { data: fileData, error: fileError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı!',
        error: fileError
      });
    }

    res.json({
      success: true,
      fileData: {
        id: fileData.id,
        file_id: fileData.file_id,
        file_name: fileData.file_name,
        mime_type: fileData.mime_type,
        file_size: fileData.file_size
      }
    });
    
  } catch (error) {
    console.error('Test streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Test hatası!',
      error: error.message
    });
  }
});

module.exports = router; 