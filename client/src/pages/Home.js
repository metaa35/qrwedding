import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { 
  Heart, 
  QrCode, 
  Shield, 
  Zap, 
  Users, 
  Smartphone,
  ArrowRight,
  Star,
  Sparkles,
  Camera,
  Globe,
  Lock,
  Infinity,
  CheckCircle,
  Upload,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Parallax efektleri için scroll değerleri
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const floatingY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const floatingY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const floatingY3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  
  // Smooth animasyonlar için spring değerleri
  const smoothY = useSpring(backgroundY, { stiffness: 100, damping: 30 });
  const smoothFloating1 = useSpring(floatingY1, { stiffness: 50, damping: 25 });
  const smoothFloating2 = useSpring(floatingY2, { stiffness: 50, damping: 25 });
  const smoothFloating3 = useSpring(floatingY3, { stiffness: 50, damping: 25 });
  
  // Scroll animasyonları için ref'ler
  const heroRef = React.useRef(null);
  const statsRef = React.useRef(null);
  const featuresRef = React.useRef(null);
  const testimonialsRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  
  // InView hook'ları
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const features = [
    {
      icon: QrCode,
      title: 'QR Kod ile Kolay Erişim',
      description: 'Misafirleriniz QR kodu okutarak anında fotoğraf yükleme sayfasına ulaşabilir.',
      color: '#6E473B',
      delay: 0.1
    },
    {
      icon: Shield,
      title: 'Güvenli Google Drive Depolama',
      description: 'Tüm fotoğraflar ve videolar Google Drive\'da güvenle saklanır.',
      color: '#A78D78',
      delay: 0.2
    },
    {
      icon: Zap,
      title: 'Anında Paylaşım',
      description: 'Yüklenen fotoğraflar anında galeride görüntülenir.',
      color: '#BEB5A9',
      delay: 0.3
    },
    {
      icon: Smartphone,
      title: 'Mobil Uyumlu',
      description: 'Tüm cihazlardan kolayca kullanılabilir, responsive tasarım.',
      color: '#BEB5A9',
      delay: 0.4
    },
    {
      icon: Heart,
      title: 'Özel Etkinlikler',
      description: 'Düğün, nişan, doğum günü, mezuniyet ve diğer özel günler için tasarlandı.',
      color: '#6E473B',
      delay: 0.5
    },
    {
      icon: Users,
      title: 'Sınırsız Misafir',
      description: 'Kaç kişi katılırsa katılsın, tüm misafirleriniz fotoğraf yükleyebilir.',
      color: '#A78D78',
      delay: 0.6
    }
  ];

  const stats = [
    { number: '100+', label: 'Mutlu Çift', icon: Heart },
    { number: '2K+', label: 'Yüklenen Fotoğraf', icon: Camera },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '24/7', label: 'Destek', icon: Users }
  ];

  const testimonials = [
    {
      name: 'Ahmet & Ayşe',
      event: 'Düğün',
      message: 'Misafirlerimiz çok kolay fotoğraf yükledi. Harika bir deneyimdi!',
      rating: 5,
      image: '👰‍♀️🤵‍♂️'
    },
    {
      name: 'Mehmet & Fatma',
      event: 'Nişan',
      message: 'QR kod sistemi gerçekten pratik. Herkese tavsiye ederiz.',
      rating: 5,
      image: '💍'
    },
    {
      name: 'Ali & Zeynep',
      event: 'Doğum Günü',
      message: 'Çocuğumuzun doğum gününde tüm anıları topladık. Mükemmel!',
      rating: 5,
      image: '🎂'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Soft Background with Parallax */}
      <div className="fixed inset-0">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#E1D4C2]/50 via-white/30 to-[#BEB5A9]/50"
          style={{ y: smoothY }}
        ></motion.div>
        
        {/* Parallax Floating Elements */}
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
        {/* Hero Section - Asymmetric Layout */}
        <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8"
            >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9', color: '#291C0E'}}
              >
                <Heart className="h-4 w-4" />
                <span>Anılarınızı Güvenle Saklayın</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl md:text-6xl font-light leading-tight text-gray-900"
              >
                <span className="text-gradient font-medium">Anılarınız</span>
                <br />
                <span className="text-gray-800">Hatıra Köşesinde</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl"
              >
                Düğün, nişan, doğum günü... Tüm özel anlarınızı misafirlerinizle birlikte 
                <span className="text-slate-700 font-medium"> güvenle paylaşın</span> ve 
                <span className="text-slate-700 font-medium"> sonsuza kadar saklayın</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Link to="/qr-generator" className="btn-primary group">
                  <QrCode className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  QR Kod Oluştur
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - 3D Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: 45 }}
              animate={heroInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 100, rotateY: 45 }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="relative perspective-card"
            >
              <div className="relative w-full h-96 bg-white rounded-2xl shadow-lg p-8" style={{border: '1px solid #BEB5A9'}}>
                {/* QR Code Mockup */}
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="w-32 h-32 rounded-xl shadow-sm flex items-center justify-center"
                    style={{backgroundColor: '#E1D4C2', border: '1px solid #BEB5A9'}}
                  >
                    <QrCode className="h-20 w-20" style={{color: '#6E473B'}} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-center space-y-2"
                  >
                    <h3 className="text-xl font-medium text-gray-800">QR Kod</h3>
                    <p style={{color: '#6E473B'}}>Anında Erişim</p>
                  </motion.div>
                </div>

                {/* Floating Icons */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Star className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Heart className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section - Asymmetric Grid */}
        <section ref={statsRef} className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.8 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 mb-4 shadow-lg shadow-amber-500/25"
                  >
                    <stat.icon className="h-8 w-8" style={{color: '#6E473B'}} />
                  </motion.div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="font-medium" style={{color: '#374151'}}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
        </div>
      </section>

        {/* Features Section - Creative Layout */}
        <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
          >
              <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{color: '#1f2937'}}>
                <span className="text-gradient">Neden</span> Hatıra Köşesi?
            </h2>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{color: '#374151'}}>
                Özel anlarınızı güvenle saklamak ve paylaşmak için tasarlanmış
                <span className="font-bold" style={{color: '#6E473B'}}> en kolay</span> ve 
                <span className="font-bold" style={{color: '#A78D78'}}> en güvenli</span> çözüm
            </p>
          </motion.div>

            {/* Asymmetric Grid Layout */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 45 }}
                  animate={featuresInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 45 }}
                  transition={{ delay: feature.delay, duration: 0.8 }}
                  className={`card perspective-card group ${
                    index === 0 || index === 3 ? 'md:col-span-2 lg:col-span-1' : ''
                  } ${index === 2 ? 'lg:col-start-2' : ''}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="flex items-center justify-center mb-6"
                  >
                    <div className={`p-6 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-xl border border-${feature.color.split('-')[1]}-400/30 shadow-lg`}>
                      <feature.icon className="h-12 w-12" style={{color: feature.color}} />
                  </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{color: '#1f2937'}}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-lg" style={{color: '#374151'}}>
                    {feature.description}
                  </p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>

        {/* Testimonials Section - Creative Layout */}
        <section ref={testimonialsRef} className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
          >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span className="text-gradient">Müşteri</span> Yorumları
            </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Binlerce mutlu çiftin tercihi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                  initial={{ opacity: 0, y: 50, rotateY: 45 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 50, rotateY: 45 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="card perspective-card group"
                >
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{testimonial.image}</div>
                    <div className="flex items-center justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" style={{color: '#6E473B'}} />
                  ))}
                </div>
                  </div>
                  <p className="mb-6 italic text-lg leading-relaxed" style={{color: '#374151'}}>
                    "{testimonial.message}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg" style={{color: '#1f2937'}}>
                    {testimonial.name}
                      </div>
                      <div className="text-sm" style={{color: '#6E473B'}}>
                        {testimonial.event}
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* CTA Section - Creative Layout */}
        <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="card text-center">
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
                  
                  <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color: '#1f2937'}}>
                    Etkinliğiniz İçin
                    <br />
                    <span className="text-gradient">Hemen Başlayın</span>
            </h2>
                  <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{color: '#374151'}}>
                    Sadece birkaç dakikada QR kodunuzu oluşturun ve misafirlerinizin 
                    fotoğraflarını toplamaya başlayın.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link to="/qr-generator" className="btn-primary group">
                      <QrCode className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                      Ücretsiz Başla
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                    <Link to="/register" className="btn-outline group">
                      <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      Hesap Oluştur
            </Link>
                  </div>
                </div>
              </div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home; 