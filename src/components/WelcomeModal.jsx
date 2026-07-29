import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya decidió no volver a ver el mensaje
    const dontShow = localStorage.getItem('suplevit_hide_welcome');
    if (!dontShow) {
      // Mostrar el modal con un pequeño retraso para que la pantalla cargue primero
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('suplevit_hide_welcome', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              padding: '32px 24px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              color: '#000000',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#000000' }}>
              ¡Bienvenido a Suplevit! 🩵
            </h2>
            
            <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#333333', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <p>En esta página puedes ver todos los productos que tenemos disponibles para entrega y envío inmediato‼️</p>
              
              <p>Puedes hacer tu pedido fácilmente, agrega al carrito los productos que desees, completa tus datos, selecciona cómo prefieres recibir tu producto y el método de pago🌟</p>
              
              <p>Luego te enviaremos a nuestro WhatsApp para verificar tu pago y confirmar tu pedido🫶🏼 (Ahí nos puedes enviar el comprobante del pago y tu ubicación si deseas delivery)</p>
            </div>

            <button 
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--primary-text)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Ok, quiero ver el Catálogo
            </button>
            
            <button 
              onClick={handleDontShowAgain}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              No volver a mostrar este mensaje
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
