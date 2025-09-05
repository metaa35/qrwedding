import React from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  Camera, 
  Cloud, 
  Users, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Share2
} from 'lucide-react';

const HowItWorks = () => {
  // Scroll animasyonları için ref'ler
  const headerRef = React.useRef(null);
  const stepsRef = React.useRef(null);
  const featuresRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  
  // InView hook'ları
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.2 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
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
  const steps = [
    {
      number: 1,
      title: 'QR Kod Oluşturun',
      description: 'Etkinliğiniz için özel QR kod oluşturun. Etkinlik adı, tarihi ve özel mesajınızı ekleyin.',
      icon: QrCode,
      color: '#6E473B'
    },
    {
      number: 2,
      title: 'QR Kodu Paylaşın',
      description: 'QR kodu misafirlerinizle paylaşın. Basılı materyallere, masa kartlarına veya dijital olarak ekleyin.',
      icon: Share2,
      color: '#A78D78'
    },
    {
      number: 3,
      title: 'Misafirler Fotoğraf Yükler',
      description: 'Misafirleriniz QR kodu okutarak fotoğraf yükleme sayfasına ulaşır ve fotoğraflarını paylaşır.',
      icon: Smartphone,
      color: '#BEB5A9'
    },
    {
      number: 4,
      title: 'Anılarınızı Toplayın',
      description: 'Tüm fotoğraflar güvenle Google Drive\'da saklanır ve galeride görüntülenir.',
      icon: Cloud,
      color: '#6E473B'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Sınırsız Misafir',
      description: 'Kaç kişi katılırsa katılsın, tüm misafirleriniz fotoğraf yükleyebilir.',
      color: '#6E473B'
    },
    {
      icon: Camera,
      title: 'Fotoğraf & Video',
      description: 'Hem fotoğraf hem de video yükleme desteği.',
      color: '#A78D78'
    },
    {
      icon: Cloud,
      title: 'Güvenli Depolama',
      description: 'Tüm dosyalar Google Drive\'da güvenle saklanır.',
      color: '#BEB5A9'
    },
    {
      icon: Heart,
      title: 'Özel Etkinlikler',
      description: 'Düğün, nişan, doğum günü ve diğer özel günler için tasarlandı.',
      color: '#6E473B'
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
                <Sparkles className="h-8 w-8" style={{color: '#6E473B'}} />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Nasıl Çalışır?</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sadece 4 basit adımda etkinliğiniz için QR kod oluşturun ve misafirlerinizin fotoğraflarını toplayın
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section ref={stepsRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="card text-center relative"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{backgroundColor: step.color}}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center mb-6 mt-4">
                    <div 
                      className="p-4 rounded-2xl"
                      style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                    >
                      <step.icon className="h-8 w-8" style={{color: step.color}} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Özellikler</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hatıra Köşesi ile etkinliklerinizde fotoğraf toplama sürecini kolaylaştırın
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="card text-center group hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300"
                      style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                    >
                      <feature.icon className="h-8 w-8" style={{color: feature.color}} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
                  <Star className="h-8 w-8" style={{color: '#6E473B'}} />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Hemen Başlayın
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Etkinliğiniz için QR kod oluşturun ve misafirlerinizin fotoğraflarını toplamaya başlayın.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/qr-generator"
                    className="btn-primary group"
                  >
                    <QrCode className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    QR Kod Oluştur
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                  <a
                    href="/register"
                    className="btn-outline group"
                  >
                    <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Hesap Oluştur
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

export default HowItWorks;