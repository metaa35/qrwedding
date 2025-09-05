import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Download, 
  Copy, 
  Heart, 
  Calendar, 
  MessageCircle,
  Share2,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const QRGenerator = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    customMessage: '',
    url: ''
  });

  const [qrData, setQrData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // QR Şablonları - Görsel tabanlı
  const templates = [
    {
      id: 'wedding-love-template',
      name: 'Düğün - Aşk Şablonu',
      description: 'Elegant wedding template with love theme - görsel şablon',
      image: '/templates/test.png',
      qrPosition: { x: 325, y: 710, size: 150 },
      textPositions: {
        eventName: { x: 400, y: 700, fontSize: 20, color: '#373434' },
        date: { x: 400, y: 880, fontSize: 18, color: '#373434' },
        customMessage: { x: 400, y: 920, fontSize: 16, color: '#373434' }
      }
    }
  ];

  // Kullanıcı bilgilerini yeniden yükle
  const refreshUserData = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        // AuthContext'teki user bilgilerini güncelle
        // Bu işlem AuthContext'te yapılmalı, burada sadece tetikleyici olarak kullanıyoruz
        console.log('Kullanıcı bilgileri yenilendi');
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yenileme hatası:', error);
    }
  };

  // Mevcut QR'ı yükle
  const loadExistingQR = async () => {
    try {
      console.log('Mevcut QR yükleniyor...');
      const response = await axios.get('/api/qr/user-qr');
      console.log('QR response:', response.data);
      console.log('QR response success:', response.data.success);
      console.log('QR response qrCode:', response.data.qrCode);
      console.log('QR response qrCode type:', typeof response.data.qrCode);
      
      if (response.data.success && response.data.qrCode && response.data.qrCode !== null) {
        const existingQR = response.data.qrCode;
        console.log('Mevcut QR bulundu:', existingQR);
        setQrData({
          qrCodeUrl: existingQR.qrCode,
          eventName: existingQR.eventName,
          eventDate: existingQR.eventDate,
          customMessage: existingQR.customMessage,
          url: existingQR.url,
          qrId: existingQR.qrId
        });
        console.log('Mevcut QR yüklendi:', existingQR);
      } else {
        console.log('Mevcut QR bulunamadı - yeni QR oluşturulabilir');
        // QR bulunamadığında qrData'yı temizle
        setQrData(null);
      }
    } catch (error) {
      console.error('Mevcut QR yükleme hatası:', error);
      if (error.response?.status === 429) {
        console.log('Rate limit exceeded, retrying later...');
        // Rate limit aşıldıysa 3 saniye sonra tekrar dene
        setTimeout(() => {
          loadExistingQR();
        }, 3000);
        return;
      }
      // Hata durumunda sessizce devam et
    }
  };

  // Yetki kontrolü ve mevcut QR yükleme
  useEffect(() => {
    console.log('QRGenerator useEffect - loading:', loading, 'authLoading:', authLoading, 'user:', user);
    
    // Loading durumunda bekle
    if (loading) {
      console.log('Loading durumunda bekleniyor...');
      return;
    }
    
    if (!user) {
      console.log('User bulunamadı, login sayfasına yönlendiriliyor...');
      toast.error('QR kod oluşturmak için giriş yapmalısınız!');
      navigate('/login');
      return;
    }
    
    if (!user?.can_create_qr && !user?.is_admin) {
      console.log('QR oluşturma yetkisi yok, ana sayfaya yönlendiriliyor...');
      toast.error('QR kod oluşturma yetkiniz yok!');
      navigate('/');
      return;
    }
    
    console.log('User bilgileri alındı, QR yükleme başlıyor...');
    
    // Company name'i formData'ya ekle
    if (user?.company_name) {
      setFormData(prev => ({
        ...prev,
        eventName: user.company_name
      }));
    }
    
    // Kullanıcının mevcut QR'ını yükle
    loadExistingQR();
  }, [user, loading, navigate]);

  // Auth loading kontrolü
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // URL parametrelerini kontrol et (QR sıfırlama sonrası)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'success') {
      // QR sıfırlama başarılı, sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePresetClick = (preset) => {
    setFormData(prev => ({
      ...prev,
      eventName: preset.name,
      eventDate: preset.date,
      customMessage: preset.message
    }));
  };

  const handleGenerateQR = async () => {
    if (!formData.eventName.trim()) {
      toast.error('Etkinlik adı gereklidir!');
      return;
    }

    // Eğer kullanıcı zaten QR oluşturmuşsa ve admin değilse
    if (user?.has_created_qr && !user?.is_admin) {
      toast.error('QR kod oluşturma hakkınızı kullandınız! Admin panelinden sıfırlatmanız gerekiyor.');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post('/api/qr/generate', {
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        customMessage: formData.customMessage,
        url: formData.url
      });

      if (response.data.success) {
        console.log('QR Response:', response.data);
        // Backend'den gelen response'u frontend formatına çevir
        const qrData = {
          qrCodeUrl: response.data.qrCode,
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          customMessage: formData.customMessage,
          url: response.data.url,
          qrId: response.data.qrId
        };
        console.log('QR Data:', qrData);
        setQrData(qrData);
        
        // Kullanıcı bilgilerini güncelle (has_created_qr = true)
        if (user) {
          user.has_created_qr = true;
          user.qr_created_at = new Date().toISOString();
        }
        
        // QR oluşturulduktan sonra mevcut QR'ı yeniden yükle
        setTimeout(() => {
          loadExistingQR();
        }, 500);
        
        toast.success('QR kod başarıyla oluşturuldu!');
      } else {
        toast.error(response.data.message || 'QR kod oluşturulamadı!');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      if (error.response?.data?.code === 'QR_ALREADY_CREATED') {
        toast.error('QR kod oluşturma hakkınızı kullandınız! Admin panelinden sıfırlatmanız gerekiyor.');
      } else if (error.response?.data?.code === 'PERMISSION_REQUIRED') {
        toast.error('QR kod oluşturma yetkiniz yok! Admin panelinden yetki almanız gerekiyor.');
        navigate('/pricing');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('QR kod oluşturulurken bir hata oluştu!');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrData?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrData.qrCodeUrl;
      link.download = `qr-code-${formData.eventName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR kod indirildi!');
    }
  };

  const handleDownloadWithTemplate = async (template) => {
    if (!qrData?.qrCodeUrl) return;

    try {
      // Canvas oluştur
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 1000;

      // Şablon görselini yükle
      const templateImage = new Image();
      templateImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        templateImage.onload = resolve;
        templateImage.onerror = reject;
        templateImage.src = template.image;
      });

      // Şablon görselini canvas'a çiz
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

      // QR kodunu yükle
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrData.qrCodeUrl;
      });

      // QR kodunu şablona oturt
      const { x: qrX, y: qrY, size: qrSize } = template.qrPosition;
      
      // QR kodu çiz
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // QR kodun arka planını beyaz yap, siyah kısımları koru
      const imageData = ctx.getImageData(qrX, qrY, qrSize, qrSize);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Beyaz pikselleri beyaz bırak, siyah pikselleri siyah bırak
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          // Beyaz pikseller - beyaz bırak
          data[i] = 255;     // Red
          data[i + 1] = 255; // Green
          data[i + 2] = 255; // Blue
          data[i + 3] = 255; // Alpha (opak)
        } else {
          // Siyah pikseller - siyah bırak
          data[i] = 0;       // Red
          data[i + 1] = 0;   // Green
          data[i + 2] = 0;   // Blue
          data[i + 3] = 255; // Alpha (opak)
        }
      }
      
      ctx.putImageData(imageData, qrX, qrY);

      // Metinleri ekle
      ctx.textAlign = 'center';
      
      // Metin sarma fonksiyonu
      const drawWrappedText = (text, x, y, maxWidth, fontSize, color) => {
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px Arial`;
        
        const words = text.split(' ');
        let line = '';
        let lineHeight = fontSize * 1.2;
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
      };
      
      // Her metin pozisyonu için
      Object.entries(template.textPositions).forEach(([key, pos]) => {
        if (pos && pos.x && pos.y) {
          let text = '';
          switch (key) {
            case 'eventName':
              text = qrData.eventName || 'Düğün';
              ctx.fillStyle = pos.color;
              ctx.font = `bold ${pos.fontSize}px Arial`;
              ctx.fillText(text, pos.x, pos.y);
              break;
            case 'date':
              text = qrData.eventDate ? new Date(qrData.eventDate).toLocaleDateString('tr-TR') : '05.10.2025';
              ctx.fillStyle = pos.color;
              ctx.font = `bold ${pos.fontSize}px Arial`;
              ctx.fillText(text, pos.x, pos.y);
              break;
            case 'customMessage':
              text = qrData.customMessage || '';
              if (text) {
                drawWrappedText(text, pos.x, pos.y, 400, pos.fontSize, pos.color);
              }
              break;
          }
        }
      });

      // İndir
      const link = document.createElement('a');
      link.download = `qr-template-${template.id}-${qrData.eventName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${template.name} şablonu ile QR kod indirildi!`);
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Şablon indirme hatası! Şablon dosyası bulunamadı.');
    }
  };

  const handleCopyUrl = async () => {
    if (qrData?.url) {
      try {
        await navigator.clipboard.writeText(qrData.url);
        setCopied(true);
        toast.success('URL kopyalandı!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('URL kopyalanamadı!');
      }
    }
  };

  const presets = [
    {
      name: 'Düğün',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      message: 'Sevgili misafirlerimiz, düğünümüzde çektiğiniz fotoğrafları bu QR kod ile paylaşabilirsiniz. Anılarımızı birlikte oluşturalım! 💕'
    },
    {
      name: 'Nişan',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      message: 'Nişan törenimizde çektiğiniz fotoğrafları bu QR kod ile paylaşın. Bu özel günü birlikte hatırlayalım! 💍'
    },
    {
      name: 'Doğum Günü',
      date: new Date().toISOString().split('T')[0],
      message: 'Doğum günü partimde çektiğiniz fotoğrafları bu QR kod ile paylaşın. Bu güzel anları birlikte saklayalım! 🎂'
    },
    {
      name: 'Mezuniyet',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      message: 'Mezuniyet törenimizde çektiğiniz fotoğrafları bu QR kod ile paylaşın. Bu önemli günü birlikte kutlayalım! 🎓'
    }
  ];

  console.log('QRGenerator render - loading:', loading, 'authLoading:', authLoading, 'user:', user);

  if (loading) {
    console.log('Loading durumunda render ediliyor...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#6E473B'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2]/50 via-white/30 to-[#BEB5A9]/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(110, 71, 59, 0.08)'}}></div>
        <div className="absolute top-40 right-32 w-48 h-48 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(167, 141, 120, 0.06)', animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(190, 181, 169, 0.05)', animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
              >
                <QrCode className="h-8 w-8" style={{color: '#6E473B'}} />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">QR Kod Oluştur</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Etkinliğiniz için özel QR kod oluşturun ve misafirlerinizin fotoğraflarını kolayca toplayın
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 gap-12 ${(!user?.has_created_qr || user?.is_admin) ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
              {/* Form Section - Sadece QR oluşturmamış kullanıcılar veya admin için göster */}
              {(!user?.has_created_qr || user?.is_admin) && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="card"
                >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Etkinlik Bilgileri</h2>
                
                {/* Preset Buttons */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Hızlı Şablonlar</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetClick(preset)}
                        className="btn-outline text-sm py-2 px-3"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form className="space-y-6">
                  {/* Event Name */}
                  <div>
                    <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik Adı *
                    </label>
                    <input
                      type="text"
                      id="eventName"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Örn: Ahmet & Ayşe'nin Düğünü"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik Tarihi
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  {/* Custom Message */}
                  <div>
                    <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      Özel Mesaj
                    </label>
                    <textarea
                      id="customMessage"
                      name="customMessage"
                      value={formData.customMessage}
                      onChange={handleChange}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Misafirlerinize özel bir mesaj yazın..."
                    />
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    type="button"
                    onClick={handleGenerateQR}
                    disabled={generating}
                    className="btn-primary w-full flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {generating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        QR Kod Oluşturuluyor...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <QrCode className="mr-2 h-5 w-5" />
                        QR Kod Oluştur
                      </div>
                    )}
                  </motion.button>
                </form>
                </motion.div>
              )}

              {/* QR Display Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {user?.has_created_qr && !user?.is_admin ? 'QR Kodunuz' : 'QR Kod'}
                </h2>
                
                {qrData ? (
                  <div className="text-center space-y-6">
                    {/* QR Code Image */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-xl shadow-sm" style={{border: '1px solid #BEB5A9'}}>
                        <img
                          src={qrData.qrCodeUrl}
                          alt="QR Code"
                          className="w-64 h-64"
                          onError={(e) => {
                            console.error('QR Image Error:', e);
                            console.error('QR Code URL:', qrData.qrCodeUrl);
                          }}
                        />
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">{qrData.eventName}</h3>
                      {qrData.eventDate && (
                        <p className="text-gray-600 flex items-center justify-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(qrData.eventDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                      {qrData.customMessage && (
                        <p className="text-gray-600 text-sm italic">
                          "{qrData.customMessage}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDownload}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Sadece QR İndir
                      </button>
                      <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="btn-primary flex items-center justify-center"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Şablonlu İndir
                      </button>
                      <button
                        onClick={handleCopyUrl}
                        className="btn-outline flex items-center justify-center"
                      >
                        {copied ? (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copied ? 'Kopyalandı!' : 'URL Kopyala'}
                      </button>
                      <button
                        onClick={() => navigate(`/gallery?qr=${qrData.qrId}&eventName=${encodeURIComponent(qrData.eventName)}`)}
                        className="btn-outline flex items-center justify-center"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Galeriyi Görüntüle
                      </button>
                    </div>

                    {/* Template Selection */}
                    {showTemplates && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          Şablon Seçin
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {templates.map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedTemplate?.id === template.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <div className="h-32 rounded-lg mb-3 overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img
                                  src={template.image}
                                  alt={template.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-full items-center justify-center text-gray-500">
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">🖼️</div>
                                    <div className="text-sm">Şablon Yükleniyor...</div>
                                  </div>
                                </div>
                              </div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </motion.div>
                          ))}
                        </div>
                        {selectedTemplate && (
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={() => handleDownloadWithTemplate(selectedTemplate)}
                              className="btn-primary flex items-center"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {selectedTemplate.name} ile İndir
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}>
                      <QrCode className="h-16 w-16" style={{color: '#6E473B'}} />
                    </div>
                    <p className="text-gray-600">
                      {user?.has_created_qr && !user?.is_admin 
                        ? 'QR kodunuz yükleniyor...' 
                        : 'QR kod oluşturmak için formu doldurun ve "QR Kod Oluştur" butonuna tıklayın.'
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QRGenerator;