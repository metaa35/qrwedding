import React, { useState, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const UploadPage = () => {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    guestName: '',
    eventName: searchParams.get('eventName') || 'Düğün',
    message: ''
  });

  const eventId = searchParams.get('eventId');

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} dosya seçildi!`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Lütfen en az bir dosya seçin!');
      return;
    }

    if (!formData.guestName.trim()) {
      toast.error('Lütfen adınızı girin!');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('uploaderName', formData.guestName);
      formDataToSend.append('eventName', formData.eventName);
      formDataToSend.append('message', formData.message);

      if (files.length === 1) {
        formDataToSend.append('file', files[0].file);
      } else {
        files.forEach((fileObj, index) => {
          formDataToSend.append('files', fileObj.file);
        });
      }

      const endpoint = files.length === 1 ? '/api/upload/single' : '/api/upload/multiple';
      
      const response = await axios.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Formu temizle
        setFiles([]);
        setFormData({
          guestName: '',
          eventName: searchParams.get('eventName') || 'Düğün',
          message: ''
        });
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Dosya yüklenirken hata oluştu!';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
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
              Anılarınızı Paylaşın
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {eventId ? (
              <>
                <span className="font-semibold text-primary-600">{formData.eventName}</span> etkinliği için 
                fotoğraf ve videolarınızı yükleyin. Anılarınız güvenle saklanacak.
              </>
            ) : (
              'Düğün veya nişan etkinliğiniz için fotoğraf ve videolarınızı yükleyin.'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Zone */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
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
                      <Upload className="h-16 w-16 text-primary-600 animate-bounce-gentle" />
                    ) : (
                      <Camera className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {isDragActive ? 'Dosyaları buraya bırakın' : 'Fotoğraf veya Video Yükleyin'}
                    </p>
                    <p className="text-gray-600">
                      Dosyaları sürükleyip bırakın veya tıklayarak seçin
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Maksimum dosya boyutu: 100MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Yükleniyor...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                      </div>
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
                  <Heart className="inline h-4 w-4 mr-1" />
                  Etkinlik Adı
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Etkinlik adı"
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
                  </div>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Güvenli Yükleme</p>
                  <p>Dosyalarınız Google Drive'da güvenle saklanır ve sadece siz erişebilirsiniz.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage; 