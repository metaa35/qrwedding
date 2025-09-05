import React from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Check, 
  Star, 
  Crown, 
  Heart,
  Users,
  Camera,
  Cloud,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  QrCode
} from 'lucide-react';

const Pricing = () => {
  // Scroll animasyonları için ref'ler
  const headerRef = React.useRef(null);
  const pricingRef = React.useRef(null);
  const faqRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  
  // InView hook'ları
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 });
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
  const plans = [
    {
      name: '1 QR Oluşturma',
      price: 'ÇOK YAKINDA!',
      period: '',
      description: 'Tek etkinlik için QR kod oluşturma',
      icon: QrCode,
      color: '#6E473B',
      popular: false,
      features: [
        '1 QR kod oluşturma',
        'Sınırsız fotoğraf yükleme',
        'Temel galeri görüntüleme',
        'Mobil uyumlu tasarım',
        'Google Drive depolama',
        'E-posta desteği'
      ],
      limitations: [
        'Sadece 1 etkinlik',
        'Temel özellikler'
      ]
    },
    {
      name: 'QR Kod Baskılı',
      price: 'ÇOK YAKINDA!',
      period: '',
      description: 'QR kod + profesyonel baskı hizmeti',
      icon: Star,
      color: '#A78D78',
      popular: true,
      features: [
        '1 QR kod oluşturma',
        'Profesyonel QR kod baskısı',
        'Sınırsız fotoğraf yükleme',
        'Gelişmiş galeri özellikleri',
        'Özel etkinlik şablonları',
        'Toplu indirme',
        'Sosyal medya paylaşımı',
        'Öncelikli destek'
      ],
      limitations: []
    },
    {
      name: 'Organizasyon Şirketleri',
      price: 'ÇOK YAKINDA!',
      period: '',
      description: 'Organizasyon şirketleri için özel paket',
      icon: Crown,
      color: '#BEB5A9',
      popular: false,
      features: [
        'Sınırsız QR kod oluşturma',
        'Profesyonel baskı hizmeti',
        'Çoklu kullanıcı yönetimi',
        'Özel marka entegrasyonu',
        'API erişimi',
        'Özel domain',
        '7/24 telefon desteği',
        'Özel eğitim',
        'SLA garantisi'
      ],
      limitations: []
    }
  ];

  const faqItems = [
    {
      question: '1 QR Oluşturma paketi ile ne yapabilirim?',
      answer: 'Bu paket ile tek bir etkinlik için QR kod oluşturabilir ve sınırsız fotoğraf toplayabilirsiniz.'
    },
    {
      question: 'QR Kod Baskılı paketinde baskı nasıl çalışır?',
      answer: 'QR kodunuzu oluşturduktan sonra profesyonel baskı hizmetimizle fiziksel materyallerinizi alabilirsiniz.'
    },
    {
      question: 'Organizasyon Şirketleri paketi ne zaman aktif olacak?',
      answer: 'Tüm paketler çok yakında aktif olacak. Duyurularımızı takip edin!'
    },
    {
      question: 'Fotoğraflarım güvenli mi?',
      answer: 'Evet, tüm fotoğraflarınız Google Drive\'da güvenle saklanır. Verileriniz şifrelenir ve yedeklenir.'
    },
    {
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler güvenli SSL ile korunur.'
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
                <span className="text-gradient">Fiyatlandırma</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                İhtiyacınıza uygun planı seçin. Ücretsiz başlayın, istediğiniz zaman yükseltin.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section ref={pricingRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={pricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className={`card relative ${plan.popular ? 'ring-2' : ''}`}
                  style={{
                    ringColor: plan.popular ? '#6E473B' : 'transparent',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="px-4 py-1 rounded-full text-white text-sm font-medium"
                        style={{backgroundColor: '#6E473B'}}
                      >
                        En Popüler
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div 
                        className="p-4 rounded-2xl"
                        style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                      >
                        <plan.icon className="h-8 w-8" style={{color: plan.color}} />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-1">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 mr-3" style={{color: plan.color}} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-center text-gray-500">
                        <span className="h-5 w-5 mr-3 flex items-center justify-center">
                          <span className="text-xs">✗</span>
                        </span>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      plan.popular 
                        ? 'text-white' 
                        : 'border'
                    }`}
                    style={{
                      backgroundColor: plan.popular ? '#6E473B' : 'transparent',
                      borderColor: plan.popular ? 'transparent' : '#6E473B',
                      color: plan.popular ? 'white' : '#6E473B'
                    }}
                    disabled
                  >
                    ÇOK YAKINDA!
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span className="text-gradient">Sık Sorulan Sorular</span>
              </h2>
              <p className="text-xl text-gray-600">
                Fiyatlandırma hakkında merak ettikleriniz
              </p>
            </motion.div>

            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
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
                  Çok Yakında!
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Tüm paketlerimiz çok yakında aktif olacak. Duyurularımızı takip edin!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/features"
                    className="btn-primary group"
                  >
                    <Star className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Özellikleri İncele
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                  <a
                    href="/how-it-works"
                    className="btn-outline group"
                  >
                    <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Nasıl Çalışır?
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

export default Pricing;