import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import Gallery from './pages/Gallery';
import QRGenerator from './pages/QRGenerator';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';

// Axios base URL ayarla - relative path kullan
axios.defaults.baseURL = '';

function App() {
  const location = useLocation();

  // Sayfa geçiş animasyonları
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <AuthProvider>
      <div className="App">
        <ScrollProgress />
        <Header />
        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/qr-generator" element={<QRGenerator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AuthProvider>
  );
}

export default App; 