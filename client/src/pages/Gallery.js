import React, { useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  Download, 
  Trash2, 
  Eye, 
  Filter,
  Search,
  Calendar,
  User,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Video
} from 'lucide-react';
import axios from 'axios';

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(12);
  const [qrValid, setQrValid] = useState(false);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState({ name: 'Etkinlik' });

  const qrId = searchParams.get('qr');
  
  // Scroll animasyonları için ref'ler
  const headerRef = React.useRef(null);
  const filtersRef = React.useRef(null);
  const galleryRef = React.useRef(null);
  
  // InView hook'ları
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const filtersInView = useInView(filtersRef, { once: true, amount: 0.3 });
  const galleryInView = useInView(galleryRef, { once: true, amount: 0.2 });
  
  // Parallax efektleri
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const floatingY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const floatingY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const floatingY3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  
  const smoothY = useSpring(backgroundY, { stiffness: 100, damping: 30 });
  const smoothFloating1 = useSpring(floatingY1, { stiffness: 50, damping: 25 });
  const smoothFloating2 = useSpring(floatingY2, { stiffness: 50, damping: 25 });
  const smoothFloating3 = useSpring(floatingY3, { stiffness: 50, damping: 25 });

  useEffect(() => {
    console.log('Gallery useEffect - qrId:', qrId);
    console.log('Gallery useEffect - searchParams:', searchParams.toString());
    
    if (qrId) {
      validateQRAndFetchFiles();
    } else {
      console.log('QR ID bulunamadı!');
      setError('QR kod bulunamadı!');
      setLoading(false);
    }
  }, [qrId]);

  const validateQRAndFetchFiles = async () => {
    try {
      console.log('QR validation başlıyor - qrId:', qrId);
      // QR kod doğrulama
      const qrResponse = await axios.get(`/api/qr/validate/${qrId}`);
      console.log('QR validation response:', qrResponse.data);
      
      if (qrResponse.data.success) {
        setEventData(qrResponse.data.eventData);
        setQrValid(true);
        console.log('QR geçerli, dosyalar getiriliyor...');
        // QR kod geçerliyse dosyaları getir
        await fetchFiles();
      } else {
        console.log('QR geçersiz:', qrResponse.data.message);
        setError('Geçersiz QR kod!');
      }
    } catch (error) {
      console.error('QR validation error:', error);
      setError('QR kod doğrulanamadı!');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      console.log('Dosyalar getiriliyor - qrId:', qrId);
      const response = await axios.get(`/api/upload/files?qrId=${qrId}`);
      console.log('Files response:', response.data);
      
      if (response.data.success) {
        // Dosya listesini güvenli hale getir
        const safeFiles = (response.data.files || []).map(file => ({
          id: file.id || '',
          originalName: file.file_name || '',
          type: file.mime_type || '',
          size: file.file_size || 0,
          url: file.web_view_link || '',
          uploaderName: file.uploader_name || '',
          message: file.message || '',
          uploadedAt: file.uploaded_at || ''
        }));
        console.log('Safe files:', safeFiles);
        setFiles(safeFiles);
      } else {
        console.log('Dosyalar yüklenemedi:', response.data.message);
        toast.error('Dosyalar yüklenemedi!');
      }
    } catch (error) {
      console.error('Fetch files error:', error);
      if (error.response?.status === 429) {
        console.log('Rate limit exceeded, retrying later...');
        // Rate limit aşıldıysa 2 saniye sonra tekrar dene
        setTimeout(() => {
          fetchFiles();
        }, 2000);
        return;
      }
      toast.error('Dosyalar yüklenirken bir hata oluştu!');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/upload/files/${fileId}`);
      if (response.data.success) {
        setFiles(files.filter(file => file.id !== fileId));
        toast.success('Dosya silindi!');
        if (selectedFile && selectedFile.id === fileId) {
          setSelectedFile(null);
        }
      } else {
        toast.error('Dosya silinemedi!');
      }
    } catch (error) {
      console.error('Delete file error:', error);
      toast.error('Dosya silinirken bir hata oluştu!');
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dosya indirildi!');
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) {
      toast.info('İndirilecek dosya bulunamadı!');
      return;
    }

    try {
      const response = await axios.get(`/api/upload/download-all?qr=${qrId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventData.name}-galeri.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Tüm dosyalar indiriliyor...');
    } catch (error) {
      console.error('Download all error:', error);
      toast.error('Dosyalar indirilemedi!');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?qr=${qrId}&eventName=${encodeURIComponent(eventData.name)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${eventData.name} Hatıra Köşesi`,
          text: `${eventData.name} etkinliği fotoğrafları`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Galeri linki kopyalandı!');
      } catch (error) {
        console.error('Copy error:', error);
        toast.error('Link kopyalanamadı!');
      }
    }
  };

  const filteredFiles = (files || []).filter(file => {
    if (!file) return false;
    const matchesFilter = filter === 'all' || file.type?.startsWith(filter);
    const matchesSearch = (file.originalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.uploaderName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  const getFileIcon = (type) => {
    if (!type) return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    return '📄';
  };

  // Google Drive URL'ini görsel URL'ine çevir
  const convertGoogleDriveUrl = (url) => {
    if (!url) return url;
    
    // Google Drive file URL'sini kontrol et
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      // Google Drive görsel URL formatı
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    return url;
  };

  // Google Drive URL'ini backend streaming URL'ine çevir
  const convertGoogleDriveVideoUrl = (url, fileId) => {
    if (!url) return url;
    
    // Eğer fileId varsa, backend streaming endpoint'ini kullan
    if (fileId) {
      return `/api/upload/stream/${fileId}`;
    }
    
    // Fallback: Google Drive file URL'sini kontrol et
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const driveFileId = fileIdMatch[1];
      // Google Drive stream URL formatı (video oynatma için)
      return `https://drive.google.com/uc?export=view&id=${driveFileId}`;
    }
    
    return url;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  console.log('Gallery render - loading:', loading, 'error:', error, 'qrValid:', qrValid, 'files:', files.length, 'eventData:', eventData, 'galleryInView:', galleryInView, 'currentFiles:', currentFiles.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#6E473B'}}></div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen relative">
      {/* Background Effects with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2]/50 via-white/30 to-[#BEB5A9]/50"
        style={{ y: smoothY }}
      ></motion.div>
      <div className="absolute top-0 left-0 w-full h-full">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-float" 
          style={{
            backgroundColor: 'rgba(110, 71, 59, 0.08)',
            y: smoothFloating1
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-40 right-32 w-48 h-48 rounded-full blur-3xl animate-float" 
          style={{
            backgroundColor: 'rgba(167, 141, 120, 0.06)', 
            animationDelay: '2s',
            y: smoothFloating2
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl animate-float" 
          style={{
            backgroundColor: 'rgba(190, 181, 169, 0.05)', 
            animationDelay: '4s',
            y: smoothFloating3
          }}
        ></motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <section ref={headerRef} className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
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
                <Heart className="h-8 w-8" style={{color: '#6E473B'}} />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">{eventData?.name || 'Etkinlik'} Hatıra Köşesi</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                {eventData?.name || 'Etkinlik'} etkinliğinde misafirlerinizin paylaştığı tüm fotoğraf ve videoları görüntüleyin.
              </p>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{backgroundColor: '#E1D4C2', color: '#6E473B'}}>
                <Camera className="h-4 w-4 mr-2" />
                Toplam {files.length} dosya bulundu.
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Actions */}
        <section ref={filtersRef} className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="card"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" style={{color: '#6E473B'}} />
                  </div>
                  <input
                    type="text"
                    placeholder="Dosya, misafir veya etkinlik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field pr-8 appearance-none cursor-pointer"
                  >
                    <option value="all">Tümü</option>
                    <option value="images">Fotoğraflar</option>
                    <option value="videos">Videolar</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={fetchFiles}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Yenile"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Tümünü İndir"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Paylaş"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section ref={galleryRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {currentFiles.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                  {currentFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.6 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                        {/* Image/Icon */}
                        {file.type?.startsWith('image/') ? (
                          <img
                            src={convertGoogleDriveUrl(file.url)}
                            alt={file.originalName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              console.log('Image load error:', file.url, 'Converted URL:', convertGoogleDriveUrl(file.url));
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : file.type?.startsWith('video/') ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                            <div className="text-center">
                              <div className="text-6xl opacity-80 mb-2">🎥</div>
                              <div className="text-xs text-purple-600 font-medium">Video</div>
                            </div>
                          </div>
                        ) : file.type?.startsWith('audio/') ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                            <div className="text-center">
                              <div className="text-6xl opacity-80 mb-2">🎵</div>
                              <div className="text-xs text-orange-600 font-medium">Ses</div>
                            </div>
                          </div>
                        ) : file.uploadType === 'message' || file.type === 'text/plain' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 p-4">
                            <div className="text-center">
                              <div className="text-4xl opacity-80 mb-2">💬</div>
                              <div className="text-xs text-green-600 font-medium mb-2">Mesaj</div>
                              {file.message && (
                                <div className="text-xs text-green-700 leading-tight max-h-16 overflow-hidden">
                                  {file.message.length > 50 ? `${file.message.substring(0, 50)}...` : file.message}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center">
                              <div className="text-6xl opacity-60 mb-2">📄</div>
                              <div className="text-xs text-gray-600 font-medium">Dosya</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay with uploader info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            {file.uploaderName && (
                              <div className="text-white">
                                <p className="text-xs opacity-80 mb-1">Yükleyen</p>
                                <p className="text-sm font-semibold">
                                  {file.uploaderName}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Corner accent */}
                        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-white/80 shadow-sm"></div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={galleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex justify-center items-center gap-2 mt-8"
                  >
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          currentPage === index + 1 
                            ? 'text-white' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        style={{
                          backgroundColor: currentPage === index + 1 ? '#6E473B' : 'transparent',
                          border: currentPage === index + 1 ? 'none' : '1px solid #BEB5A9'
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={galleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl flex items-center justify-center bg-gray-100">
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz dosya yok</h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== 'all' 
                    ? 'Arama kriterlerinize uygun dosya bulunamadı.' 
                    : 'Misafirleriniz fotoğraf yüklediğinde burada görünecek.'}
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* File Detail Modal */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 z-10"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Event Name - Above Image */}
                  {eventData?.name && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="text-lg font-semibold text-gray-800">
                          {eventData.name}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* File Preview */}
                  <div className="flex justify-center">
                    {selectedFile.type?.startsWith('image/') ? (
                      <img
                        src={convertGoogleDriveUrl(selectedFile.url)}
                        alt="Yüklenen görsel"
                        className="max-w-full max-h-96 object-contain rounded-lg"
                        onError={(e) => {
                          console.error('Image load error:', selectedFile.url, 'Converted URL:', convertGoogleDriveUrl(selectedFile.url));
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : selectedFile.type?.startsWith('video/') ? (
                      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                        <video
                          src={convertGoogleDriveVideoUrl(selectedFile.url, selectedFile.id)}
                          className="w-full h-96"
                          controls
                          preload="metadata"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('Video load error:', selectedFile.url);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        >
                          Tarayıcınız video oynatmayı desteklemiyor.
                        </video>
                        <div className="hidden w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-6xl mb-4">🎥</div>
                            <div className="text-lg mb-2">Video Yüklenemedi</div>
                            <div className="text-sm text-gray-300">İndirmek için butona tıklayın</div>
                          </div>
                        </div>
                      </div>
                    ) : selectedFile.type?.startsWith('audio/') ? (
                      <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center p-6">
                        <div className="text-center w-full">
                          <div className="text-6xl opacity-80 mb-4">🎵</div>
                          <div className="text-lg text-orange-600 font-medium mb-4">Ses Dosyası</div>
                          <audio controls className="w-full max-w-md mx-auto">
                            <source src={convertGoogleDriveUrl(selectedFile.url)} type={selectedFile.type} />
                            Tarayıcınız ses oynatmayı desteklemiyor.
                          </audio>
                        </div>
                      </div>
                    ) : selectedFile.uploadType === 'message' || selectedFile.type === 'text/plain' ? (
                      <div className="w-full max-w-2xl bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
                        <div className="text-center">
                          <div className="text-6xl opacity-80 mb-4">💬</div>
                          <div className="text-xl text-green-600 font-semibold mb-4">Mesaj</div>
                          {selectedFile.message && (
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                              <div className="text-gray-800 text-left leading-relaxed whitespace-pre-wrap">
                                {selectedFile.message}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-8xl opacity-60 mb-4">📄</div>
                          <div className="text-lg text-gray-600 font-medium">Dosya</div>
                          <div className="text-sm text-gray-500 mt-2">İndirmek için tıklayın</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Uploader Info - Sadece mesaj değilse göster */}
                  {!(selectedFile.uploadType === 'message' || selectedFile.type === 'text/plain') && (
                    <div className="text-center space-y-3">
                      {selectedFile.uploaderName && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                              <p className="text-xs text-gray-500 mb-1">Yükleyen:</p>
                              <p className="text-sm text-gray-700">
                                {selectedFile.uploaderName}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedFile.message && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                              <p className="text-xs text-gray-500 mb-1">Mesaj:</p>
                              <p className="text-sm text-gray-700">
                                {selectedFile.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mesaj için sadece yükleyen bilgisi */}
                  {(selectedFile.uploadType === 'message' || selectedFile.type === 'text/plain') && selectedFile.uploaderName && (
                    <div className="text-center">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-xs text-green-600 mb-1">Mesajı Gönderen</p>
                            <p className="text-sm text-green-700 font-medium">
                              {selectedFile.uploaderName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleDownload(selectedFile)}
                      className="btn-primary flex items-center justify-center flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      İndir
                    </button>
                    <button
                      onClick={() => handleDelete(selectedFile.id)}
                      className="btn-outline flex items-center justify-center flex-1"
                      style={{borderColor: '#dc2626', color: '#dc2626'}}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;