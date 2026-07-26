import React from 'react';

export default function ProductCard({ item, currency, cartQty, onClick, exchangeRate }) {
  return (
    <div 
      className="product-card" 
      onClick={onClick} 
      style={{ cursor: 'pointer' }}
    >
      <div style={{ position: 'relative' }}>
        <img src={item.image} alt={item.name} className="product-image" loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-desc" style={{ marginBottom: '8px' }}>{item.description}</p>
        
        {item.badges && item.badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {item.badges.slice(0, 3).map((badge, idx) => (
              <span key={idx} style={{ 
                backgroundColor: 'var(--secondary-color)', 
                color: 'white', 
                fontSize: '11px', 
                padding: '2px 8px', 
                borderRadius: '999px',
                fontWeight: '600'
              }}>
                {badge}
              </span>
            ))}
            {item.badges.length > 3 && (
              <span style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', fontSize: '11px', padding: '2px 6px', borderRadius: '999px', fontWeight: 'bold' }}>
                +{item.badges.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="product-footer">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="product-price">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>
          
          <button className="btn-add" style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: '600' }}>Ver producto</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
