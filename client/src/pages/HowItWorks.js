import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Cloud, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: QrCode,
      step: '1',
      title: 'QR Kod Oluşturun',
      description: 'Etkinliğiniz için özel QR kod oluşturun ve misafirlerinizle paylaşın.',
      details: [
        'Etkinlik adınızı girin',
        'QR kod otomatik oluşturulur',
        'Kodu yazdırın veya dijital olarak paylaşın'
      ]
    },
    {
      icon: Smartphone,
      step: '2',
      title: 'Misafirler Yüklesin',
      description: 'Misafirleriniz QR kodu okutarak fotoğraf ve videolarını yüklesin.',
      details: [
        'QR kodu telefon kamerasıyla okutun',
        'Fotoğraf veya video seçin',
        'Tek tıkla yükleyin'
      ]
    },
    {
      icon: Cloud,
      step: '3',
      title: 'Anıları Toplayın',
      description: 'Tüm anılar güvenli bir şekilde Google Drive\'da toplanır.',
      details: [
        'Anında Google Drive\'a kaydedilir',
        'Galeri sayfasından görüntüleyin',
        'Tüm anılarınız güvende'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
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
                Nasıl <span className="text-gradient">Çalışır?</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                3 basit adımda misafirlerinizin anılarını toplayın. 
                Hiçbir teknik bilgi gerekmez!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold z-10">
                    {item.step}
                  </div>

                  {/* Card */}
                  <div className="card text-center relative pt-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      {item.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-3 text-left">
                      {item.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-primary-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
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
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              QR kodunuzu oluşturun ve misafirlerinizin anılarını toplamaya başlayın.
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

export default HowItWorks;
