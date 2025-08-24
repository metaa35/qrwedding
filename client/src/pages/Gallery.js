import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Heart, 
  Image, 
  Download, 
  Share2, 
  Search,
  Calendar,
  User,
  MessageCircle,
  RefreshCw,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import axios from 'axios';

const Gallery = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    filterFiles();
  }, [filterFiles]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      
      // URL'den QR ID ve event name'i al
      const urlParams = new URLSearchParams(window.location.search);
      const qrId = urlParams.get('qr');
      const currentEventName = urlParams.get('eventName') || urlParams.get('event');
      
      if (!currentEventName) {
        toast.error('Event adı belirtilmedi!');
        setFiles([]);
        setEventName('');
        setLoading(false);
        return;
      }
      
      setEventName(currentEventName);
      
      // QR ID varsa, sadece o QR koduna ait dosyaları getir
      // QR ID yoksa, event name'e göre getir (geriye uyumluluk)
      const url = qrId 
        ? `/api/upload/files?qr=${qrId}&eventName=${encodeURIComponent(currentEventName)}`
        : `/api/upload/files?eventName=${encodeURIComponent(currentEventName)}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        // Tüm dosyaları göster (Google Drive'dan gelen)
        setFiles(response.data.files);
        console.log(`📁 ${eventName} event'i için ${response.data.files.length} dosya bulundu`);
        console.log('📄 Gelen dosya verileri:', response.data.files);
      }
    } catch (error) {
      console.error('Fetch files error:', error);
      toast.error('Dosyalar yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterFiles = useCallback(() => {
    let filtered = files;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file => 
        (file.file_name || file.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.uploader_name || file.uploaderName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.event_name || file.eventName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(file => {
        const mimeType = file.mime_type || file.mimeType;
        if (selectedFilter === 'images') {
          return mimeType?.startsWith('image/');
        } else if (selectedFilter === 'videos') {
          return mimeType?.startsWith('video/');
        }
        return true;
      });
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedFilter]);

  const openModal = (file) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const downloadFile = async (file) => {
    try {
      // Drive dosyaları için doğrudan Google Drive linki kullan
      const fileId = file.file_id || file.id;
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      // Yeni sekmede aç
      window.open(downloadUrl, '_blank');
      
      toast.success('İndirme başlatıldı!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Dosya indirilemedi!');
    }
  };

  const shareFile = async (file) => {
    if (navigator.share) {
      try {
        const fileId = file.file_id || file.id;
        await navigator.share({
          title: file.file_name || file.name,
          text: `${file.uploader_name || file.uploaderName || 'Misafir'} tarafından yüklendi`,
          url: file.web_view_link || file.webViewLink || `https://drive.google.com/file/d/${fileId}/view`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy link
      try {
        const fileId = file.file_id || file.id;
        const shareUrl = file.web_view_link || file.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Dosya linki kopyalandı!');
      } catch (error) {
        toast.error('Link kopyalanamadı!');
      }
    }
  };

  const openInDrive = (file) => {
    const fileId = file.file_id || file.id;
    const driveUrl = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(driveUrl, '_blank');
  };

  const downloadAllFiles = async () => {
    if (filteredFiles.length === 0) {
      toast.error('İndirilecek dosya bulunamadı!');
      return;
    }

    if (!window.confirm(`${filteredFiles.length} dosyayı ZIP formatında toplu olarak indirmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      // URL'den QR ID ve event name'i al
      const urlParams = new URLSearchParams(window.location.search);
      const qrId = urlParams.get('qr');
      const currentEventName = urlParams.get('eventName') || urlParams.get('event');

      // ZIP indirme URL'si oluştur
      let downloadUrl = '/api/upload/download-all?';
      if (qrId) {
        downloadUrl += `qr=${encodeURIComponent(qrId)}`;
      } else if (currentEventName) {
        downloadUrl += `eventName=${encodeURIComponent(currentEventName)}`;
      }

      // ZIP dosyasını doğrudan indir
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error('ZIP dosyası indirilemedi');
      }

      // Dosya adını al
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'dosyalar.zip';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          fileName = match[1];
        }
      }

      // Blob oluştur ve indir
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('ZIP dosyası başarıyla indirildi!');
    } catch (error) {
      console.error('ZIP indirme hatası:', error);
      toast.error('ZIP dosyası indirilemedi!');
    }
  };

  const shareAllFiles = async () => {
    if (!eventName) {
      toast.error('Event adı belirtilmedi!');
      return;
    }

    if (!window.confirm(`${eventName} etkinliğindeki tüm dosyaları "Bağlantıya sahip olan herkes - görüntüleyen" olarak paylaşmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await axios.post('/api/upload/share-all', { eventName });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchFiles(); // Dosyaları yenile
      }
    } catch (error) {
      console.error('Share all error:', error);
      toast.error('Dosyalar paylaşılamadı!');
    }
  };

  const deleteFile = async (file) => {
    if (!window.confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const fileId = file.file_id || file.id;
      await axios.delete(`/api/upload/files/${fileId}`);
      setFiles(prev => prev.filter(f => (f.file_id || f.id) !== fileId));
      toast.success('Dosya silindi!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Dosya silinemedi!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
              <span className="text-lg text-gray-600">Galeri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Event adı yoksa uyarı göster
  if (!eventName) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
                             <h3 className="text-lg font-semibold text-red-800 mb-2">Event Adı Gerekli</h3>
               <p className="text-red-600 mb-4">
                 Galeri sayfasını görüntülemek için URL'de event adı belirtilmelidir.
               </p>
               <p className="text-sm text-red-500">
                 Örnekler:<br />
                 /gallery?eventName=Mustafa-Beren<br />
                 /gallery?event=Mustafa-Beren
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
              {eventName ? `${eventName} Hatıra Köşesi` : 'Hatıra Köşesi'}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {eventName 
              ? `${eventName} etkinliğinde misafirlerinizin paylaştığı tüm fotoğraf ve videoları görüntüleyin.`
              : 'Misafirlerinizin paylaştığı tüm fotoğraf ve videoları görüntüleyin.'
            }
            <br />
            <span className="font-semibold text-primary-600">Toplam {files.length} dosya bulundu.</span>
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dosya, misafir veya etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

                         {/* Filter */}
             <div className="flex gap-2">
               <select
                 value={selectedFilter}
                 onChange={(e) => setSelectedFilter(e.target.value)}
                 className="input-field"
               >
                 <option value="all">Tümü</option>
                 <option value="images">Sadece Resimler</option>
                 <option value="videos">Sadece Videolar</option>
               </select>
               
               <button
                 onClick={fetchFiles}
                 className="btn-outline px-4"
                 title="Yenile"
               >
                 <RefreshCw className="h-5 w-5" />
               </button>
               
               
                
                                 <button
                   onClick={downloadAllFiles}
                   className="btn-outline px-4"
                   title="Tüm Dosyaları ZIP Olarak İndir"
                 >
                   <Download className="h-5 w-5" />
                 </button>
                
                <button
                  onClick={shareAllFiles}
                  className="btn-primary px-4"
                  title="Tüm Dosyaları Paylaş"
                >
                  <Share2 className="h-5 w-5" />
                </button>
             </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedFilter !== 'all' ? 'Sonuç bulunamadı' : 'Henüz dosya yok'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin.'
                  : 'Misafirleriniz fotoğraf yüklediğinde burada görünecek.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <AnimatePresence>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                         className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100"
                  >
                    {/* File Preview */}
                                         <div 
                       className="aspect-[4/3] cursor-pointer relative"
                       onClick={() => openModal(file)}
                     >
                                                                                                                                                {(file.mime_type || file.mimeType)?.startsWith('image/') ? (
                           <img
                             src={file.web_view_link || `https://drive.google.com/uc?export=view&id=${file.file_id || file.id}`}
                             alt={file.file_name || file.name}
                             className="w-full h-full object-contain"
                             onError={(e) => {
                               // Fallback to thumbnail
                               e.target.src = `https://drive.google.com/thumbnail?id=${file.file_id || file.id}&sz=w400`;
                             }}
                           />
                         ) : (file.mime_type || file.mimeType)?.startsWith('video/') ? (
                          <div className="w-full h-full bg-gray-100 relative">
                                                                                                                                                                <iframe
                              src={`https://drive.google.com/file/d/${file.file_id || file.id}/preview`}
                              className="w-full h-full object-contain"
                              frameBorder="0"
                              allowFullScreen
                              title={file.file_name || file.name}
                            onError={(e) => {
                             // Video yüklenemezse fallback göster
                             e.target.style.display = 'none';
                             e.target.parentElement.innerHTML = `
                               <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                 <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                 </svg>
                               </div>
                             `;
                           }}
                         />
                          {/* Video play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-2">
                              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                                         {/* File Info - Overlay on Image */}
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                                                                        {/* Event Info */}
                         {(file.event_name || file.eventName) && (
                           <div className="flex items-center mb-1">
                             <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-2">
                               <User className="h-3 w-3 text-white" />
                             </div>
                             <div>
                               <p className="font-semibold text-xs text-white">{file.event_name || file.eventName}</p>
                             </div>
                           </div>
                         )}
                        
                         {/* Uploader Name */}
                         <div className="mb-2">
                           <p className="text-xs text-white/90">Yükleyen: {file.uploader_name || file.uploaderName || 'Anonim'}</p>
                         </div>
                        
                                                 {/* Message */}
                         {file.message && (
                           <div className="mb-2">
                             <p className="text-xs text-white/90 italic">"{file.message}"</p>
                           </div>
                         )}
                        
                         {/* Date */}
                         {(file.uploaded_at || file.createdTime) && (
                           <p className="text-xs text-white/70 mb-2 flex items-center">
                             <Calendar className="h-3 w-3 mr-1" />
                             {formatDate(file.uploaded_at || file.createdTime)}
                           </p>
                         )}
                     </div>

                     {/* Actions - Bottom */}
                     <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <button
                         onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                         className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs py-1 px-2 rounded-lg hover:bg-white transition-colors"
                         title="İndir"
                       >
                         <Download className="inline h-3 w-3" />
                       </button>
                                               <button
                          onClick={(e) => { e.stopPropagation(); shareFile(file); }}
                          className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs py-1 px-2 rounded-lg hover:bg-white transition-colors"
                          title="Paylaş"
                        >
                          <Share2 className="inline h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openInDrive(file); }}
                          className="bg-blue-500/90 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-lg hover:bg-blue-500 transition-colors"
                          title="Drive'da Aç"
                        >
                          <svg className="inline h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </button>
                                               <button
                          onClick={(e) => { e.stopPropagation(); deleteFile(file); }}
                          className="bg-red-500/90 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-lg hover:bg-red-500 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="inline h-3 w-3" />
                        </button>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && selectedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                                 <div className="p-6">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                                               <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedFile.file_name || selectedFile.name}
                        </h3>
                        {(selectedFile.event_name || selectedFile.eventName) && (
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg text-gray-900">{selectedFile.event_name || selectedFile.eventName}</p>
                            </div>
                          </div>
                        )}
                     </div>
                     <button
                       onClick={closeModal}
                       className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                     >
                       <X className="h-6 w-6" />
                     </button>
                   </div>

                                                         <div className="mb-4">
                      {(selectedFile.mime_type || selectedFile.mimeType)?.startsWith('image/') ? (
                        <img
                          src={selectedFile.web_view_link || `https://drive.google.com/uc?export=view&id=${selectedFile.file_id || selectedFile.id}`}
                          alt={selectedFile.file_name || selectedFile.name}
                          className="w-full max-h-96 object-contain rounded-lg"
                          onError={(e) => {
                            // Fallback to thumbnail
                            e.target.src = `https://drive.google.com/thumbnail?id=${selectedFile.file_id || selectedFile.id}&sz=w800`;
                          }}
                        />
                      ) : (
                        <iframe
                          src={`https://drive.google.com/file/d/${selectedFile.file_id || selectedFile.id}/preview`}
                          className="w-full max-h-96 object-contain rounded-lg"
                          frameBorder="0"
                          allowFullScreen
                          title={selectedFile.file_name || selectedFile.name}
                        >
                          Tarayıcınız video oynatmayı desteklemiyor.
                        </iframe>
                      )}
                    </div>

                                                         {/* Uploader Name and Message Card */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                      <div className="flex items-start mb-3">
                        <User className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                                                 <div>
                           <p className="font-medium text-gray-900 mb-1">Yükleyen Kişi</p>
                           <p className="text-gray-700">{selectedFile.uploader_name || selectedFile.uploaderName || 'Anonim'}</p>
                         </div>
                      </div>
                      {selectedFile.message && (
                        <div className="flex items-start">
                          <MessageCircle className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Mesaj</p>
                            <p className="text-gray-700 italic">"{selectedFile.message}"</p>
                          </div>
                        </div>
                      )}
                    </div>

                   {/* File Details */}
                   <div className="grid grid-cols-1 gap-4 mb-6">
                                           {(selectedFile.uploaded_at || selectedFile.createdTime) && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Yüklenme Tarihi</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedFile.uploaded_at || selectedFile.createdTime)}</p>
                        </div>
                      )}
                   </div>

                                     <div className="flex gap-3">
                     <button
                       onClick={() => downloadFile(selectedFile)}
                       className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium flex items-center justify-center"
                     >
                       <Download className="mr-2 h-5 w-5" />
                       İndir
                     </button>
                                                                  <button
                         onClick={() => shareFile(selectedFile)}
                         className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 px-6 rounded-lg hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 font-medium flex items-center justify-center"
                       >
                         <Share2 className="mr-2 h-5 w-5" />
                         Paylaş
                       </button>
                       <button
                         onClick={() => openInDrive(selectedFile)}
                         className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center"
                       >
                         <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                         </svg>
                         Drive'da Aç
                       </button>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery; 