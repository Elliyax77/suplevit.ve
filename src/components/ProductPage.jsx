import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Leaf, Clock, ShoppingCart, ChevronDown, Lock } from 'lucide-react';

export default function ProductPage({ item, currency, exchangeRate, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // On desktop, translate the left content by 25vw to perfectly center it on the screen initially
  // As user scrolls, move it back to 0 (its natural position in the left column)
  const xOffset = useTransform(scrollYProgress, [0, 0.15], ['25vw', '0vw']);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const indicatorPointerEvents = useTransform(scrollYProgress, [0, 0.1], ['auto', 'none']);
  
  // On mobile, the image starts slightly larger (30%) and scales down to normal size
  const imageScaleScroll = useTransform(scrollYProgress, [0, 0.15], [isDesktop ? 1 : 1.3, 1]);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const handleAdd = () => {
    onAddToCart({
      productId: item.id,
      quantity,
      notes,
      removedIngredients: []
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        ref={containerRef}
        className="product-detail-view"
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Navbar */}
        <div className="product-detail-nav" style={{ position: 'fixed', width: '100%' }}>
          <button className="btn-back-modern" onClick={onClose}>
            <ChevronLeft size={24} />
            <span>Volver al Catálogo</span>
          </button>
        </div>

        <div className={`product-split-layout ${isDesktop ? 'desktop' : 'mobile'}`}>
          {/* Left Side (Sticky Image & Title) */}
          <div className="product-split-left">
            <motion.div 
              className="product-left-content"
              style={{ x: isDesktop ? xOffset : 0 }}
            >
              <motion.div style={{ scale: imageScaleScroll, display: 'flex', justifyContent: 'center', width: '100%', padding: isDesktop ? 0 : '20px 0' }}>
                <motion.img 
                  initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  src={item.image} 
                  alt={item.name} 
                  className="product-hero-img"
                />
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="product-hero-title"
              >
                {item.name}
              </motion.h1>

              {/* La flecha de deslizar aparece en desktop y mobile */}
              <motion.div
                  className="scroll-down-indicator"
                  style={{ 
                    opacity: indicatorOpacity,
                    pointerEvents: indicatorPointerEvents
                  }}
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>
                      Desliza hacia abajo
                    </span>
                    <ChevronDown size={32} color="var(--accent-color)" />
                  </motion.div>
                </motion.div>
            </motion.div>
          </div>

          {/* Right Side (Scrollable Info) */}
          <div className="product-split-right">
            {isDesktop && <div className="scroll-spacer" style={{ height: '100vh' }}></div>}
            <div className="product-info-container">
              {/* Badges / Quick info */}
              {( (item.badges && item.badges.length > 0) || item.previousPrice ) && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  className="product-detail-badges"
                >
                  {item.previousPrice && (
                    <span className="badge-modern" style={{ backgroundColor: '#fde047', color: '#dc2626', fontWeight: 'bold' }}>🔥 PROMOCIÓN</span>
                  )}
                  {item.badges && item.badges.map((badge, idx) => (
                    <span key={idx} className="badge-modern">{badge}</span>
                  ))}
                </motion.div>
              )}

              {/* Main Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                className="product-detail-desc"
              >
                {item.description}
              </motion.p>
              
              {/* Detailed Sections */}
              <div className="product-detail-sections">
                {item.benefitsList && (
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="info-card"
                  >
                    <h3><CheckCircle2 className="info-icon" size={20} /> Beneficios Principales</h3>
                    <ul>
                      {item.benefitsList.map((ben, i) => (
                        <li key={i}>{ben}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {item.keyIngredients && (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="info-card"
                  >
                    <h3><Leaf className="info-icon" size={20} /> Ingredientes Clave</h3>
                    <ul>
                      {item.keyIngredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {item.usageInstructions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="info-card"
                  >
                    <h3><Clock className="info-icon" size={20} /> Modo de Uso</h3>
                    <p>{item.usageInstructions}</p>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Footer Add To Cart - now relative to right column on desktop */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="product-page-footer modern-footer"
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Precio Total:</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {item.previousPrice && (
                    <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '2px' }}>
                      {currency}{(item.previousPrice * quantity).toFixed(2)}
                    </span>
                  )}
                  <span style={{ fontSize: '24px', fontWeight: '900' }}>
                    {currency}{(item.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {item.agotado ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px' }}>
                    <Lock size={20} />
                    ESTE PRODUCTO ESTÁ AGOTADO
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="quantity-controls-modern">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn-qty-mod">-</button>
                    <span className="qty-value-mod">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="btn-qty-mod">+</button>
                  </div>
                  <button onClick={handleAdd} className="btn-add-modern" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShoppingCart size={20} />
                    Añadir al Carrito
                  </button>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
