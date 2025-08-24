import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  Heart,
  ArrowRight,
  Check
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Kod ile Kolay Erişim',
      description: 'Misafirleriniz QR kodu okutarak anında fotoğraf yükleme sayfasına ulaşabilir.',
      benefits: [
        'Tek tıkla erişim',
        'Karmaşık URL\'ler yok',
        'Mobil uyumlu QR kodlar'
      ]
    },
    {
      icon: Shield,
      title: 'Güvenli Google Drive Depolama',
      description: 'Tüm fotoğraflar ve videolar Google Drive\'da güvenle saklanır.',
      benefits: [
        'Google güvenliği',
        'Otomatik yedekleme',
        'Şifreli depolama'
      ]
    },
    {
      icon: Zap,
      title: 'Anında Paylaşım',
      description: 'Yüklenen fotoğraflar anında galeride görüntülenir.',
      benefits: [
        'Gerçek zamanlı güncelleme',
        'Anında erişim',
        'Hızlı paylaşım'
      ]
    },
    {
      icon: Smartphone,
      title: 'Mobil Uyumlu',
      description: 'Tüm cihazlardan kolayca kullanılabilir, responsive tasarım.',
      benefits: [
        'Telefon uyumlu',
        'Tablet uyumlu',
        'Tüm tarayıcılar'
      ]
    },
    {
      icon: Heart,
      title: 'Özel Etkinlikler',
      description: 'Düğün, nişan, doğum günü ve diğer özel günler için tasarlandı.',
      benefits: [
        'Özelleştirilebilir',
        'Etkinlik odaklı',
        'Anı toplama'
      ]
    },
    {
      icon: Users,
      title: 'Kolay Kullanım',
      description: 'Hiçbir teknik bilgi gerekmez, herkes kolayca kullanabilir.',
      benefits: [
        'Basit arayüz',
        'Hızlı öğrenme',
        'Kullanıcı dostu'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
                             <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                 Kullanıcı <span className="text-gradient">Özellikleri</span>
               </h1>
               <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                 Özel günlerinizde misafirlerinizin anılarını kolayca toplamak için 
                 tasarlanmış kullanıcı dostu özellikler.
               </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-center">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Geleneksel Yöntemler vs Kullanıcı Dostu Sistemimiz
             </h2>
             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
               Neden bizim sistemimizi tercih etmelisiniz?
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Methods */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Geleneksel Yöntemler
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Karmaşık dosya paylaşım linkleri
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Güvenlik riskleri
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Teknik bilgi gerektirir
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Yavaş ve karmaşık süreç
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Mobil uyumsuzluk
                </li>
              </ul>
            </motion.div>

            {/* Our System */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 shadow-lg text-white"
            >
              <h3 className="text-2xl font-bold mb-6 text-center">
                Bizim Sistemimiz
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  QR kod ile tek tıkla erişim
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Google Drive güvenliği
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Hiçbir teknik bilgi gerekmez
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Hızlı ve basit süreç
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Tam mobil uyumlu
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
                         <h2 className="text-3xl font-bold text-gray-900 mb-4">
               Hemen Deneyin
             </h2>
             <p className="text-xl text-gray-600 mb-8">
               Tek QR paketi ile tüm bu özellikleri kullanabilirsiniz.
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/qr-generator" className="btn-primary inline-flex items-center">
                QR Kod Oluştur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
                             <Link to="/register" className="btn-outline inline-flex items-center">
                 Hesap Oluştur
               </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
