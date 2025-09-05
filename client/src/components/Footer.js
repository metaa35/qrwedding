import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  QrCode, 
  Camera, 
  Upload,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Nasıl Çalışır', href: '/how-it-works' },
    { name: 'Özellikler', href: '/features' },
    { name: 'Fiyatlandırma', href: '/pricing' },
    { name: 'QR Oluştur', href: '/qr-generator' }
  ];

  const features = [
    { name: 'QR Kod Oluştur', href: '/qr-generator', icon: QrCode },
    { name: 'Fotoğraf Yükle', href: '/upload', icon: Upload },
    { name: 'Galeri Görüntüle', href: '/gallery', icon: Camera }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin }
  ];

  return (
    <footer className="text-gray-700" style={{backgroundColor: '#E1D4C2', borderTop: '1px solid #BEB5A9'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Hatıra Köşesi Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold" style={{color: '#291C0E'}}>Hatıra Köşesi</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Etkinliklerinizde misafirlerinizin paylaştığı tüm fotoğraf ve videoları 
              güvenle saklayın ve kolayca paylaşın.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                  style={{backgroundColor: '#BEB5A9', color: '#291C0E'}}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6">Hızlı Linkler</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6">Özellikler</h3>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature.name}>
                  <Link
                    to={feature.href}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    <feature.icon className="h-4 w-4" />
                    <span>{feature.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" style={{color: '#6E473B'}} />
                <span className="text-gray-600">info@hatirakosesi.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" style={{color: '#6E473B'}} />
                <span className="text-gray-600">+90 (555) 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5" style={{color: '#6E473B'}} />
                <span className="text-gray-600">İstanbul, Türkiye</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8"
          style={{borderTop: '1px solid #BEB5A9'}}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-600 mb-4 md:mb-0">
              <span>© {currentYear} Hatıra Köşesi. Tüm hakları saklıdır.</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Gizlilik Politikası
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;