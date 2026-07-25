import React from 'react';

export default function ProductCard({ item, currency, cartQty, onClick, exchangeRate }) {
  return (
    <div 
      className={`product-card ${item.agotado ? 'agotado' : ''} ${item.previousPrice && !item.agotado ? 'promo-card' : ''}`} 
      onClick={item.agotado ? undefined : onClick} 
      style={{ cursor: item.agotado ? 'not-allowed' : 'pointer', opacity: item.agotado ? 0.6 : 1 }}
    >
      <div style={{ position: 'relative' }}>
        <img src={item.image} alt={item.name} className="product-image" loading="lazy" style={{ filter: item.agotado ? 'grayscale(100%)' : 'none' }} />
        {item.agotado && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
            AGOTADO
          </div>
        )}
      </div>
      <div className="product-info">
        {!item.agotado && item.previousPrice && (
          <div style={{ 
            fontWeight: '900', 
            fontStyle: 'italic', 
            fontSize: '12px', 
            letterSpacing: '1px', 
            marginBottom: '6px', 
            textTransform: 'uppercase',
            color: '#dc2626',
            backgroundColor: '#fde047',
            display: 'inline-block',
            alignSelf: 'flex-start',
            padding: '2px 8px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            🔥 Promoción
          </div>
        )}
        <h3 className="product-name" style={{ marginTop: (!item.agotado && item.previousPrice) ? '0' : undefined }}>{item.name}</h3>
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
            {item.previousPrice && (
              <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '2px' }} className="promo-old-price">
                {currency}{item.previousPrice.toFixed(2)}
              </span>
            )}
            <span className="product-price">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>
          
          {item.agotado ? (
            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>Agotado</span>
          ) : (
            <button className="btn-add" style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: '600' }}>Ver producto</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
