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
          style={{ marginBottom: '30px', fontSize: '16px', maxWidth: '400px', lineHeight: '1.6' }}
        >
          Somos tienda online, nos ubicamos Valencia - Venezuela, tenemos delivery, pick up y envíos a nivel nacional con la agencia de tu preferencia (MRW, Tealca, Zoom)🚚
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <a 
            href="https://www.instagram.com/suplevit.ve?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '12px 24px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
              color: 'white', borderRadius: '99px', textDecoration: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            Instagram
          </a>
          <a 
            href="https://wa.me/584224657359"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '12px 24px', background: '#25D366', 
              color: 'white', borderRadius: '99px', textDecoration: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            WhatsApp
          </a>
        </motion.div>
        
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
