import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Camera, 
  QrCode, 
  Shield, 
  Zap, 
  Users, 
  Smartphone,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Kod ile Kolay Erişim',
      description: 'Misafirleriniz QR kodu okutarak anında fotoğraf yükleme sayfasına ulaşabilir.'
    },
    {
      icon: Shield,
      title: 'Güvenli Google Drive Depolama',
      description: 'Tüm fotoğraflar ve videolar Google Drive\'da güvenle saklanır.'
    },
    {
      icon: Zap,
      title: 'Anında Paylaşım',
      description: 'Yüklenen fotoğraflar anında galeride görüntülenir.'
    },
    {
      icon: Smartphone,
      title: 'Mobil Uyumlu',
      description: 'Tüm cihazlardan kolayca kullanılabilir, responsive tasarım.'
    }
  ];

  const testimonials = [
    {
      name: 'Ayşe & Ahmet',
      event: 'Düğün',
      text: 'Misafirlerimiz çok kolay fotoğraf yükledi. Harika bir sistem!',
      rating: 5
    },
    {
      name: 'Fatma & Mehmet',
      event: 'Nişan',
      text: 'QR kod sistemi sayesinde tüm anılarımızı topladık.',
      rating: 5
    },
    {
      name: 'Zeynep & Ali',
      event: 'Düğün',
      text: 'Çok pratik ve kullanışlı. Kesinlikle tavsiye ederiz!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
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
                Düğün <span className="text-gradient">Anılarınızı</span>
                <br />
                <span className="text-gradient">Paylaşın</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                QR kod ile misafirlerinizin fotoğraf ve videolarını kolayca toplayın. 
                Google Drive güvenliği ile anılarınız her zaman güvende.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/qr-generator" className="btn-primary inline-flex items-center">
                  QR Kod Oluştur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/upload" className="btn-outline inline-flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Fotoğraf Yükle
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Düğün ve nişanlarınızda misafirlerinizin anılarını kolayca toplamak için 
              tasarlanmış modern ve güvenli sistem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
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
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              3 basit adımda misafirlerinizin anılarını toplayın
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'QR Kod Oluşturun',
                description: 'Etkinliğiniz için özel QR kod oluşturun ve misafirlerinizle paylaşın.'
              },
              {
                step: '2',
                title: 'Misafirler Yüklesin',
                description: 'Misafirleriniz QR kodu okutarak fotoğraf ve videolarını yüklesin.'
              },
              {
                step: '3',
                title: 'Anıları Toplayın',
                description: 'Tüm anılar güvenli bir şekilde Google Drive\'da toplanır.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card text-center relative"
              >
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mutlu Çiftler Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Düğün ve nişanlarında sistemimizi kullanan çiftlerin deneyimleri
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900">
                    {testimonial.name}
                  </span>
                  <span className="text-gray-500 ml-2">
                    - {testimonial.event}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Anılarınızı Toplamaya Başlayın
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Hemen QR kodunuzu oluşturun ve misafirlerinizin anılarını toplamaya başlayın.
            </p>
            <Link to="/qr-generator" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg inline-flex items-center transition-all duration-200 transform hover:scale-105">
              <QrCode className="mr-2 h-5 w-5" />
              QR Kod Oluştur
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 