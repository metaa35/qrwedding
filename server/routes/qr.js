const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

// QR kod oluşturma - Herkes kullanabilir
router.post('/generate', async (req, res) => {
  try {
    const { url, eventName } = req.body;

    if (!url || !eventName) {
      return res.status(400).json({
        success: false,
        message: 'URL ve etkinlik adı gerekli!'
      });
    }

    // QR kod oluştur
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      url: url,
      eventName: eventName,
      generatedBy: 'Anonymous',
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('QR kod oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulamadı!'
    });
  }
});

// QR kod doğrulama endpoint'i
router.get('/verify/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Burada eventId'yi veritabanında kontrol edebilirsiniz
    // Şimdilik basit bir doğrulama yapıyoruz
    
    if (!eventId || eventId.length !== 36) {
      return res.status(400).json({ 
        error: 'Geçersiz event ID',
        valid: false 
      });
    }

    res.json({
      success: true,
      valid: true,
      eventId: eventId,
      message: 'QR kod geçerli'
    });

  } catch (error) {
    console.error('QR kod doğrulama hatası:', error);
    res.status(500).json({ 
      error: 'QR kod doğrulanamadı',
      message: error.message 
    });
  }
});

// QR kod bilgilerini getir
router.get('/info/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Burada eventId'ye göre etkinlik bilgilerini veritabanından çekebilirsiniz
    // Şimdilik örnek veri döndürüyoruz
    
    res.json({
      success: true,
      eventInfo: {
        id: eventId,
        name: 'Ahmet & Ayşe Düğünü',
        date: '2024-06-15',
        location: 'İstanbul',
        message: 'Anılarımızı paylaşın!',
        uploadUrl: `/upload?eventId=${eventId}`
      }
    });

  } catch (error) {
    console.error('Event bilgisi alma hatası:', error);
    res.status(500).json({ 
      error: 'Etkinlik bilgisi alınamadı',
      message: error.message 
    });
  }
});

// QR kod önizleme endpoint'i (test için)
router.get('/preview/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { eventName = 'Düğün' } = req.query;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const qrUrl = `${baseUrl}/upload?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });

    res.json({
      success: true,
      eventId: eventId,
      qrUrl: qrUrl,
      qrCodeDataURL: qrCodeDataURL
    });

  } catch (error) {
    console.error('QR kod önizleme hatası:', error);
    res.status(500).json({ 
      error: 'QR kod önizlenemedi',
      message: error.message 
    });
  }
});

module.exports = router; 