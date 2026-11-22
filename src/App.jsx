import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import TopNav from './components/TopNav.jsx';
import HeroSection from './components/HeroSection.jsx';
import BenefitsSection from './components/BenefitsSection.jsx';
import ProductCard from './components/ProductCard.jsx';
import Cart from './components/Cart.jsx';
import ProductPage from './components/ProductPage.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useSuplevitData } from './context/SuplevitDataContext.jsx';
import './index.css';

function App() {
  const {
    restaurant,
    theme,
    categories,
    isLoading,
    exchangeRate,
    adminOpen,
    setAdminOpen
  } = useSuplevitData();

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/favicon.svg';
  }, []);

  const computedRestaurant = { ...restaurant, isOpen: true, exchangeRate };
  const allItems = categories.flatMap(c => c.items || []);

  const handleProductClick = (item) => {
    setScrollPosition(window.scrollY);
    setSelectedItem(item);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (details) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(cartItem => 
        cartItem.productId === details.productId &&
        cartItem.notes === details.notes &&
        JSON.stringify(cartItem.removedIngredients) === JSON.stringify(details.removedIngredients)
      );

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += details.quantity;
        return newCart;
      } else {
        return [...prev, {
          cartItemId: Date.now().toString(),
          ...details
        }];
      }
    });

    if (selectedItem) {
      setSelectedItem(null);
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
    }
  };

  const getProductTotalQty = (productId) => {
    return cart.reduce((total, cartItem) => {
      if (cartItem.productId === productId) return total + cartItem.quantity;
      return total;
    }, 0);
  };
  
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleUpdateCartItemQty = (cartItemId, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, quantity: item.quantity + change };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <WelcomeModal />
      
      {!selectedItem && (
        <TopNav 
          cartCount={totalCartItems} 
          onCartClick={() => setIsCartOpen(true)} 
        />
      )}
      
      {selectedItem ? (
        <ProductPage 
          item={selectedItem} 
          currency={restaurant.currency}
          exchangeRate={exchangeRate}
          cartQty={getProductTotalQty(selectedItem.id)}
          onClose={() => {
            setSelectedItem(null);
            setTimeout(() => window.scrollTo(0, scrollPosition), 0);
          }}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
          <div className="content-wrapper landing-mode" style={{ paddingTop: '80px' }}>
            <HeroSection />
            <BenefitsSection />

            <main id="catalog" className="catalog-section">
              <div className="catalog-header">
                <h2>Explora por Categoría</h2>
                <p>Encuentra el suplemento ideal para las necesidades de tu pequeño.</p>
                
                <div className="conditions-filter">
                  <button 
                    className={`condition-pill ${!selectedCondition ? 'active' : ''}`}
                    onClick={() => setSelectedCondition(null)}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id || cat.name}
                      className={`condition-pill ${selectedCondition === cat.name ? 'active' : ''}`}
                      onClick={() => setSelectedCondition(cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {categories.map(category => {
                if (selectedCondition && category.name !== selectedCondition) return null;
                
                const filteredItems = category.items || [];
                
                if (filteredItems.length === 0) return null;

                return (
                  <section key={category.id} className="category-section">
                    <div className="product-list">
                      {filteredItems.map(item => (
                        <ProductCard 
                          key={item.id} 
                          item={item} 
                          currency={restaurant.currency}
                          cartQty={getProductTotalQty(item.id)}
                          exchangeRate={exchangeRate}
                          onClick={() => handleProductClick(item)}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </main>
            
            <footer className="app-footer" style={{ padding: '24px 20px', borderTop: '1px dashed var(--border-color)' }}>
              <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                <p 
                  className="copyright" 
                  style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onClick={() => setAdminOpen(true)}
                  title="Panel de Administración (Ctrl+Shift+S)"
                >
                  © {new Date().getFullYear()} Suplevit. Todos los derechos reservados.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p className="developer-credit" style={{ fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.8, margin: 0 }}>
                    Desarrollado por <a href="https://wa.me/584244980621?text=Hola%2C%20vi%20tu%20trabajo%20y%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20desarrollo%20de%20p%C3%A1ginas%20web%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" className="developer-link" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}><strong style={{ color: 'var(--text-primary)' }}>Elías Espinal</strong></a>
                  </p>
                  <button
                    onClick={() => setAdminOpen(true)}
                    title="Panel de Desarrollador (Ctrl+Shift+S)"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      opacity: 0.35,
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.35'}
                  >
                    <Lock size={12} />
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}

      <Cart 
        cart={cart} 
        items={allItems} 
        currency={restaurant.currency} 
        restaurant={computedRestaurant} 
        onUpdateQty={handleUpdateCartItemQty}
        onRemoveItem={handleRemoveCartItem}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Panel de Desarrollador & Dashboard Administrativo */}
      {adminOpen && (
        <AdminDashboard 
          isOpen={adminOpen} 
          onClose={() => setAdminOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;
