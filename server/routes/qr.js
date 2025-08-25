const express = require('express');
const QRCode = require('qrcode');
const { authenticateToken } = require('../middleware/auth');
const { requireQrPermission } = require('../middleware/permissions');
const supabase = require('../services/supabase');

const router = express.Router();

// QR kod oluştur
router.post('/generate', authenticateToken, requireQrPermission, async (req, res) => {
  try {
    const { eventName, eventDate, customMessage } = req.body;
    const userId = req.user.id;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik adı gerekli!'
      });
    }

    // Admin değilse yetki kontrolü yap
    if (!req.user.is_admin) {
      if (!req.user.can_create_qr) {
        return res.status(403).json({
          success: false,
          message: 'QR kod oluşturma yetkiniz yok! Admin panelinden yetki almanız gerekiyor.',
          code: 'PERMISSION_REQUIRED'
        });
      }

      // Admin olmayan kullanıcılar için QR sayısı kontrolü (limit: 10)
      const { data: existingQRs, error: checkError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', userId);

      if (checkError) {
        throw checkError;
      }

      if (existingQRs && existingQRs.length >= 10) {
        return res.status(400).json({
          success: false,
          message: 'QR kod oluşturma limitinize ulaştınız! Maksimum 10 QR kod oluşturabilirsiniz.'
        });
      }
    }

    // Benzersiz QR ID oluştur
    const qrId = `qr_${eventName.replace(/\s+/g, '_')}_${Date.now()}`;
    
    // QR kod URL'i oluştur
    const baseUrl = process.env.BASE_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://www.hatirakosesi.com' : 'http://localhost:3000');
    const qrUrl = `${baseUrl}/upload?qr=${qrId}&eventName=${encodeURIComponent(eventName)}`;
    
    // Galeri URL'i oluştur - QR ID ile benzersiz
    const galleryUrl = `${baseUrl}/gallery?qr=${qrId}&eventName=${encodeURIComponent(eventName)}`;

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
        event_name: eventName,
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

    res.json({
      success: true,
      message: 'QR kod başarıyla oluşturuldu!',
      qrCode: qrCodeDataURL,
      qrId: qrId, // QR ID'yi response'a ekle
      url: qrUrl, // QR ID ile birlikte tam URL
      galleryUrl: galleryUrl, // QR ID ile birlikte galeri URL
      eventName: eventName,
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
        id: qrCode.id,
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
        id: qrCode.id,
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

// QR kod sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'QR kod başarıyla silindi!'
    });

  } catch (error) {
    console.error('QR kod silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod silinemedi!',
      error: error.message
    });
  }
});

module.exports = router; 