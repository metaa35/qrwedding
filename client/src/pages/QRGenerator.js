import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  QrCode, 
  Download, 
  Copy, 
  Heart, 
  Calendar, 
  MessageCircle,
  Share2,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    customMessage: '',
    url: ''
  });

  const [qrData, setQrData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateQR = async () => {
    if (!formData.eventName.trim()) {
      toast.error('Lütfen etkinlik adını girin!');
      return;
    }

    // URL oluştur
    const baseUrl = window.location.origin;
    const uploadUrl = `${baseUrl}/upload?eventName=${encodeURIComponent(formData.eventName)}`;

    setGenerating(true);

    try {
      const response = await axios.post('/api/qr/generate', {
        url: uploadUrl,
        eventName: formData.eventName
      });
      
      if (response.data.success) {
        setQrData(response.data);
        toast.success('QR kod başarıyla oluşturuldu!');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('QR kod oluşturulurken hata oluştu!');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `${formData.eventName.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR kod indirildi!');
  };

  const copyQRUrl = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData.url);
      setCopied(true);
      toast.success('QR kod URL\'i kopyalandı!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('URL kopyalanamadı!');
    }
  };

  const shareQR = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formData.eventName} - QR Kod`,
          text: 'Bu QR kodu okutarak fotoğraf yükleyebilirsiniz!',
          url: qrData.url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyQRUrl();
    }
  };

  const presetEvents = [
    { name: 'Düğün', message: 'Anılarımızı paylaşın!' },
    { name: 'Nişan', message: 'Nişan anılarımızı toplayalım!' },
    { name: 'Sünnet', message: 'Sünnet töreni anıları!' },
    { name: 'Doğum Günü', message: 'Doğum günü kutlaması!' },
    { name: 'Yılbaşı', message: 'Yılbaşı kutlaması!' }
  ];

  const selectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      eventName: preset.name,
      customMessage: preset.message
    }));
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              QR Kod Oluşturucu
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Etkinliğiniz için özel QR kod oluşturun. Misafirleriniz bu kodu okutarak 
            fotoğraf ve videolarını kolayca yükleyebilir.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Etkinlik Bilgileri
              </h3>

              {/* Preset Events */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hızlı Seçim
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetEvents.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => selectPreset(preset)}
                      className="p-3 text-sm border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left"
                    >
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-xs text-gray-500">{preset.message}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="inline h-4 w-4 mr-1" />
                    Etkinlik Adı *
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="Örn: Ahmet & Ayşe Düğünü"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Etkinlik Tarihi
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageCircle className="inline h-4 w-4 mr-1" />
                    Özel Mesaj
                  </label>
                  <textarea
                    name="customMessage"
                    value={formData.customMessage}
                    onChange={handleInputChange}
                    placeholder="Misafirlerinize özel mesajınız..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <button
                  onClick={generateQR}
                  disabled={generating || !formData.eventName.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    generating || !formData.eventName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {generating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      QR Kod Oluşturuluyor...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <QrCode className="mr-2 h-5 w-5" />
                      QR Kod Oluştur
                    </div>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Nasıl Kullanılır?</p>
                    <p>QR kodu yazdırın veya dijital olarak paylaşın. Misafirleriniz kodu okutarak fotoğraf yükleme sayfasına ulaşabilir.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center justify-center"
          >
            {qrData ? (
              <div className="card text-center max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  QR Kodunuz Hazır!
                </h3>
                
                                 <div className="mb-6">
                   <img
                     src={qrData.qrCode}
                     alt="QR Code"
                     className="w-64 h-64 mx-auto border-4 border-gray-100 rounded-lg"
                   />
                 </div>

                 <div className="space-y-4">
                   <div className="text-left">
                     <h4 className="font-semibold text-gray-900 mb-2">Etkinlik Bilgileri:</h4>
                     <div className="space-y-1 text-sm text-gray-600">
                       <p><strong>Ad:</strong> {qrData.eventName}</p>
                       <p><strong>URL:</strong> {qrData.url}</p>
                     </div>
                   </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={downloadQR}
                      className="btn-secondary flex-1 flex items-center justify-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      İndir
                    </button>
                    
                    <button
                      onClick={copyQRUrl}
                      className={`btn-outline flex-1 flex items-center justify-center ${
                        copied ? 'bg-green-600 text-white border-green-600' : ''
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          URL Kopyala
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={shareQR}
                    className="w-full btn-outline flex items-center justify-center"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Paylaş
                  </button>
                </div>

                                 <div className="mt-6 space-y-3">
                   <div className="p-3 bg-blue-50 rounded-lg">
                     <p className="text-xs text-blue-800">
                       <strong>QR Kod URL:</strong><br />
                       <span className="break-all">{qrData.url}</span>
                     </p>
                   </div>
                   
                   <div className="p-3 bg-green-50 rounded-lg">
                     <p className="text-xs text-green-800">
                       <strong>Galeri URL:</strong><br />
                       <span className="break-all">{qrData.url.replace('/upload', '/gallery')}</span>
                     </p>
                     <button
                       onClick={() => window.open(qrData.url.replace('/upload', '/gallery'), '_blank')}
                       className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                     >
                       Galeriyi Aç
                     </button>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="card text-center max-w-md w-full">
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <QrCode className="h-32 w-32 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  QR Kod Bekliyor
                </h3>
                <p className="text-gray-600">
                  Etkinlik bilgilerinizi girip QR kod oluşturun
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator; 