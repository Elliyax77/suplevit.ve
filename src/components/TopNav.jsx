import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function TopNav({ cartCount, onCartClick }) {
  return (
    <nav className="top-nav">
      <div className="nav-logo">
        <img src="/suplevit-logo.png" alt="Suplevit Logo" className="nav-logo-img" />
      </div>
      
      <div className="nav-actions">
        <button 
          className="nav-link-btn" 
          onClick={() => {
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Productos
        </button>
        <button className="nav-cart-btn" onClick={onCartClick}>
          <ShoppingCart size={24} />
          {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
