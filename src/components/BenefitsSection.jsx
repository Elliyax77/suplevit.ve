import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Moon, ShieldCheck, Heart } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Brain size={32} color="var(--primary-color)" />,
      title: "Desarrollo Cognitivo",
      description: "Fórmulas diseñadas para potenciar la memoria y concentración desde temprana edad."
    },
    {
      icon: <Moon size={32} color="var(--primary-color)" />,
      title: "Sueño Reparador",
      description: "Ingredientes relajantes que ayudan a regular el ciclo del sueño para un mejor descanso."
    },
    {
      icon: <ShieldCheck size={32} color="var(--primary-color)" />,
      title: "Inmunidad Fuerte",
      description: "Refuerza las defensas naturales del cuerpo con vitaminas esenciales."
    },
    {
      icon: <Heart size={32} color="var(--primary-color)" />,
      title: "Salud Integral",
      description: "Apoyo digestivo y nutricional con probióticos y vitaminas 100% orgánicas."
    }
  ];

  return (
    <section className="benefits-container">
      <div className="benefits-header">
        <h2>¿Por qué Suplevit?</h2>
        <p>Cuidado experto para cada etapa de su crecimiento</p>
      </div>
      
      <div className="benefits-grid">
        {benefits.map((b, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="benefit-card"
          >
            <div className="benefit-icon-wrapper">
              {b.icon}
            </div>
            <h3>{b.title}</h3>
            <p>{b.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
