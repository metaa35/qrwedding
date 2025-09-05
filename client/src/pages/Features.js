import React from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  QrCode, 
  Shield, 
  Zap, 
  Smartphone, 
  Cloud, 
  Users, 
  Heart,
  Camera,
  Download,
  Share2,
  CheckCircle,
  Star,
  Sparkles,
  Lock,
  Globe,
  Infinity
} from 'lucide-react';

const Features = () => {
  // Scroll animasyonları için ref'ler
  const headerRef = React.useRef(null);
  const mainFeaturesRef = React.useRef(null);
  const additionalFeaturesRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  
  // InView hook'ları
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const mainFeaturesInView = useInView(mainFeaturesRef, { once: true, amount: 0.2 });
  const additionalFeaturesInView = useInView(additionalFeaturesRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });
  
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
  const mainFeatures = [
    {
      icon: QrCode,
      title: 'QR Kod ile Kolay Erişim',
      description: 'Misafirleriniz QR kodu okutarak anında fotoğraf yükleme sayfasına ulaşabilir. Tek tıkla erişim sağlayın.',
      color: '#6E473B',
      benefits: ['Tek tıkla erişim', 'Mobil uyumlu', 'Hızlı yükleme']
    },
    {
      icon: Shield,
      title: 'Güvenli Google Drive Depolama',
      description: 'Tüm fotoğraflar ve videolar Google Drive\'da güvenle saklanır. Verileriniz korunur.',
      color: '#A78D78',
      benefits: ['Google güvenliği', 'Otomatik yedekleme', 'Şifreli depolama']
    },
    {
      icon: Zap,
      title: 'Anında Paylaşım',
      description: 'Yüklenen fotoğraflar anında galeride görüntülenir. Gerçek zamanlı paylaşım deneyimi.',
      color: '#BEB5A9',
      benefits: ['Gerçek zamanlı', 'Anında görüntüleme', 'Canlı güncelleme']
    },
    {
      icon: Smartphone,
      title: 'Mobil Uyumlu Tasarım',
      description: 'Tüm cihazlardan kolayca kullanılabilir, responsive tasarım. Her yerde erişim.',
      color: '#6E473B',
      benefits: ['Responsive tasarım', 'Tüm cihazlar', 'Kolay kullanım']
    },
    {
      icon: Heart,
      title: 'Özel Etkinlikler',
      description: 'Düğün, nişan, doğum günü, mezuniyet ve diğer özel günler için özel olarak tasarlandı.',
      color: '#A78D78',
      benefits: ['Özel şablonlar', 'Kişiselleştirme', 'Etkinlik odaklı']
    },
    {
      icon: Users,
      title: 'Sınırsız Misafir',
      description: 'Kaç kişi katılırsa katılsın, tüm misafirleriniz fotoğraf yükleyebilir. Sınır yok.',
      color: '#BEB5A9',
      benefits: ['Sınırsız kullanıcı', 'Toplu yükleme', 'Kolay paylaşım']
    }
  ];

  const additionalFeatures = [
    {
      icon: Camera,
      title: 'Fotoğraf & Video Desteği',
      description: 'Hem fotoğraf hem de video yükleme desteği ile tüm anılarınızı saklayın.',
      color: '#6E473B'
    },
    {
      icon: Download,
      title: 'Kolay İndirme',
      description: 'Tüm fotoğrafları tek tıkla indirin. Toplu indirme seçenekleri.',
      color: '#A78D78'
    },
    {
      icon: Share2,
      title: 'Sosyal Medya Paylaşımı',
      description: 'Fotoğrafları sosyal medyada kolayca paylaşın. Entegre paylaşım araçları.',
      color: '#BEB5A9'
    },
    {
      icon: Lock,
      title: 'Gizlilik Koruması',
      description: 'Kişisel verileriniz korunur. Gizlilik politikasına uygun işlem.',
      color: '#6E473B'
    },
    {
      icon: Globe,
      title: 'Çoklu Dil Desteği',
      description: 'Türkçe ve İngilizce dil desteği ile uluslararası kullanım.',
      color: '#A78D78'
    },
    {
      icon: Infinity,
      title: 'Sınırsız Depolama',
      description: 'Google Drive entegrasyonu ile sınırsız depolama alanı.',
      color: '#BEB5A9'
    }
  ];

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
        <section ref={headerRef} className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={headerInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
              >
                <Star className="h-8 w-8" style={{color: '#6E473B'}} />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Özellikler</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hatıra Köşesi ile etkinliklerinizde fotoğraf toplama sürecini kolaylaştıran tüm özellikler
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Features */}
        <section ref={mainFeaturesRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={mainFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Ana Özellikler</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Etkinliklerinizde fotoğraf toplama sürecini kolaylaştıran temel özellikler
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={mainFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="card group hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300"
                      style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                    >
                      <feature.icon className="h-10 w-10" style={{color: feature.color}} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2" style={{color: feature.color}} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section ref={additionalFeaturesRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={additionalFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Ek Özellikler</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Daha da iyi bir deneyim için ek özellikler
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={additionalFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="card text-center group hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                      style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                    >
                      <feature.icon className="h-6 w-6" style={{color: feature.color}} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="card text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl"></div>
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                >
                  <Sparkles className="h-8 w-8" style={{color: '#6E473B'}} />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Tüm Özellikleri Deneyin
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Etkinliğiniz için QR kod oluşturun ve tüm bu özellikleri deneyimleyin.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/qr-generator"
                    className="btn-primary group"
                  >
                    <QrCode className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Ücretsiz Başla
                  </a>
                  <a
                    href="/pricing"
                    className="btn-outline group"
                  >
                    <Star className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Fiyatları Gör
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Features;