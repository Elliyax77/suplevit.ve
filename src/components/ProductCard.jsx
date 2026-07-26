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
