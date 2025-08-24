import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Users, 
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';

const Pricing = () => {
  const features = [
    '1 QR kod oluşturma hakkı',
    'Google Drive entegrasyonu',
    'Mobil uyumlu tasarım',
    'Güvenli depolama',
    'Anında paylaşım',
    'Özelleştirilebilir QR kod',
    'Kolay kullanım',
    '7/24 destek',
    'Sonsuza kadar erişim',
    'Anı toplama'
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
                 Tek QR <span className="text-gradient">Paketi</span>
               </h1>
               <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                 Bir kez ödeme yapın, bir QR kod oluşturun ve sonsuza kadar kullanın. 
                 Anılarınızı toplamaya hemen başlayın.
               </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-300 mr-2" />
              <span className="text-lg font-semibold">En Popüler</span>
            </div>
            
                         <h3 className="text-3xl font-bold mb-4">Tek QR Paketi</h3>
             <div className="text-6xl font-bold mb-2">ÇOK YAKINDA!</div>
             <p className="text-xl text-primary-100 mb-8">Bir kez ödeme, sonsuza kadar kullanım</p>
            
            <ul className="space-y-4 mb-8 text-left max-w-md mx-auto">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="space-y-4">
                             <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg inline-flex items-center transition-all duration-200 transform hover:scale-105">
                 <Users className="mr-2 h-5 w-5" />
                 Çok Yakında
               </button>
                             <p className="text-sm text-primary-100">
                 Ödeme sistemi yakında aktif olacak
               </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Free Section */}
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
               Neden Tek QR Paketi?
             </h2>
             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
               Anılarınızın değerini biliyoruz. Bu yüzden uygun fiyatlı tek paket sunuyoruz.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                             {
                 title: 'Anılar Değerlidir',
                 description: 'Düğün ve nişan gibi özel günlerin anıları paha biçilemez. Bu anıları toplamak için uygun fiyatlı hizmet sunuyoruz.'
               },
               {
                 title: 'Kaliteli Hizmet',
                 description: 'Tek QR kod ile tüm etkinliğinizi yönetin. Karmaşık paketler yok, sadece ihtiyacınız olan.'
               },
               {
                 title: 'Sonsuza Kadar Erişim',
                 description: 'Bir kez ödeme yapın, QR kodunuzu sonsuza kadar kullanın. Hiçbir ek ücret yok.'
               }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
      <section className="py-20">
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

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sık Sorulan Sorular
            </h2>
            <p className="text-xl text-gray-600">
              Merak ettiğiniz soruların cevapları
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
                             {
                 question: 'Kaç QR kod oluşturabilirim?',
                 answer: 'Her kullanıcı sadece 1 QR kod oluşturabilir. Bu QR kod sonsuza kadar kullanılabilir.'
               },
               {
                 question: 'Ödeme güvenli mi?',
                 answer: 'Evet, tüm ödemeler güvenli ödeme sistemleri ile yapılır. Kredi kartı bilgileriniz güvende.'
               },
               {
                 question: 'QR kodum kaybolur mu?',
                 answer: 'Hayır, oluşturduğunuz QR kod hiçbir zaman kaybolmaz. QR Oluştur sayfasında her zaman görünür.'
               },
              {
                question: 'Dosya boyutu sınırı var mı?',
                answer: 'Google Drive\'ın standart sınırları geçerlidir. Genellikle 5GB\'a kadar dosya yükleyebilirsiniz.'
              },
              {
                question: 'Verilerim güvende mi?',
                answer: 'Evet, tüm verileriniz Google Drive\'da güvenle saklanır ve şifrelenir.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
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
               Hemen Başlayın
             </h2>
             <p className="text-xl text-gray-600 mb-8">
               Hesabınızı oluşturun, ödeme yapın ve QR kodunuzu oluşturun.
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <Link to="/register" className="btn-primary inline-flex items-center">
                 Hesap Oluştur
                 <ArrowRight className="ml-2 h-5 w-5" />
               </Link>
              <Link to="/qr-generator" className="btn-outline inline-flex items-center">
                QR Kod Oluştur
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
