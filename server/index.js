const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

try {
  require('dotenv').config();
} catch (error) {
  console.error('Dotenv config error:', error);
}

const uploadRoutes = require('./routes/upload');
const qrRoutes = require('./routes/qr');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Genel rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
  }
});

// Auth route'ları için daha sıkı rate limiting
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // IP başına maksimum 10 istek
  message: {
    error: 'Çok fazla auth isteği gönderdiniz. Lütfen 1 dakika bekleyin.'
  }
});

app.use(limiter);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://drive.google.com", "https://www.googleapis.com"]
    }
  }
}));

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://www.hatirakosesi.com',
    'https://hatirakosesi.com',
    'https://qrwedding-h9fdhcxst-metaa35s-projects.vercel.app'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

// Uploads klasörünü serve et
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static dosyaları serve et (client build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes
try {
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/admin', adminRoutes);
} catch (error) {
  console.error('Route loading error:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    error: 'Sunucu hatası oluştu',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - React Router için index.html'e yönlendir
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

const PORT = process.env.PORT || 5000;

// Vercel için export
module.exports = app;

// Sadece local development için listen
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  });
} 