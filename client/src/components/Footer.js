import React from 'react';
import { Heart, Camera, QrCode, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gradient">
                Düğün Anıları
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Düğün ve nişanlarınızda misafirlerinizin anılarını kolayca paylaşmasını sağlayın. 
              QR kod ile hızlı ve güvenli fotoğraf/video yükleme sistemi.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Güvenli Yükleme</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Camera className="h-4 w-4" />
                <span>Anında Paylaşım</span>
              </div>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/upload" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Fotoğraf Yükle
                </a>
              </li>
              <li>
                <a href="/qr-generator" className="text-gray-600 hover:text-primary-600 transition-colors">
                  QR Kod Oluştur
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Galeri
                </a>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">İletişim</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                <span className="font-medium">Email:</span> info@dugunanilari.com
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Destek:</span> 7/24 Canlı Destek
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 Düğün Anıları. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
              Gizlilik Politikası
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
              Kullanım Şartları
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
              KVKK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 