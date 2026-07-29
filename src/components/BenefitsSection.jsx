import React from 'react';
import { motion } from 'framer-motion';

export default function BenefitsSection() {
  return (
    <section className="benefits-container" style={{ paddingBottom: '60px' }}>
      <div className="benefits-header">
        <h2>¿Por qué Suplevit?</h2>
        <p>Cuidado experto para cada etapa de su crecimiento</p>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          style={{ 
            maxWidth: '800px', 
            margin: '0 auto'
          }}
        >
          <p style={{ fontSize: '20px', lineHeight: '1.8', color: 'white', fontWeight: '500', textAlign: 'center', margin: 0 }}>
            Todos nuestros productos son importados de Estados Unidos 🇺🇸. Son de excelente calidad, con fórmulas limpias, sin gluten, sin azúcar, libres de metales pesados, sin conservantes ni colorantes artificiales, especialmente para peques🩵
          </p>
        </motion.div>
      </div>
    </section>
  );
}
