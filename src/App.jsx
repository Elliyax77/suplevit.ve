import React, { useState, useEffect } from 'react'
import TopNav from './components/TopNav.jsx'
import HeroSection from './components/HeroSection.jsx'
import BenefitsSection from './components/BenefitsSection.jsx'
import ProductCard from './components/ProductCard.jsx'
import Cart from './components/Cart.jsx'
import ProductPage from './components/ProductPage.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import menuData from './data/menu.json'
import { fetchProductsFromSheet } from './utils/sheets.js'
import './index.css'

// Enlace CSV exportado de Google Sheets
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ThpuQvGzyBjZNuZr72oJLmY3pTKRDVoorzMU2RiaRi8/export?format=csv';

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedCondition, setSelectedCondition] = useState(null)
  const [restaurant, setRestaurant] = useState(menuData.restaurant)
  const [theme, setTheme] = useState(menuData.theme)
  const [categories, setCategories] = useState(menuData.categories)
  const [isLoading, setIsLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Obtener tasa BCV Euro
    fetch('https://ve.dolarapi.com/v1/euros/oficial')
      .then(response => response.json())
      .then(data => {
        if (data && data.promedio) {
          setExchangeRate(data.promedio);
        }
      })
      .catch(error => console.error('Error fetching BCV rate:', error));

    // Obtener productos del Sheet
    fetchProductsFromSheet(SHEET_CSV_URL).then(data => {
      setRestaurant(data.restaurant);
      setTheme(data.theme);
      setCategories(data.categories);
      setIsLoading(false);
      document.title = data.restaurant.name;
    });

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/favicon.svg';
  }, []);

  const computedRestaurant = { ...restaurant, isOpen: true, exchangeRate };
  const allItems = categories.flatMap(c => c.items)

  useEffect(() => {
    if (theme && theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
      document.documentElement.style.setProperty('--primary-hover', theme.primaryColor + 'cc')
    }
  }, [theme])

  const handleProductClick = (item) => {
    setScrollPosition(window.scrollY);
    setSelectedItem(item);
    window.scrollTo(0, 0);
  }

  const handleAddToCart = (details) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(cartItem => 
        cartItem.productId === details.productId &&
        cartItem.notes === details.notes &&
        JSON.stringify(cartItem.removedIngredients) === JSON.stringify(details.removedIngredients)
      )

      if (existingIndex >= 0) {
        const newCart = [...prev]
        newCart[existingIndex].quantity += details.quantity
        return newCart
      } else {
        return [...prev, {
          cartItemId: Date.now().toString(),
          ...details
        }]
      }
    });

    if (selectedItem) {
      setSelectedItem(null);
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
    }
  }

  const getProductTotalQty = (productId) => {
    return cart.reduce((total, cartItem) => {
      if (cartItem.productId === productId) return total + cartItem.quantity
      return total
    }, 0)
  }
  
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleUpdateCartItemQty = (cartItemId, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, quantity: item.quantity + change }
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const handleRemoveCartItem = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId))
  }

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
                      key={cat.name}
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
                
                const filteredItems = category.items;
                
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
                )
              })}
            </main>
            
            <footer className="app-footer modern-app-footer">
              <div className="footer-content">
                <img src="/suplevit-logo.png" alt="Suplevit Logo" className="footer-logo" />
                <p>Cuidando el futuro, hoy.</p>
                <div className="footer-links">
                  <a href="#">Términos</a>
                  <a href="#">Privacidad</a>
                  <a href="#">Contacto</a>
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
    </div>
  )
}

export default App
