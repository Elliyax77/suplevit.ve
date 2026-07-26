import React from 'react';
import { ShoppingCart, Plus, Lock } from 'lucide-react';

export default function ProductCard({ item, currency, cartQty, onClick, exchangeRate, onAddToCart }) {
  return (
    <div 
      className="product-card" 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer',
        border: item.previousPrice ? '2px solid #facc15' : 'none'
      }}
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
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-add" style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: '600' }}>Ver producto</span>
              </span>
            </button>
            
            <button 
              className="btn-quick-add"
              disabled={item.agotado}
              onClick={(e) => {
                e.stopPropagation(); // prevent opening the modal
                if (!item.agotado && onAddToCart) {
                  onAddToCart({ productId: item.id, quantity: 1, notes: '', removedIngredients: [] });
                }
              }}
              style={{ 
                background: item.agotado ? '#ef4444' : '#facc15',
                color: item.agotado ? 'white' : '#1e3a8a',
                border: 'none',
                width: '36px',
                height: '36px',
                minWidth: '36px',
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: item.agotado ? 'not-allowed' : 'pointer'
              }}
            >
              {item.agotado ? (
                <Lock size={16} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-2px' }}>
                  <ShoppingCart size={14} />
                  <Plus size={10} strokeWidth={3} style={{ marginLeft: '-2px', marginTop: '-8px' }} />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
