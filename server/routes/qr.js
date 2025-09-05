const express = require('express');
const QRCode = require('qrcode');
const { authenticateToken } = require('../middleware/auth');
const { requireQrPermission } = require('../middleware/permissions');
const supabase = require('../services/supabase');

const router = express.Router();

// QR kod doğrulama
router.get('/validate/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;
    console.log('QR validation request - qrId:', qrId);

    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: 'QR ID gerekli!'
      });
    }

    // QR kod bilgilerini veritabanından al
    const { data: qrData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();

    console.log('QR data query result:', { qrData, qrError });

    if (qrError || !qrData) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz QR kod!'
      });
    }

    // Event bilgilerini hazırla
    const eventData = {
      name: qrData.event_name,
      date: qrData.event_date,
      message: qrData.custom_message,
      qrId: qrData.qr_id
    };

    res.json({
      success: true,
      eventData: eventData
    });

  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod doğrulanırken bir hata oluştu!'
    });
  }
});

// QR kod oluştur
router.post('/generate', authenticateToken, requireQrPermission, async (req, res) => {
  try {
    const { eventName, eventDate, customMessage } = req.body;
    const userId = req.user.id;

    // Event name kontrolü
    if (!eventName || eventName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }
    
    const finalEventName = eventName;

    // Admin değilse yetki kontrolü yap
    if (!req.user.is_admin) {
      if (!req.user.can_create_qr) {
        return res.status(403).json({
          success: false,
          message: 'QR kod oluşturma yetkiniz yok! Admin panelinden yetki almanız gerekiyor.',
          code: 'PERMISSION_REQUIRED'
        });
      }
    }

    // Admin değilse QR oluşturma kontrolü yap
    if (!req.user.is_admin) {
      try {
        // Kullanıcının has_created_qr durumunu kontrol et
        const { data: currentUserData, error: userError } = await supabase
          .from('users')
          .select('has_created_qr')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Kullanıcı bilgisi alma hatası:', userError);
          throw userError;
        }

        // Eğer kullanıcı daha önce QR oluşturmuşsa, hata ver
        if (currentUserData && currentUserData.has_created_qr) {
          return res.status(400).json({
            success: false,
            message: 'QR kod oluşturma hakkınızı kullandınız! Admin panelinden QR hakkınızı sıfırlatmanız gerekiyor.',
            code: 'QR_ALREADY_CREATED'
          });
        }
      } catch (error) {
        console.error('QR kontrol hatası:', error);
        throw error;
      }
    }

    // Benzersiz QR ID oluştur - sadece timestamp kullan
    const qrId = `${Date.now()}`;
    
    // QR kod URL'i oluştur
    const baseUrl = 'https://www.hatirakosesi.com';
    const qrUrl = `${baseUrl}/upload?qr=${qrId}&eventName=${encodeURIComponent(finalEventName)}`;
    
    // Galeri URL'i oluştur - QR ID ile benzersiz
    const galleryUrl = `${baseUrl}/gallery?qr=${qrId}&eventName=${encodeURIComponent(finalEventName)}`;

    // QR kod resmi oluştur
    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Tarih kontrolü - boş tarih ise null olarak ayarla
    const formattedEventDate = eventDate && eventDate.trim() !== '' ? eventDate : null;

    // Supabase'e kaydet
    const { data: qrRecord, error } = await supabase
      .from('qr_codes')
      .insert([{
        qr_id: qrId,
        user_id: userId,
        event_name: finalEventName,
        event_date: formattedEventDate,
        custom_message: customMessage,
        url: qrUrl,
        qr_code_image: qrCodeDataURL,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    // QR oluşturulduktan sonra kullanıcının has_created_qr durumunu güncelle
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          has_created_qr: true,
          qr_created_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('QR durumu güncelleme hatası:', updateError);
      } else {
        console.log('QR oluşturma durumu güncellendi:', userId);
      }
    } catch (error) {
      console.error('QR durumu güncelleme genel hatası:', error);
      // QR oluşturuldu ama durum güncellenemedi, bu kritik değil
    }

    res.json({
      success: true,
      message: 'QR kod başarıyla oluşturuldu!',
      qrCode: qrCodeDataURL,
      qrId: qrId, // QR ID'yi response'a ekle
      url: qrUrl, // QR ID ile birlikte tam URL
      galleryUrl: galleryUrl, // QR ID ile birlikte galeri URL
      eventName: finalEventName,
      eventDate: eventDate,
      customMessage: customMessage,
      generatedBy: req.user.username,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('QR kod oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulamadı!',
      error: error.message
    });
  }
});

// Kullanıcının QR kodunu getir
router.get('/user-qr', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!qrCode) {
      return res.json({
        success: true,
        qrCode: null,
        message: 'Henüz QR kod oluşturmamışsınız.'
      });
    }

    res.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        qrId: qrCode.qr_id,
        eventName: qrCode.event_name,
        eventDate: qrCode.event_date,
        customMessage: qrCode.custom_message,
        url: qrCode.url,
        qrCode: qrCode.qr_code_image,
        createdAt: qrCode.created_at
      }
    });

  } catch (error) {
    console.error('Kullanıcı QR kodu getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod bilgileri alınamadı!',
      error: error.message
    });
  }
});

// QR kod doğrula
router.get('/verify/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .eq('is_active', true)
      .single();

    if (error || !qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı veya aktif değil!'
      });
    }

    res.json({
      success: true,
      message: 'QR kod doğrulandı!',
      qr: {
        id: qrCode.qr_id, // QR ID'yi hem id hem qrId olarak set et
        qrId: qrCode.qr_id,
        eventName: qrCode.event_name,
        eventDate: qrCode.event_date,
        eventLocation: qrCode.event_location,
        description: qrCode.description,
        isActive: qrCode.is_active,
        createdAt: qrCode.created_at
      }
    });

  } catch (error) {
    console.error('QR kod doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod doğrulanamadı!',
      error: error.message
    });
  }
});

// QR kod bilgileri
router.get('/info/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_id', qrId)
      .single();

    if (error || !qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı!'
      });
    }

    // Bu QR kod için yüklenen dosyaları al
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .eq('event_name', qrCode.event_name)
      .order('uploaded_at', { ascending: false });

    if (uploadsError) {
      console.error('Uploads getirme hatası:', uploadsError);
    }

    res.json({
      success: true,
      qr: {
        id: qrCode.qr_id, // QR ID'yi hem id hem qrId olarak set et
        qrId: qrCode.qr_id,
        eventName: qrCode.event_name,
        eventDate: qrCode.event_date,
        eventLocation: qrCode.event_location,
        description: qrCode.description,
        isActive: qrCode.is_active,
        createdAt: qrCode.created_at,
        uploads: uploads || []
      }
    });

  } catch (error) {
    console.error('QR kod bilgi alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod bilgileri alınamadı!',
      error: error.message
    });
  }
});

// QR kodları listele
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    // Sayfalama
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: qrCodes, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      qrCodes: qrCodes || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('QR kod listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kodlar listelenemedi!',
      error: error.message
    });
  }
});

// QR kod güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, eventDate, eventLocation, description, isActive } = req.body;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update({
        event_name: eventName,
        event_date: eventDate,
        event_location: eventLocation,
        description: description,
        is_active: isActive,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'QR kod başarıyla güncellendi!',
      qr: qrCode
    });

  } catch (error) {
    console.error('QR kod güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod güncellenemedi!',
      error: error.message
    });
  }
});

// QR kod silme işlemi kaldırıldı - QR kodlar kalıcıdır

module.exports = router; 