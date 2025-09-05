# QR Şablon Dosyaları

Bu klasöre QR şablon görsellerinizi ekleyebilirsiniz.

## Dosya Formatı:
- **Format**: PNG veya JPG
- **Boyut**: 800x1000 piksel (önerilen)
- **İsimlendirme**: `wedding-love.png`, `modern-minimal.png`, vb.

## Şablon Ekleme:
1. Şablon görselinizi bu klasöre koyun
2. `QRGenerator.js` dosyasındaki `templates` array'ine yeni şablon ekleyin
3. QR kod pozisyonu ve metin pozisyonlarını belirleyin

## Örnek Şablon Yapısı:
```javascript
{
  id: 'your-template-id',
  name: 'Şablon Adı',
  description: 'Şablon açıklaması',
  image: '/templates/your-template.png',
  qrPosition: { x: 300, y: 400, size: 200 },
  textPositions: {
    title: { x: 400, y: 100, fontSize: 32, color: '#000000' },
    eventName: { x: 400, y: 680, fontSize: 24, color: '#000000' },
    date: { x: 400, y: 710, fontSize: 18, color: '#000000' }
  }
}
```

## QR Kod Pozisyonu:
- `x`: QR kodun sol üst köşesinin X koordinatı
- `y`: QR kodun sol üst köşesinin Y koordinatı  
- `size`: QR kodun boyutu (genişlik ve yükseklik)

## Metin Pozisyonları:
- `x`: Metnin X koordinatı (merkez)
- `y`: Metnin Y koordinatı (alt)
- `fontSize`: Font boyutu
- `color`: Metin rengi (hex kodu)
