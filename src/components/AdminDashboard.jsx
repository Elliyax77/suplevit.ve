import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  LogOut,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Save,
  AlertTriangle,
  Sparkles,
  Phone,
  MessageCircle,
  DollarSign,
  Tag,
  Layers,
  RefreshCw,
  Copy,
  CheckCircle2,
  ChevronRight,
  Store,
  ShieldCheck,
  Pill,
  FolderPlus
} from 'lucide-react';
import { useSuplevitData } from '../context/SuplevitDataContext';
import './AdminDashboard.css';

const MASTER_PASSWORD = 'suplevit2026';

export default function AdminDashboard({ isOpen, onClose }) {
  const {
    restaurant,
    categories,
    exchangeRate,
    hasCustomEdits,
    updateProduct,
    addProduct,
    deleteProduct,
    updateRestaurantInfo,
    updateCategories,
    addCategory,
    deleteCategory,
    resetToDefaults,
    exportBackupData,
    importBackupData
  } = useSuplevitData();

  // 1. Autenticación y Seguridad
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('suplevit_dev_session') === 'active';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // 2. Navegación
  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'imagenes' | 'categorias' | 'tienda' | 'respaldos'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');

  // 3. Modal de Producto (Edición / Creación)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    brand: '',
    categoryName: '',
    priceBcv: 0,
    pricePromoUsd: 0,
    stock: 10,
    description: '',
    image: '',
    nutritionImage: '',
    concentration: '',
    services: '',
    flavor: '',
    presentation: '',
    badgesStr: '',
    ingredientsStr: '',
    benefitsStr: '',
    usageInstructions: ''
  });

  // 4. Tienda Form
  const [storeForm, setStoreForm] = useState({
    name: restaurant.name || 'Suplevit',
    phone: restaurant.phone || '584224657359',
    greeting: restaurant.greeting || '¡Hola Suplevit! Me gustaría hacer el siguiente pedido:',
    currency: restaurant.currency || '$',
    location: restaurant.location || 'Tienda Online',
    city: restaurant.city || 'Valencia, Venezuela',
    description: restaurant.description || ''
  });

  // 5. Categoría nueva
  const [newCatInput, setNewCatInput] = useState('');

  // 6. Notificaciones & Modales de Confirmación
  const [toastMessage, setToastMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Refs para subida de imágenes y respaldos
  const mainImageFileRef = useRef(null);
  const nutritionImageFileRef = useRef(null);
  const backupFileInputRef = useRef(null);
  const cardMainImageFileRef = useRef(null);
  const cardNutritionImageFileRef = useRef(null);
  const [uploadingTargetId, setUploadingTargetId] = useState(null);

  // Temporizador de bloqueo tras 5 intentos fallidos
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  // Sincronizar datos de tienda si cambian
  useEffect(() => {
    setStoreForm({
      name: restaurant.name || 'Suplevit',
      phone: restaurant.phone || '584224657359',
      greeting: restaurant.greeting || '¡Hola Suplevit! Me gustaría hacer el siguiente pedido:',
      currency: restaurant.currency || '$',
      location: restaurant.location || 'Tienda Online',
      city: restaurant.city || 'Valencia, Venezuela',
      description: restaurant.description || ''
    });
  }, [restaurant]);

  // Lista plana de todos los productos deduplicados
  const allProducts = useMemo(() => {
    const map = new Map();
    categories.forEach(cat => {
      (cat.items || []).forEach(item => {
        if (!map.has(item.id)) {
          map.set(item.id, {
            ...item,
            categoryName: cat.name,
            categoryId: cat.id
          });
        }
      });
    });
    return Array.from(map.values());
  }, [categories]);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return allProducts.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCatFilter === 'ALL' || item.categoryName === selectedCatFilter;

      return matchesSearch && matchesCat;
    });
  }, [allProducts, searchQuery, selectedCatFilter]);

  // Disparar mensaje Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Manejador de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (passwordInput.trim() === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('suplevit_dev_session', 'active');
      setAuthError('');
      setPasswordInput('');
      setAttempts(0);
      showToast('Sesión de Desarrollador iniciada con éxito');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutTimer(30);
        setAuthError('Demasiados intentos fallidos. Bloqueado temporalmente por 30 segundos.');
      } else {
        setAuthError(`Clave incorrecta. Intentos restantes: ${5 - newAttempts}`);
      }
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('suplevit_dev_session');
    showToast('Sesión cerrada correctamente');
  };

  // Abrir modal para crear producto
  const handleOpenCreateProduct = () => {
    setIsNewProduct(true);
    setProductForm({
      id: `p_${Date.now()}`,
      name: '',
      brand: '',
      categoryName: categories[0]?.name || 'Catálogo de Suplementos',
      priceBcv: 19.99,
      pricePromoUsd: 17.50,
      stock: 15,
      description: '',
      image: '',
      nutritionImage: '',
      concentration: '',
      services: '',
      flavor: '',
      presentation: 'Gomitas',
      badgesStr: 'Recomendado por pediatras, Sin azúcar',
      ingredientsStr: '',
      benefitsStr: '',
      usageInstructions: ''
    });
    setEditingProduct(true);
  };

  // Abrir modal para editar producto
  const handleOpenEditProduct = (item) => {
    setIsNewProduct(false);
    setProductForm({
      id: item.id,
      name: item.name || '',
      brand: item.brand || '',
      categoryName: item.categoryName || categories[0]?.name || 'Catálogo de Suplementos',
      priceBcv: item.priceBcv || item.price || 0,
      pricePromoUsd: item.pricePromoUsd || 0,
      stock: item.stock !== undefined ? item.stock : 10,
      description: item.description || '',
      image: item.image || '',
      nutritionImage: item.nutritionImage || '',
      concentration: item.concentration || '',
      services: item.services || '',
      flavor: item.flavor || '',
      presentation: item.presentation || '',
      badgesStr: Array.isArray(item.badges) ? item.badges.join(', ') : '',
      ingredientsStr: Array.isArray(item.keyIngredients) ? item.keyIngredients.join('\n') : '',
      benefitsStr: Array.isArray(item.benefitsList) ? item.benefitsList.join('\n') : '',
      usageInstructions: item.usageInstructions || ''
    });
    setEditingProduct(item);
  };

  // Duplicar producto
  const handleDuplicateProduct = (item) => {
    const duplicated = {
      ...item,
      id: `p_${Date.now()}`,
      name: `${item.name} (Copia)`
    };
    addProduct(duplicated, item.categoryName);
    showToast(`Copia creada: "${duplicated.name}"`);
  };

  // Guardar producto (Crear o Actualizar)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Por favor indica el nombre del suplemento');
      return;
    }

    const badges = productForm.badgesStr
      ? productForm.badgesStr.split(',').map(b => b.trim()).filter(Boolean)
      : [];

    const keyIngredients = productForm.ingredientsStr
      ? productForm.ingredientsStr.split('\n').map(i => i.trim()).filter(Boolean)
      : [];

    const benefitsList = productForm.benefitsStr
      ? productForm.benefitsStr.split('\n').map(b => b.trim()).filter(Boolean)
      : [];

    const finalProduct = {
      id: productForm.id,
      name: productForm.name.trim(),
      brand: productForm.brand.trim(),
      priceBcv: parseFloat(productForm.priceBcv) || 0,
      pricePromoUsd: parseFloat(productForm.pricePromoUsd) || 0,
      price: parseFloat(productForm.priceBcv) || 0,
      stock: parseInt(productForm.stock, 10) || 0,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      nutritionImage: productForm.nutritionImage.trim(),
      concentration: productForm.concentration.trim() || null,
      services: productForm.services.trim() || null,
      flavor: productForm.flavor.trim() || null,
      presentation: productForm.presentation.trim() || null,
      badges,
      keyIngredients,
      benefitsList,
      usageInstructions: productForm.usageInstructions.trim()
    };

    if (isNewProduct) {
      addProduct(finalProduct, productForm.categoryName);
      showToast(`Suplemento "${finalProduct.name}" agregado`);
    } else {
      updateProduct(finalProduct, productForm.categoryName);
      showToast(`Suplemento "${finalProduct.name}" actualizado`);
    }

    setEditingProduct(null);
  };

  // Eliminar producto
  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast('Suplemento eliminado correctamente');
  };

  // Manejo de carga de archivos (Base64) para el formulario modal
  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setProductForm(prev => ({
        ...prev,
        [field]: base64
      }));
      showToast(field === 'image' ? 'Foto de producto cargada' : 'Tabla nutricional cargada');
    };
    reader.readAsDataURL(file);
  };

  // Manejo de carga de archivos directa en pestaña Imágenes
  const handleDirectImageUpload = (e, item, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const updated = {
        ...item,
        [field]: base64
      };
      updateProduct(updated, item.categoryName);
      showToast(`Imagen actualizada para "${item.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Guardar información de la tienda
  const handleSaveStoreInfo = (e) => {
    e.preventDefault();
    updateRestaurantInfo(storeForm);
    showToast('Datos de la tienda y WhatsApp guardados con éxito');
  };

  // Crear categoría
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setNewCatInput('');
    showToast(`Categoría "${newCatInput.trim()}" agregada`);
  };

  // Importar archivo de respaldo JSON
  const handleImportBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonContent = event.target.result;
      const result = importBackupData(jsonContent);
      if (result.success) {
        showToast('Respaldo JSON importado y aplicado correctamente');
      } else {
        alert(`Error al importar respaldo: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Restablecer de fábrica
  const handleConfirmReset = async () => {
    await resetToDefaults();
    setResetConfirmOpen(false);
    showToast('Catálogo restablecido a valores originales de fábrica');
  };

  if (!isOpen) return null;

  return (
    <div className="suplevit-admin-overlay">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. LOCK SCREEN / VAULT DE ACCESO SEGURO                        */}
      {/* ============================================================== */}
      {!isAuthenticated ? (
        <div className="suplevit-auth-vault">
          <div className="auth-card">
            <button className="auth-close-btn" onClick={onClose} title="Volver a la tienda">
              <X size={20} />
            </button>

            <div className="auth-badge-icon">
              <Pill size={32} className="icon-pulse" />
            </div>

            <h2 className="auth-title">Suplevit Developer Vault</h2>
            <p className="auth-desc">
              Panel de control y gestión en vivo de suplementos, precios, inventario e imágenes.
            </p>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-input-group">
                <Key size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Introduce la contraseña maestra..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={lockoutTimer > 0}
                  autoFocus
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {authError && <div className="auth-error-msg">{authError}</div>}

              {lockoutTimer > 0 && (
                <div className="auth-lockout-msg">
                  <Lock size={16} />
                  <span>Espera {lockoutTimer}s para volver a intentar</span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={lockoutTimer > 0 || !passwordInput}
              >
                <Unlock size={18} />
                <span>Desbloquear Dashboard</span>
              </button>
            </form>

            <div className="auth-card-footer">
              <ShieldCheck size={14} />
              <span>Acceso restringido para administradores autorizados</span>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. DASHBOARD ADMINISTRATIVO PRINCIPAL                           */
        /* ============================================================== */
        <div className="suplevit-dashboard-container">
          {/* Top Bar */}
          <header className="dashboard-topbar">
            <div className="topbar-left">
              <div className="brand-pill">
                <Pill size={20} className="brand-icon" />
                <div className="brand-info">
                  <span className="brand-name">Suplevit Admin</span>
                  <span className="brand-badge">Panel de Desarrollador</span>
                </div>
              </div>
              <div className="status-live-indicator">
                <span className="pulsing-dot"></span>
                <span>Editor en Vivo</span>
              </div>
            </div>

            <div className="topbar-right">
              <button
                className="btn-action-tool btn-preview"
                onClick={onClose}
                title="Cerrar el panel y ver los cambios en la tienda"
              >
                <Eye size={16} />
                <span>Ver Tienda</span>
              </button>

              <button
                className="btn-action-tool btn-export"
                onClick={exportBackupData}
                title="Descargar copia de seguridad en archivo JSON"
              >
                <Download size={16} />
                <span>Exportar JSON</span>
              </button>

              <button
                className="btn-action-tool btn-reset"
                onClick={() => setResetConfirmOpen(true)}
                title="Restablecer datos originales de fábrica (limpia cambios locales)"
              >
                <RotateCcw size={16} />
                <span>Restablecer</span>
              </button>

              <button
                className="btn-action-tool btn-logout"
                onClick={handleLogout}
                title="Cerrar sesión segura"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>

              <button className="btn-close-dashboard" onClick={onClose} title="Cerrar">
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Subheader / Tabs Bar */}
          <nav className="dashboard-tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
              onClick={() => setActiveTab('productos')}
            >
              <Pill size={16} />
              <span>Suplementos & Productos ({allProducts.length})</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'imagenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('imagenes')}
            >
              <ImageIcon size={16} />
              <span>Gestor de Imágenes</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
              onClick={() => setActiveTab('categorias')}
            >
              <Layers size={16} />
              <span>Categorías ({categories.length})</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'tienda' ? 'active' : ''}`}
              onClick={() => setActiveTab('tienda')}
            >
              <Store size={16} />
              <span>Datos de Tienda & WhatsApp</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'respaldos' ? 'active' : ''}`}
              onClick={() => setActiveTab('respaldos')}
            >
              <RefreshCw size={16} />
              <span>Copias de Seguridad</span>
            </button>
          </nav>

          {/* Main Content Area */}
          <main className="dashboard-main-content">
            {/* ========================================================== */}
            {/* TAB 1: PRODUCTOS / SUPLEMENTOS                             */}
            {/* ========================================================== */}
            {activeTab === 'productos' && (
              <div className="tab-pane-fade">
                <div className="pane-header-actions">
                  <div className="search-and-filter-bar">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por suplemento, marca o componente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="category-filter-chips">
                      <button
                        className={`chip-btn ${selectedCatFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedCatFilter('ALL')}
                      >
                        Todos ({allProducts.length})
                      </button>
                      {categories.map(c => (
                        <button
                          key={c.id}
                          className={`chip-btn ${selectedCatFilter === c.name ? 'active' : ''}`}
                          onClick={() => setSelectedCatFilter(c.name)}
                        >
                          {c.name} ({c.items?.length || 0})
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="btn-create-primary" onClick={handleOpenCreateProduct}>
                    <Plus size={18} />
                    <span>Nuevo Suplemento</span>
                  </button>
                </div>

                {/* Grid de Productos */}
                {filteredProducts.length === 0 ? (
                  <div className="empty-state-card">
                    <Pill size={48} className="empty-icon" />
                    <h3>No se encontraron suplementos</h3>
                    <p>Prueba con otros términos de búsqueda o agrega un nuevo producto al catálogo.</p>
                    <button className="btn-create-primary" onClick={handleOpenCreateProduct}>
                      <Plus size={18} />
                      <span>Crear Suplemento</span>
                    </button>
                  </div>
                ) : (
                  <div className="products-admin-grid">
                    {filteredProducts.map(item => (
                      <div key={item.id} className="product-admin-card">
                        <div className="card-thumb-container">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="card-thumb-img" />
                          ) : (
                            <div className="card-thumb-placeholder">
                              <Pill size={28} />
                              <span>Sin Foto</span>
                            </div>
                          )}

                          {item.nutritionImage && (
                            <span className="badge-nutrition-tag" title="Posee Tabla Nutricional">
                              📊 Tabla
                            </span>
                          )}

                          <span className={`stock-badge ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {item.stock > 0 ? `Stock: ${item.stock}` : 'Agotado'}
                          </span>
                        </div>

                        <div className="card-body">
                          <div className="card-top-info">
                            <span className="card-brand">{item.brand || 'Suplevit'}</span>
                            <span className="card-category-badge">{item.categoryName}</span>
                          </div>

                          <h4 className="card-title" title={item.name}>{item.name}</h4>

                          <p className="card-desc">
                            {item.description || 'Sin descripción detallada.'}
                          </p>

                          {/* Especificaciones */}
                          <div className="card-specs-row">
                            {item.concentration && <span className="spec-tag">{item.concentration}</span>}
                            {item.services && <span className="spec-tag">{item.services}</span>}
                            {item.flavor && <span className="spec-tag">{item.flavor}</span>}
                            {item.presentation && <span className="spec-tag">{item.presentation}</span>}
                          </div>

                          {/* Precios */}
                          <div className="card-prices-box">
                            <div className="price-unit">
                              <span className="price-lbl">Precio BCV</span>
                              <span className="price-val">${Number(item.priceBcv || item.price || 0).toFixed(2)}</span>
                            </div>
                            {item.pricePromoUsd > 0 && (
                              <div className="price-unit promo">
                                <span className="price-lbl">Promo Efectivo/USD</span>
                                <span className="price-val">${Number(item.pricePromoUsd).toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Badges / Etiquetas */}
                          {item.badges && item.badges.length > 0 && (
                            <div className="card-badges-list">
                              {item.badges.slice(0, 3).map((b, idx) => (
                                <span key={idx} className="badge-chip">{b}</span>
                              ))}
                              {item.badges.length > 3 && (
                                <span className="badge-chip more">+{item.badges.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="card-actions-bar">
                          <button
                            className="btn-card-action btn-edit"
                            onClick={() => handleOpenEditProduct(item)}
                            title="Editar información y fotos"
                          >
                            <Edit3 size={15} />
                            <span>Editar</span>
                          </button>

                          <button
                            className="btn-card-action btn-copy"
                            onClick={() => handleDuplicateProduct(item)}
                            title="Duplicar este suplemento"
                          >
                            <Copy size={15} />
                          </button>

                          <button
                            className="btn-card-action btn-delete"
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="Eliminar suplemento"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 2: GESTOR DE IMÁGENES                                  */}
            {/* ========================================================== */}
            {activeTab === 'imagenes' && (
              <div className="tab-pane-fade">
                <div className="pane-info-banner">
                  <div className="banner-icon"><ImageIcon size={24} /></div>
                  <div className="banner-text">
                    <h4>Gestor de Imágenes de Suplementos & Tablas Nutricionales</h4>
                    <p>
                      Sube fotos directamente desde tu computadora o teléfono (se optimizan automáticamente en Base64 y se guardan al instante) o introduce enlaces URL directos.
                    </p>
                  </div>
                </div>

                <div className="images-manager-grid">
                  {allProducts.map(item => (
                    <div key={item.id} className="image-manager-card">
                      <div className="img-card-header">
                        <h4>{item.name}</h4>
                        <span className="img-card-cat">{item.categoryName}</span>
                      </div>

                      <div className="img-card-columns">
                        {/* 1. Foto Principal del Suplemento */}
                        <div className="img-column-box">
                          <span className="img-box-label">Foto Principal del Suplemento</span>
                          <div className="img-preview-box">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="img-preview-render" />
                            ) : (
                              <div className="img-empty-box">
                                <ImageIcon size={32} />
                                <span>Sin imagen</span>
                              </div>
                            )}
                          </div>

                          <div className="img-actions-row">
                            <label className="btn-upload-file-label">
                              <Upload size={14} />
                              <span>Subir Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleDirectImageUpload(e, item, 'image')}
                              />
                            </label>

                            {item.image && (
                              <button
                                className="btn-remove-img"
                                onClick={() => {
                                  updateProduct({ ...item, image: '' }, item.categoryName);
                                  showToast('Foto eliminada');
                                }}
                                title="Quitar imagen"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2. Tabla Nutricional */}
                        <div className="img-column-box">
                          <span className="img-box-label">Tabla de Información Nutricional</span>
                          <div className="img-preview-box nutrition">
                            {item.nutritionImage ? (
                              <img src={item.nutritionImage} alt="Tabla Nutricional" className="img-preview-render" />
                            ) : (
                              <div className="img-empty-box">
                                <Pill size={32} />
                                <span>Sin tabla cargada</span>
                              </div>
                            )}
                          </div>

                          <div className="img-actions-row">
                            <label className="btn-upload-file-label">
                              <Upload size={14} />
                              <span>Subir Tabla</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleDirectImageUpload(e, item, 'nutritionImage')}
                              />
                            </label>

                            {item.nutritionImage && (
                              <button
                                className="btn-remove-img"
                                onClick={() => {
                                  updateProduct({ ...item, nutritionImage: '' }, item.categoryName);
                                  showToast('Tabla nutricional eliminada');
                                }}
                                title="Quitar tabla"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 3: CATEGORÍAS                                          */}
            {/* ========================================================== */}
            {activeTab === 'categorias' && (
              <div className="tab-pane-fade">
                <div className="categories-management-wrapper">
                  <div className="cat-create-card">
                    <h3>Crear Nueva Categoría</h3>
                    <p>Agrupa suplementos por línea de producto, edad o propósito médico.</p>
                    <form onSubmit={handleAddCategory} className="cat-form-row">
                      <input
                        type="text"
                        placeholder="Ej: Vitaminas & Defensas, Probióticos, Salud Cerebral..."
                        value={newCatInput}
                        onChange={(e) => setNewCatInput(e.target.value)}
                      />
                      <button type="submit" className="btn-create-primary" disabled={!newCatInput.trim()}>
                        <Plus size={18} />
                        <span>Añadir Categoría</span>
                      </button>
                    </form>
                  </div>

                  <h3 className="section-title">Categorías Activas ({categories.length})</h3>
                  <div className="categories-list-grid">
                    {categories.map(cat => (
                      <div key={cat.id} className="category-admin-card">
                        <div className="cat-card-header">
                          <Layers size={20} className="cat-icon" />
                          <h4 className="cat-name">{cat.name}</h4>
                        </div>

                        <div className="cat-card-body">
                          <span className="cat-products-count">
                            {cat.items?.length || 0} productos asignados
                          </span>
                        </div>

                        <div className="cat-card-footer">
                          <button
                            className="btn-cat-filter"
                            onClick={() => {
                              setSelectedCatFilter(cat.name);
                              setActiveTab('productos');
                            }}
                          >
                            <Eye size={14} />
                            <span>Ver productos</span>
                          </button>

                          {categories.length > 1 && (
                            <button
                              className="btn-cat-delete"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar categoría "${cat.name}" y sus productos?`)) {
                                  deleteCategory(cat.id);
                                  showToast(`Categoría "${cat.name}" eliminada`);
                                }
                              }}
                              title="Eliminar categoría"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 4: DATOS DE TIENDA & WHATSAPP                          */}
            {/* ========================================================== */}
            {activeTab === 'tienda' && (
              <div className="tab-pane-fade">
                <form onSubmit={handleSaveStoreInfo} className="store-settings-card">
                  <div className="store-card-header">
                    <Store size={24} />
                    <div>
                      <h3>Configuración de la Tienda & Enlace de WhatsApp</h3>
                      <p>Actualiza la información comercial y el número al que llegan los pedidos.</p>
                    </div>
                  </div>

                  <div className="store-form-grid">
                    <div className="form-group">
                      <label>Nombre de la Tienda</label>
                      <input
                        type="text"
                        value={storeForm.name}
                        onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Número WhatsApp para Pedidos (con código de país)</label>
                      <div className="input-with-icon">
                        <Phone size={18} />
                        <input
                          type="text"
                          value={storeForm.phone}
                          placeholder="584224657359"
                          onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value.replace(/[^\d]/g, '') })}
                          required
                        />
                      </div>
                      <small className="help-text">Ejemplo Venezuela: 584224657359 (sin el símbolo +)</small>
                    </div>

                    <div className="form-group full-width">
                      <label>Mensaje de Saludo Predeterminado en WhatsApp</label>
                      <div className="input-with-icon">
                        <MessageCircle size={18} />
                        <input
                          type="text"
                          value={storeForm.greeting}
                          onChange={(e) => setStoreForm({ ...storeForm, greeting: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Ubicación / Sede</label>
                      <input
                        type="text"
                        value={storeForm.city}
                        onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Moneda Principal</label>
                      <input
                        type="text"
                        value={storeForm.currency}
                        onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Descripción de la Tienda (SEO y Footer)</label>
                      <textarea
                        rows={3}
                        value={storeForm.description}
                        onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="store-form-actions">
                    <a
                      href={`https://wa.me/${storeForm.phone}?text=${encodeURIComponent(storeForm.greeting)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-test-whatsapp"
                    >
                      <ExternalLink size={16} />
                      <span>Probar Enlace WhatsApp</span>
                    </a>

                    <button type="submit" className="btn-create-primary">
                      <Save size={18} />
                      <span>Guardar Configuración</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 5: RESPALDOS & SEGURIDAD                               */}
            {/* ========================================================== */}
            {activeTab === 'respaldos' && (
              <div className="tab-pane-fade">
                <div className="backups-grid">
                  <div className="backup-action-card">
                    <div className="backup-card-icon export">
                      <Download size={28} />
                    </div>
                    <h4>Exportar Respaldo Completo</h4>
                    <p>
                      Descarga un archivo JSON que contiene todos tus suplementos, precios, descripciones, categorías e imágenes personalizadas.
                    </p>
                    <button className="btn-backup-action" onClick={exportBackupData}>
                      <Download size={16} />
                      <span>Descargar JSON</span>
                    </button>
                  </div>

                  <div className="backup-action-card">
                    <div className="backup-card-icon import">
                      <Upload size={28} />
                    </div>
                    <h4>Importar Respaldo JSON</h4>
                    <p>
                      Restaura tu catálogo desde un archivo JSON descargado previamente. Todos los cambios se aplicarán al instante.
                    </p>
                    <label className="btn-backup-action">
                      <Upload size={16} />
                      <span>Seleccionar Archivo JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportBackupFile}
                      />
                    </label>
                  </div>

                  <div className="backup-action-card danger">
                    <div className="backup-card-icon reset">
                      <RotateCcw size={28} />
                    </div>
                    <h4>Restablecer de Fábrica</h4>
                    <p>
                      Borra todas las modificaciones guardadas en el navegador y recarga los datos originales base desde el Google Sheet.
                    </p>
                    <button
                      className="btn-backup-action danger"
                      onClick={() => setResetConfirmOpen(true)}
                    >
                      <RotateCcw size={16} />
                      <span>Restablecer Ahora</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL DE CREACIÓN / EDICIÓN DE SUPLEMENTO                   */}
      {/* ============================================================== */}
      {editingProduct && (
        <div className="modal-admin-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-admin-content" onClick={e => e.stopPropagation()}>
            <div className="modal-admin-header">
              <div className="modal-title-box">
                <Pill size={22} className="modal-pill-icon" />
                <h3>{isNewProduct ? 'Agregar Nuevo Suplemento' : `Editar: ${productForm.name}`}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setEditingProduct(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-admin-form">
              <div className="form-sections-container">
                {/* Sección 1: Información Básica */}
                <div className="form-section-card">
                  <h4 className="section-subtitle">1. Información del Producto</h4>
                  <div className="form-grid-2">
                    <div className="form-group full-width">
                      <label>Nombre del Suplemento *</label>
                      <input
                        type="text"
                        placeholder="Ej: Culturelle Probiotics Kids Gomitas"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Marca Fabricante</label>
                      <input
                        type="text"
                        placeholder="Ej: Culturelle, Lifeable, Dr. Moritz..."
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Categoría</label>
                      <select
                        value={productForm.categoryName}
                        onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Stock / Cantidad Disponible</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Descripción Comercial</label>
                      <textarea
                        rows={3}
                        placeholder="Descripción detallada de propiedades, propósito y formulación..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Precios */}
                <div className="form-section-card">
                  <h4 className="section-subtitle">2. Precios & Promociones</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Precio BCV (en Dólares $)</label>
                      <div className="input-with-icon">
                        <DollarSign size={16} />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productForm.priceBcv}
                          onChange={(e) => setProductForm({ ...productForm, priceBcv: e.target.value })}
                          required
                        />
                      </div>
                      <small className="help-text">Se convierte automáticamente a Bs según la tasa oficial</small>
                    </div>

                    <div className="form-group">
                      <label>Precio Promo USD (Efectivo / Zelle / Binance)</label>
                      <div className="input-with-icon">
                        <DollarSign size={16} />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productForm.pricePromoUsd}
                          onChange={(e) => setProductForm({ ...productForm, pricePromoUsd: e.target.value })}
                        />
                      </div>
                      <small className="help-text">Precio especial con descuento al pagar en divisas</small>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Imágenes */}
                <div className="form-section-card">
                  <h4 className="section-subtitle">3. Gestión de Imágenes & Tabla Nutricional</h4>
                  <div className="form-grid-2">
                    {/* Foto Principal */}
                    <div className="image-edit-box">
                      <label className="image-edit-title">Foto Principal del Suplemento</label>
                      <div className="modal-preview-thumb">
                        {productForm.image ? (
                          <img src={productForm.image} alt="Vista previa" />
                        ) : (
                          <div className="empty-thumb-indicator">
                            <ImageIcon size={32} />
                            <span>Sin foto</span>
                          </div>
                        )}
                      </div>

                      <div className="image-upload-controllers">
                        <label className="btn-file-picker">
                          <Upload size={14} />
                          <span>Subir desde dispositivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, 'image')}
                          />
                        </label>

                        {productForm.image && (
                          <button
                            type="button"
                            className="btn-clear-image"
                            onClick={() => setProductForm({ ...productForm, image: '' })}
                          >
                            <Trash2 size={14} />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        className="url-manual-input"
                        placeholder="O pegar URL web de la imagen..."
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      />
                    </div>

                    {/* Tabla Nutricional */}
                    <div className="image-edit-box">
                      <label className="image-edit-title">Tabla de Información Nutricional</label>
                      <div className="modal-preview-thumb nutrition">
                        {productForm.nutritionImage ? (
                          <img src={productForm.nutritionImage} alt="Tabla Nutricional" />
                        ) : (
                          <div className="empty-thumb-indicator">
                            <Pill size={32} />
                            <span>Sin tabla</span>
                          </div>
                        )}
                      </div>

                      <div className="image-upload-controllers">
                        <label className="btn-file-picker">
                          <Upload size={14} />
                          <span>Subir desde dispositivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, 'nutritionImage')}
                          />
                        </label>

                        {productForm.nutritionImage && (
                          <button
                            type="button"
                            className="btn-clear-image"
                            onClick={() => setProductForm({ ...productForm, nutritionImage: '' })}
                          >
                            <Trash2 size={14} />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        className="url-manual-input"
                        placeholder="O pegar URL web de la tabla..."
                        value={productForm.nutritionImage}
                        onChange={(e) => setProductForm({ ...productForm, nutritionImage: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 4: Ficha Técnica & Nutricional */}
                <div className="form-section-card">
                  <h4 className="section-subtitle">4. Ficha Técnica & Especificaciones</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Concentración</label>
                      <input
                        type="text"
                        placeholder="Ej: 500 mg, 100 mg Magnesio, 5-MTHF"
                        value={productForm.concentration}
                        onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Servicios / Porciones</label>
                      <input
                        type="text"
                        placeholder="Ej: 60 gomitas, 300 servicios, 90 cápsulas"
                        value={productForm.services}
                        onChange={(e) => setProductForm({ ...productForm, services: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Sabor</label>
                      <input
                        type="text"
                        placeholder="Ej: Frutos Rojos, Frambuesa, Sin Sabor"
                        value={productForm.flavor}
                        onChange={(e) => setProductForm({ ...productForm, flavor: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Presentación</label>
                      <input
                        type="text"
                        placeholder="Ej: Gomitas, Gotas Líquidas, Cápsulas, Polvo"
                        value={productForm.presentation}
                        onChange={(e) => setProductForm({ ...productForm, presentation: e.target.value })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Modo de Uso / Instrucciones</label>
                      <input
                        type="text"
                        placeholder="Ej: Masticar 1 gomita al día con una comida principal. A partir de 3 años."
                        value={productForm.usageInstructions}
                        onChange={(e) => setProductForm({ ...productForm, usageInstructions: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 5: Etiquetas & Beneficios */}
                <div className="form-section-card">
                  <h4 className="section-subtitle">5. Etiquetas, Ingredientes & Beneficios</h4>
                  <div className="form-grid-1">
                    <div className="form-group">
                      <label>Etiquetas Destacadas (separadas por coma)</label>
                      <input
                        type="text"
                        placeholder="Recomendado por pediatras, Sin azúcar, Keto, Vegano, Vitamina C"
                        value={productForm.badgesStr}
                        onChange={(e) => setProductForm({ ...productForm, badgesStr: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Ingredientes Clave (uno por línea)</label>
                      <textarea
                        rows={2}
                        placeholder="Probióticos (Cepa GG)&#10;Vitamina C (Apoyo Inmune)&#10;Fibra Vegetal"
                        value={productForm.ingredientsStr}
                        onChange={(e) => setProductForm({ ...productForm, ingredientsStr: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Beneficios Principales (uno por línea)</label>
                      <textarea
                        rows={2}
                        placeholder="Restaura el equilibrio digestivo.&#10;Fortalece defensas del cuerpo."
                        value={productForm.benefitsStr}
                        onChange={(e) => setProductForm({ ...productForm, benefitsStr: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-admin-footer">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-modal">
                  <Save size={18} />
                  <span>Guardar Suplemento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL CONFIRMAR ELIMINACIÓN                                 */}
      {/* ============================================================== */}
      {deleteConfirmId && (
        <div className="modal-confirm-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h4>¿Eliminar este suplemento?</h4>
            <p>
              Esta acción quitará el suplemento del catálogo visible de la tienda.
            </p>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDeleteProduct(deleteConfirmId)}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL CONFIRMAR RESTABLECIMIENTO DE FÁBRICA                 */}
      {/* ============================================================== */}
      {resetConfirmOpen && (
        <div className="modal-confirm-overlay" onClick={() => setResetConfirmOpen(false)}>
          <div className="modal-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon warning">
              <RotateCcw size={32} />
            </div>
            <h4>¿Restablecer datos originales de fábrica?</h4>
            <p>
              Se eliminarán todas las modificaciones locales guardadas y el catálogo se recargará con los datos originales base del Google Sheet.
            </p>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setResetConfirmOpen(false)}>
                Cancelar
              </button>
              <button className="btn-confirm-reset" onClick={handleConfirmReset}>
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
