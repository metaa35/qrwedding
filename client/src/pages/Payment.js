import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Lock, 
  CheckCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    if (!user) {
      toast.error('Ödeme yapmak için giriş yapmalısınız!');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Burada gerçek ödeme entegrasyonu yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Ödeme başarılı olduğunda kullanıcıyı güncelle
      const response = await axios.post('/api/auth/update-payment', {
        has_paid: true,
        payment_amount: 1500,
        payment_date: new Date()
      });

      if (response.data.success) {
        toast.success('Ödeme başarılı! QR kod oluşturabilirsiniz.');
        navigate('/qr-generator');
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      toast.error('Ödeme sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Güvenli Ödeme
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            QR kod oluşturma hakkı için güvenli ödeme yapın
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Ödeme Formu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Ödeme Bilgileri
              </h3>

              {/* Paket Bilgisi */}
              <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Tek QR Paketi</h4>
                    <p className="text-sm text-gray-600">Bir kez ödeme, sonsuza kadar kullanım</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">₺1.500</div>
                    <div className="text-sm text-gray-500">KDV Dahil</div>
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ödeme Yöntemi
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span>Kredi Kartı / Banka Kartı</span>
                  </label>
                </div>
              </div>

              {/* Kart Bilgileri */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Ödeme Yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="mr-2 h-5 w-5" />
                      ₺1.500 Öde
                    </div>
                  )}
                </button>
              </div>

              {/* Güvenlik Bilgisi */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Güvenli Ödeme</p>
                    <p>Tüm ödemeler SSL şifreleme ile korunur. Kart bilgileriniz güvende.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Paket Detayları */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Paket İçeriği
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>1 QR kod oluşturma hakkı</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Sonsuza kadar erişim</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Google Drive entegrasyonu</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Mobil uyumlu tasarım</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Güvenli depolama</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Anında paylaşım</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>7/24 destek</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Önemli Notlar</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Her kullanıcı sadece 1 QR kod oluşturabilir</li>
                  <li>• QR kodunuz hiçbir zaman kaybolmaz</li>
                  <li>• Ödeme bir kez yapılır, ek ücret yoktur</li>
                  <li>• İstediğiniz zaman kullanabilirsiniz</li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/pricing')}
                className="w-full mt-6 btn-outline flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Fiyatlandırmaya Dön
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
