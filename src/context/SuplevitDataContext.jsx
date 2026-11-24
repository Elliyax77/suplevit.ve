import React, { createContext, useContext, useState, useEffect } from 'react';
import menuData from '../data/menu.json';
import { fetchProductsFromSheet } from '../utils/sheets.js';

const STORAGE_KEY = 'suplevit_custom_cms_data_v1';
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ThpuQvGzyBjZNuZr72oJLmY3pTKRDVoorzMU2RiaRi8/export?format=csv';

const SuplevitDataContext = createContext(null);

export function SuplevitDataProvider({ children }) {
  const [restaurant, setRestaurant] = useState(menuData.restaurant);
  const [theme, setTheme] = useState(menuData.theme);
  const [categories, setCategories] = useState(menuData.categories);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [hasCustomEdits, setHasCustomEdits] = useState(false);

  // 1. Carga inicial: LocalStorage primero, luego Google Sheet / menuData
  useEffect(() => {
    // Tasa BCV Dólar
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then(res => res.json())
      .then(data => {
        if (data && data.promedio) {
          setExchangeRate(data.promedio);
        }
      })
      .catch(err => console.error('Error fetching BCV rate:', err));

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.restaurant) setRestaurant(parsed.restaurant);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.categories && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          setCategories(parsed.categories);
        }
        setHasCustomEdits(true);
        setIsLoading(false);
        document.title = (parsed.restaurant && parsed.restaurant.name) || 'Suplevit';
        return;
      } catch (e) {
        console.error('Error leyendo datos locales guardados:', e);
      }
    }

    // Si no hay datos guardados, consultar Google Sheet
    fetchProductsFromSheet(SHEET_CSV_URL).then(data => {
      setRestaurant(data.restaurant);
      setTheme(data.theme);
      setCategories(data.categories);
      setIsLoading(false);
      document.title = data.restaurant.name;
    });
  }, []);

  // Sincronizar colores del tema
  useEffect(() => {
    if (theme && theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
      document.documentElement.style.setProperty('--primary-hover', theme.primaryColor + 'cc');
    }
  }, [theme]);

  // Triggers de acceso oculto: atajos de teclado y URL hash
  useEffect(() => {
    const checkUrlTrigger = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#dashboard' || search.includes('admin=true')) {
        setAdminOpen(true);
      }
    };
    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);

    const handleKeyDown = (e) => {
      // Atajos: Ctrl+Shift+S (Suplevit) o Ctrl+Shift+K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        setAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Guardado seguro en LocalStorage
  const persistData = (newRestaurant, newTheme, newCategories) => {
    const payload = {
      restaurant: newRestaurant,
      theme: newTheme,
      categories: newCategories,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setHasCustomEdits(true);
    } catch (err) {
      console.error('Error guardando en localStorage:', err);
    }
  };

  // CRUD de Productos / Suplementos
  const updateProduct = (updatedProduct, targetCategoryName) => {
    setCategories(prevCats => {
      // 1. Quitar el producto de su ubicación actual si cambió de categoría
      let cleanedCats = prevCats.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== updatedProduct.id)
      }));

      // 2. Determinar la categoría destino
      const destCatName = targetCategoryName || (
        prevCats.find(c => c.items.some(i => i.id === updatedProduct.id))?.name || 'Catálogo de Suplementos'
      );

      let found = false;
      let nextCats = cleanedCats.map(cat => {
        if (cat.name.toLowerCase() === destCatName.toLowerCase()) {
          found = true;
          return {
            ...cat,
            items: [updatedProduct, ...cat.items]
          };
        }
        return cat;
      });

      if (!found) {
        nextCats.push({
          id: `c_${Date.now()}`,
          name: destCatName,
          items: [updatedProduct]
        });
      }

      persistData(restaurant, theme, nextCats);
      return nextCats;
    });
  };

  const addProduct = (newProduct, targetCategoryName) => {
    const productId = newProduct.id || `p_${Date.now()}`;
    const productToAdd = { ...newProduct, id: productId };
    const destCatName = targetCategoryName || 'Catálogo de Suplementos';

    setCategories(prevCats => {
      let found = false;
      let nextCats = prevCats.map(cat => {
        if (cat.name.toLowerCase() === destCatName.toLowerCase()) {
          found = true;
          return {
            ...cat,
            items: [productToAdd, ...cat.items]
          };
        }
        return cat;
      });

      if (!found) {
        nextCats.push({
          id: `c_${Date.now()}`,
          name: destCatName,
          items: [productToAdd]
        });
      }

      persistData(restaurant, theme, nextCats);
      return nextCats;
    });

    return productId;
  };

  const deleteProduct = (productId) => {
    setCategories(prevCats => {
      const nextCats = prevCats.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== productId)
      }));
      persistData(restaurant, theme, nextCats);
      return nextCats;
    });
  };

  const updateRestaurantInfo = (info) => {
    const updated = { ...restaurant, ...info };
    setRestaurant(updated);
    persistData(updated, theme, categories);
  };

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
    persistData(restaurant, theme, newCategories);
  };

  const addCategory = (categoryName) => {
    if (!categoryName || !categoryName.trim()) return;
    const trimmed = categoryName.trim();
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    const newCat = {
      id: `c_${Date.now()}`,
      name: trimmed,
      items: []
    };
    const nextCats = [...categories, newCat];
    setCategories(nextCats);
    persistData(restaurant, theme, nextCats);
  };

  const deleteCategory = (categoryId) => {
    const nextCats = categories.filter(c => c.id !== categoryId);
    setCategories(nextCats);
    persistData(restaurant, theme, nextCats);
  };

  // Mover producto hacia arriba o hacia abajo en el orden de la categoría
  const moveProductOrder = (productId, direction) => {
    setCategories(prevCats => {
      const nextCats = prevCats.map(cat => {
        const index = cat.items.findIndex(item => item.id === productId);
        if (index === -1) return cat;

        const newItems = [...cat.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return cat;

        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, movedItem);

        return {
          ...cat,
          items: newItems
        };
      });

      persistData(restaurant, theme, nextCats);
      return nextCats;
    });
  };

  // Aplicar un criterio de ordenamiento a todas las categorías y guardarlo permanentemente
  const applySortingToCategories = (criteria) => {
    setCategories(prevCats => {
      const sortFn = (a, b) => {
        switch (criteria) {
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' });
          case 'price-asc':
            return (Number(a.priceBcv || a.price) || 0) - (Number(b.priceBcv || b.price) || 0);
          case 'price-desc':
            return (Number(b.priceBcv || b.price) || 0) - (Number(a.priceBcv || a.price) || 0);
          case 'stock-desc':
            return (Number(b.stock) || 0) - (Number(a.stock) || 0);
          case 'stock-asc':
            return (Number(a.stock) || 0) - (Number(b.stock) || 0);
          case 'brand-asc':
            return (a.brand || '').localeCompare(b.brand || '', 'es', { sensitivity: 'base' });
          default:
            return 0;
        }
      };

      const nextCats = prevCats.map(cat => ({
        ...cat,
        items: [...cat.items].sort(sortFn)
      }));

      persistData(restaurant, theme, nextCats);
      return nextCats;
    });
  };

  const resetToDefaults = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCustomEdits(false);
    setIsLoading(true);
    const data = await fetchProductsFromSheet(SHEET_CSV_URL);
    setRestaurant(data.restaurant);
    setTheme(data.theme);
    setCategories(data.categories);
    setIsLoading(false);
  };

  const exportBackupData = () => {
    const payload = {
      system: 'Suplevit Admin CMS',
      version: '1.0',
      exportDate: new Date().toISOString(),
      restaurant,
      theme,
      categories
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suplevit_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackupData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        throw new Error('El archivo no contiene un catálogo válido de categorías');
      }
      if (parsed.restaurant) setRestaurant(parsed.restaurant);
      if (parsed.theme) setTheme(parsed.theme);
      setCategories(parsed.categories);
      persistData(parsed.restaurant || restaurant, parsed.theme || theme, parsed.categories);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <SuplevitDataContext.Provider value={{
      restaurant,
      theme,
      categories,
      isLoading,
      exchangeRate,
      adminOpen,
      setAdminOpen,
      hasCustomEdits,
      updateProduct,
      addProduct,
      deleteProduct,
      updateRestaurantInfo,
      updateCategories,
      addCategory,
      deleteCategory,
      moveProductOrder,
      applySortingToCategories,
      resetToDefaults,
      exportBackupData,
      importBackupData
    }}>
      {children}
    </SuplevitDataContext.Provider>
  );
}

export function useSuplevitData() {
  const ctx = useContext(SuplevitDataContext);
  if (!ctx) {
    throw new Error('useSuplevitData debe ser utilizado dentro de SuplevitDataProvider');
  }
  return ctx;
}
