import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Lock } from 'lucide-react';

export default function ProductCard({ item, currency, cartQty, onClick, exchangeRate, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(item.image);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(item.image);
    setHasError(false);
  }, [item.image]);

  const handleImageError = () => {
    if (!imgSrc) {
      setHasError(true);
      return;
    }
    // Attempt fallback variants in case of common typos or format mismatch
    if (imgSrc.includes('Lifebale')) {
      setImgSrc(imgSrc.replace('Lifebale', 'Lifeable'));
      return;
    }
    if (imgSrc.includes('Lifeable%20Kids.png')) {
      setImgSrc(imgSrc.replace('Lifeable%20Kids.png', 'Vitamina%20B6%20Lifebale%20Kids.png'));
      return;
    }
    if (imgSrc.endsWith('.webp')) {
      setImgSrc(imgSrc.replace(/\.webp$/i, '.png'));
      return;
    }
    if (imgSrc.endsWith('.png')) {
      setImgSrc(imgSrc.replace(/\.png$/i, '.webp'));
      return;
    }
    setHasError(true);
  };

  return (
    <div 
      className="product-card" 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer',
        border: item.previousPrice ? '2px solid #facc15' : 'none'
      }}
    >
      <div className="product-image-wrapper">
        {hasError || !imgSrc ? (
          <div className="product-image-fallback" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.25)',
            padding: '12px'
          }}>
            <img 
              src="/suplevit-logo.png" 
              alt="Suplevit" 
              style={{ maxHeight: '70px', maxWidth: '80%', objectFit: 'contain', opacity: 0.85 }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', fontWeight: 600 }}>
              {item.brand || 'Suplevit'}
            </span>
          </div>
        ) : (
          <img 
            src={imgSrc} 
            alt={item.name} 
            className="product-image" 
            loading="lazy" 
            onError={handleImageError} 
          />
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-desc" style={{ marginBottom: '8px' }}>{item.description}</p>

        <div className="product-footer">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="product-price">
              ${item.priceBcv.toFixed(2)}
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
              disabled={item.agotado || (cartQty >= item.stock)}
              onClick={(e) => {
                e.stopPropagation(); // prevent opening the modal
                if (!item.agotado && (cartQty < item.stock) && onAddToCart) {
                  onAddToCart({ productId: item.id, quantity: 1, notes: '', removedIngredients: [] });
                }
              }}
              style={{ 
                background: (item.agotado || cartQty >= item.stock) ? '#ef4444' : '#facc15',
                color: (item.agotado || cartQty >= item.stock) ? 'white' : '#1e3a8a',
                border: 'none',
                width: '36px',
                height: '36px',
                minWidth: '36px',
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (item.agotado || cartQty >= item.stock) ? 'not-allowed' : 'pointer',
                opacity: (item.agotado || cartQty >= item.stock) ? 0.7 : 1
              }}
            >
              {(item.agotado || cartQty >= item.stock) ? (
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
