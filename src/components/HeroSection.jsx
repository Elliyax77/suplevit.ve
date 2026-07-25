import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const logoScale = useTransform(scrollY, [0, 400], [1.3, 0.5]);

  return (
    <section className="hero-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div style={{ scale: logoScale, transformOrigin: 'top center' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hero-logo-wrapper"
          >
            <img src="/suplevit-logo.png" alt="Suplevit Logo" className="hero-logo" style={{ width: '220px', height: '220px', marginBottom: '16px' }} />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="hero-title"
          style={{ fontSize: '3.5rem', marginBottom: '16px', color: 'var(--accent-color)' }}
        >
          Suplevit
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="hero-subtitle"
          style={{ marginBottom: '60px', fontSize: '18px', maxWidth: '400px' }}
        >
          Descubre suplementos diseñados científicamente para impulsar el desarrollo y bienestar diario.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 15 }}
          transition={{ delay: 1.5, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-color)' }}
        >
          <span style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>Desliza hacia abajo</span>
          <ChevronDown size={32} />
        </motion.div>
      </div>
    </section>
  );
}
