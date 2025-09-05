import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { 
  Camera, 
  Video, 
  Upload, 
  X, 
  Heart, 
  User, 
  MessageCircle,
  CheckCircle,
  Mic,
  MicOff,
  Play,
  Pause,
  Square
} from 'lucide-react';
import axios from 'axios';

const UploadPage = () => {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrValid, setQrValid] = useState(false);
  const [error, setError] = useState(null);
  
  // Upload type selection
  const [uploadType, setUploadType] = useState(null); // null = selection screen, photo, video, message, audio
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const qrId = searchParams.get('qr');
  const eventName = searchParams.get('eventName');
  
  const [formData, setFormData] = useState({
    guestName: '',
    message: ''
  });
  
  const [eventData, setEventData] = useState({
    name: eventName || 'Etkinlik',
    date: '',
    message: ''
  });

  // QR ID kontrolü
  useEffect(() => {
    const validateQR = async () => {
      if (!qrId) {
        setError('QR kod bulunamadı!');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/qr/validate/${qrId}`);
        if (response.data.success) {
          setEventData(response.data.eventData);
          setQrValid(true);
        } else {
          setError('Geçersiz QR kod!');
        }
      } catch (error) {
        console.error('QR validation error:', error);
        setError('QR kod doğrulanamadı!');
      } finally {
        setLoading(false);
      }
    };

    validateQR();
  }, [qrId]);

  // QR ID kontrolü - daha sıkı
  React.useEffect(() => {
    // QR ID yoksa veya boşsa ana sayfaya yönlendir
    if (!qrId || qrId.trim() === '') {
      console.log('❌ QR ID bulunamadı, ana sayfaya yönlendiriliyor...');
      window.location.replace('/');
      return;
    }
    
    // QR ID formatını kontrol et (en az 10 karakter olmalı)
    if (qrId.length < 10) {
      console.log('❌ Geçersiz QR ID formatı, ana sayfaya yönlendiriliyor...');
      window.location.replace('/');
      return;
    }
    
    console.log('✅ QR ID doğrulandı:', qrId);
  }, [qrId]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} dosya seçildi!`);
  }, [uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: uploadType === 'photo' ? {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    } : uploadType === 'video' ? {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    } : {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    },
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return newFiles;
    });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Mikrofon erişimi reddedildi!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
  };

  const handleTypeSelection = (type) => {
    setUploadType(type);
    setShowUploadForm(true);
  };

  const goBackToSelection = () => {
    setUploadType(null);
    setShowUploadForm(false);
    // Reset form data
    setFiles([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setFormData({
      guestName: '',
      message: ''
    });
  };

  const handleUpload = async () => {
    // Validation based on upload type
    if (uploadType === 'photo' || uploadType === 'video') {
      if (files.length === 0) {
        toast.error('Lütfen en az bir dosya seçin!');
        return;
      }
    } else if (uploadType === 'audio') {
      if (!audioBlob) {
        toast.error('Lütfen ses kaydı yapın!');
        return;
      }
    } else if (uploadType === 'message') {
      if (!formData.message.trim()) {
        toast.error('Lütfen mesajınızı yazın!');
        return;
      }
    }

    if (!formData.guestName.trim()) {
      toast.error('Lütfen adınızı girin!');
      return;
    }

    // Form verilerini kontrol et
    console.log('Form data:', formData);
    console.log('Files:', files);

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('uploaderName', formData.guestName);
      formDataToSend.append('eventName', eventData.name);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('qrId', qrId);
      formDataToSend.append('uploadType', uploadType);

      if (uploadType === 'photo' || uploadType === 'video') {
        if (files.length === 1) {
          formDataToSend.append('file', files[0].file);
        } else {
          files.forEach((fileObj, index) => {
            formDataToSend.append('files', fileObj.file);
          });
        }
      } else if (uploadType === 'audio') {
        formDataToSend.append('file', audioBlob, 'audio.webm');
      }

<<<<<<< HEAD
      // Endpoint seçimi
      let endpoint;
      let requestConfig = {
=======
      // FormData içeriğini logla
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      if (files.length === 1) {
        formDataToSend.append('file', files[0].file);
      } else {
        files.forEach((fileObj, index) => {
          formDataToSend.append('files', fileObj.file);
        });
      }

      const endpoint = files.length === 1 ? '/api/upload/single' : '/api/upload/multiple';
      
      const response = await axios.post(endpoint, formDataToSend, {
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      if (uploadType === 'message') {
        endpoint = '/api/upload/message';
        // Mesaj için JSON gönder
        requestConfig = {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            qrId: qrId,
            uploaderName: formData.guestName,
            eventName: eventData.name,
            message: formData.message
          }
        };
      } else {
        endpoint = files.length === 1 ? '/api/upload/single' : '/api/upload/multiple';
        requestConfig.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        };
      }
      
      const response = await axios.post(endpoint, 
        uploadType === 'message' ? requestConfig.data : formDataToSend, 
        requestConfig
      );

      if (response.data.success) {
        const successMessage = uploadType === 'message' ? 'Mesaj başarıyla gönderildi!' :
                              uploadType === 'audio' ? 'Ses kaydı başarıyla yüklendi!' :
                              'Dosyalar başarıyla yüklendi!';
        toast.success(successMessage);
        
        // Form temizleme
        setFiles([]);
        setAudioBlob(null);
        setAudioUrl(null);
        setIsRecording(false);
        setFormData({ guestName: '', message: '' });
      } else {
        toast.error(response.data.message || 'Yükleme başarısız!');
      }
    } catch (error) {
<<<<<<< HEAD
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 413) {
        toast.error('Dosya boyutu çok büyük! Maksimum 1GB yükleyebilirsiniz.');
      } else if (error.response?.status === 415) {
        toast.error('Desteklenmeyen dosya formatı! Sadece resim, video ve ses dosyaları yüklenebilir.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        toast.error('İnternet bağlantınızı kontrol edin!');
      } else if (error.message.includes('timeout')) {
        toast.error('Yükleme zaman aşımına uğradı! Lütfen tekrar deneyin.');
      } else {
        toast.error('Dosya yüklenirken bir hata oluştu! Lütfen tekrar deneyin.');
      }
=======
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Dosya yüklenirken hata oluştu!';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Hata detaylarını console'da göster
      if (error.response?.data?.details) {
        console.error('Server error details:', error.response.data.details);
      }
      
      toast.error(errorMessage);
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#6E473B'}}></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}>
            <X className="h-8 w-8" style={{color: '#6E473B'}} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>Hata</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }

  // QR not valid
  if (!qrValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}>
            <X className="h-8 w-8" style={{color: '#6E473B'}} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>Geçersiz QR Kod</h2>
          <p className="text-gray-600 mb-6">Bu QR kod geçersiz veya süresi dolmuş.</p>
          <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }

  // QR ID yoksa veya geçersizse erişim engellendi sayfası göster
  if (!qrId || qrId.trim() === '' || qrId.length < 10) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Engellendi</h2>
          <p className="text-gray-600 mb-6">
            Bu sayfaya sadece QR kodundan erişebilirsiniz. Geçersiz veya eksik QR kod tespit edildi.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2] via-[#BEB5A9] to-[#A78D78]"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(110, 71, 59, 0.08)'}}></div>
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(167, 141, 120, 0.06)', animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl animate-float" style={{backgroundColor: 'rgba(190, 181, 169, 0.05)', animationDelay: '4s'}}></div>
      </div>
=======
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hatıra Köşesi
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {eventId ? (
              <>
                <span className="font-semibold text-primary-600">{formData.eventName}</span> etkinliği için 
                fotoğraf ve videolarınızı yükleyin. Hatıralarınız güvenle saklanacak.
              </>
            ) : (
              'Etkinliğiniz için fotoğraf ve videolarınızı yükleyin.'
            )}
          </p>
          {qrId && (
            <p className="text-lg text-gray-500 mt-2">
              Etkinlik: <span className="font-semibold text-primary-600">{formData.eventName}</span>
            </p>
          )}
        </motion.div>
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 mr-3" style={{color: '#6E473B'}} />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Hatıra Köşesi
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold" style={{color: '#291C0E'}}>{eventData.name}</span> etkinliği için 
              fotoğraf ve videolarınızı yükleyin. Hatıralarınız güvenle saklanacak.
            </p>
          </motion.div>

          {/* Type Selection Screen */}
          {!showUploadForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ne Paylaşmak İstiyorsunuz?</h2>
                <p className="text-gray-600">Aşağıdaki seçeneklerden birini seçerek hatıranızı paylaşın</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  { 
                    type: 'photo', 
                    icon: Camera, 
                    label: 'Fotoğraf', 
                    description: 'Anılarınızı fotoğraflarla paylaşın',
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100'
                  },
                  { 
                    type: 'video', 
                    icon: Video, 
                    label: 'Video', 
                    description: 'Hareketli anılarınızı kaydedin',
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-purple-50 to-purple-100'
                  },
                  { 
                    type: 'message', 
                    icon: MessageCircle, 
                    label: 'Mesaj', 
                    description: 'Düşüncelerinizi yazıyla ifade edin',
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100'
                  },
                  { 
                    type: 'audio', 
                    icon: Mic, 
                    label: 'Ses Kaydı', 
                    description: 'Sesinizle hatıra bırakın',
                    color: 'from-orange-500 to-orange-600',
                    bgColor: 'from-orange-50 to-orange-100'
                  }
                ].map(({ type, icon: Icon, label, description, color, bgColor }) => (
                  <motion.button
                    key={type}
                    onClick={() => handleTypeSelection(type)}
                    className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                      `bg-gradient-to-br ${bgColor} border-gray-200 hover:border-transparent`
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{label}</h3>
                        <p className="text-gray-600 text-sm">{description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upload Form - Only show when type is selected */}
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={goBackToSelection}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Seçim Ekranına Dön
                </button>
              </div>

              {/* Upload Type Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {uploadType === 'photo' && <Camera className="h-8 w-8 text-blue-500" />}
                  {uploadType === 'video' && <Video className="h-8 w-8 text-purple-500" />}
                  {uploadType === 'message' && <MessageCircle className="h-8 w-8 text-green-500" />}
                  {uploadType === 'audio' && <Mic className="h-8 w-8 text-orange-500" />}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {uploadType === 'photo' && 'Fotoğraf Yükle'}
                    {uploadType === 'video' && 'Video Yükle'}
                    {uploadType === 'message' && 'Mesaj Yaz'}
                    {uploadType === 'audio' && 'Ses Kaydı Yap'}
                  </h2>
                </div>
                <p className="text-gray-600">
                  {uploadType === 'photo' && 'Anılarınızı fotoğraflarla paylaşın'}
                  {uploadType === 'video' && 'Hareketli anılarınızı kaydedin'}
                  {uploadType === 'message' && 'Düşüncelerinizi yazıyla ifade edin'}
                  {uploadType === 'audio' && 'Sesinizle hatıra bırakın'}
                </p>
              </div>
            </motion.div>
          )}

          {showUploadForm && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Zone */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                {/* Photo/Video Upload */}
                {(uploadType === 'photo' || uploadType === 'video') && (
                  <div
                    {...getRootProps()}
                    className={`upload-zone ${isDragActive ? 'active' : ''} ${
                      uploading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {isDragActive ? (
                          <Upload className="h-16 w-16 animate-bounce-gentle" style={{color: '#6E473B'}} />
                        ) : uploadType === 'photo' ? (
                          <Camera className="h-16 w-16 text-gray-400" />
                        ) : (
                          <Video className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          {isDragActive ? 'Dosyaları bırakın' : 
                           uploadType === 'photo' ? 'Fotoğraflarınızı yükleyin' : 'Videolarınızı yükleyin'}
                        </p>
                        <p className="text-gray-600">
                          Dosyaları buraya sürükleyin veya tıklayarak seçin
                        </p>
                      </div>
<<<<<<< HEAD
                    </div>
=======
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Bilgilerinizi Girin
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Adınız *
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  placeholder="Adınızı girin"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="inline h-4 w-4 mr-1" />
                  Mesajınız (İsteğe bağlı)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Etkinlik hakkında mesajınız..."
                  rows={4}
                  className="input-field resize-none"
                  disabled={uploading}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  uploading || files.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Yükleniyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Dosyaları Yükle
>>>>>>> 4caf97fe3511584431fbcc49372ab192631e0ab9
                  </div>
                )}

                {/* Message Input */}
                {uploadType === 'message' && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageCircle className="h-8 w-8 text-green-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Mesajınızı Yazın</h3>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Etkinlik hakkında düşüncelerinizi, tebriklerinizi veya hatıralarınızı paylaşın..."
                        className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Audio Recording */}
                {uploadType === 'audio' && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Mic className="h-8 w-8 text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Ses Kaydı</h3>
                      </div>
                      
                      {!audioBlob ? (
                        <div className="text-center space-y-4">
                          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                            isRecording ? 'bg-red-500 animate-pulse' : 'bg-orange-100'
                          }`}>
                            {isRecording ? (
                              <Square className="h-12 w-12 text-white" />
                            ) : (
                              <Mic className="h-12 w-12 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              {isRecording ? 'Kayıt yapılıyor...' : 'Ses kaydına başlayın'}
                            </p>
                            <p className="text-gray-600">
                              {isRecording ? 'Kaydı durdurmak için butona tıklayın' : 'Mikrofonunuza konuşun'}
                            </p>
                          </div>
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                              isRecording 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                          >
                            {isRecording ? 'Kaydı Durdur' : 'Kayda Başla'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="bg-gray-50 rounded-xl p-6">
                            <Play className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Ses Kaydı Hazır</p>
                            <p className="text-gray-600 mb-4">Kaydınızı dinlemek için play butonuna tıklayın</p>
                            <audio controls className="w-full">
                              <source src={audioUrl} type="audio/webm" />
                            </audio>
                          </div>
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={deleteAudio}
                              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-300"
                            >
                              Sil
                            </button>
                            <button
                              onClick={startRecording}
                              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors duration-300"
                            >
                              Yeniden Kaydet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Seçilen Dosyalar ({files.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {files.map((fileObj) => (
                        <div key={fileObj.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {fileObj.type === 'image' ? (
                              <img
                                src={fileObj.preview}
                                alt={fileObj.file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {fileObj.file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                          backgroundColor: '#6E473B'
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Yükleniyor... {uploadProgress}%
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

              {/* Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="card"
                >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Bilgileriniz
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                      Adınız *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5" style={{color: '#6E473B'}} />
                      </div>
                      <input
                        type="text"
                        id="guestName"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        placeholder="Adınızı girin"
                        className="input-field pl-10"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  {/* Mesaj alanı sadece fotoğraf, video ve ses kaydı için göster */}
                  {uploadType !== 'message' && (
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Mesajınız
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <MessageCircle className="h-5 w-5" style={{color: '#6E473B'}} />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Etkinlik hakkında mesajınız..."
                          rows={4}
                          className="input-field resize-none pl-10"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={uploading || (uploadType === 'photo' || uploadType === 'video' ? files.length === 0 : false)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      uploading || (uploadType === 'photo' || uploadType === 'video' ? files.length === 0 : false)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Yükleniyor...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Upload className="mr-2 h-5 w-5" />
                        {uploadType === 'message' ? 'Mesajı Gönder' : 
                         uploadType === 'audio' ? 'Ses Kaydını Yükle' : 
                         'Dosyaları Yükle'}
                      </div>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" style={{color: '#6E473B'}} />
                    <div className="text-sm" style={{color: '#374151'}}>
                      <p className="font-medium mb-1">Güvenli Yükleme</p>
                      <p>Dosyalarınız Google Drive'da güvenle saklanır ve sadece siz erişebilirsiniz.</p>
                    </div>
                  </div>
                </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;