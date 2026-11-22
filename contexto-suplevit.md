# Contexto del Proyecto: Suplevit Web & Dashboard de Desarrollador

## 1. Visión General
**Suplevit** (`suplevit.ve`) es una plataforma web y catálogo interactivo enfocado en la venta de suplementos especializados para el desarrollo, salud digestiva, nutrición y bienestar infantil en Venezuela.

- **Repositorio GitHub:** `https://github.com/Elliyax77/suplevit.ve.git`
- **Rama principal:** `main`
- **Stack Tecnológico:**
  - **Frontend:** React 19 (`^19.2.7`), Vite 8 (`^8.1.1`)
  - **Animaciones:** Framer Motion (`^12.42.2`)
  - **Iconografía:** Lucide React (`^1.26.0`)
  - **Parser de Datos:** PapaParse (`^5.5.4`)
  - **Tasas Oficiales:** DolarApi Oficial BCV (`https://ve.dolarapi.com/v1/dolares/oficial`)
  - **Estilos:** CSS Modular & Glassmorphism responsive

---

## 2. Panel de Desarrollador / Dashboard Administrativo Oculto

Para permitir que el propietario o desarrollador edite productos, precios, fotos, inventario e información de contacto sin necesidad de una base de datos externa ni backend complejo, se diseñó un **Dashboard en Vivo con Máxima Seguridad**.

### 2.1. Métodos de Acceso Ocultos (Stealth Access)
El panel no está a la vista del cliente común. Se puede acceder a través de 3 mecanismos discretos:

1. **Atajo de Teclado:**
   - Presionar `Ctrl + Shift + S` (o `Cmd + Shift + S` en Mac).
   - Alternativo: `Ctrl + Shift + K`.
2. **Parámetro o Hash en la URL:**
   - Escribir en la barra del navegador: `#admin` o `#dashboard` (ejemplo: `https://suplevit.ve/#admin`).
   - O con query param: `?admin=true`.
3. **Botón Discreto en el Footer:**
   - En el pie de página, hacer clic en el texto de copyright "Suplevit" o en el sutil candado ubicado junto al crédito del desarrollador.

---

### 2.2. Seguridad & Bóveda de Autenticación
- **Contraseña Maestra:** `suplevit2026`
- **Protección contra Fuerza Bruta:** Bloqueo temporal por 30 segundos tras 5 intentos fallidos con cuenta regresiva.
- **Expiración de Sesión:** Cierre de sesión automático tras **30 minutos**. Al transcurrir ese tiempo, o al cerrar la pestaña o pulsar "Cerrar Sesión", la sesión expira y se solicita la contraseña nuevamente.
- **Visor de Contraseña:** Toggle con icono de ojo para mostrar u ocultar caracteres.

---

### 2.3. Funcionalidades del Dashboard

#### 💊 1. Suplementos & Productos (Catálogo Completo)
- **Buscador predictivo:** Filtra en tiempo real por nombre del producto, marca (ej. Culturelle, Lifeable, Dr. Moritz, Triquetra) o ingredientes.
- **Filtro de Categorías:** Chips interactivos para filtrar por categoría o ver el total.
- **Creación & Edición Modal:**
  - Nombre del suplemento, marca y categoría.
  - Control de Stock (indicador verde "En Stock" o rojo "Agotado").
  - Precios bivalentes: Precio BCV en $ y Precio Promo en USD (Efectivo/Zelle/Binance).
  - Concentración (ej. `500 mg`, `100 mg Magnesio`), Porciones/Servicios (`60 gomitas`, `300 servicios`), Sabor y Presentación.
  - Etiquetas comerciales (ej. `Recomendado por pediatras, Sin azúcar, Keto`).
  - Lista de ingredientes clave y beneficios clínicos.
  - Modo de uso e instrucciones pediátricas.
- **Duplicar Suplemento:** Permite clonar productos similares en 1 clic.
- **Eliminación Segura:** Con modal de confirmación para evitar borrados accidentales.

#### 📸 2. Gestor de Imágenes
- Permite gestionar tanto la **Foto Principal del Suplemento** como la **Tabla de Información Nutricional** (`nutritionImage`).
- **Subida Local desde el Dispositivo:** Convierte imágenes a Base64 mediante `FileReader`, permitiendo que las fotos se guarden de forma local y permanente sin requerir un bucket S3 o servidor externo.
- **Pegar Enlace URL:** Permite enlazar directamente imágenes alojadas en internet.
- **Quitar / Limpiar Imagen:** Botón para remover fotos con 1 clic.

#### 🏷️ 3. Categorías
- Creación de nuevas categorías.
- Conteo automático de productos vinculados.
- Eliminación con validación.

#### 🏢 4. Datos de la Tienda & WhatsApp
- Nombre del comercio.
- Número de WhatsApp para pedidos (ej. `584224657359`).
- Mensaje de bienvenida / saludo inicial personalizado.
- Ciudad y ubicación (`Valencia, Venezuela`).
- Botón "Probar Enlace WhatsApp" para verificar el link directo en tiempo real.

#### 💾 5. Copias de Seguridad & Respaldo
- **Exportar Respaldo JSON:** Descarga un archivo `.json` con todos los productos, categorías, imágenes y configuraciones.
- **Importar Respaldo JSON:** Permite cargar un respaldo guardado previamente y aplicarlo de inmediato.
- **Restablecer de Fábrica (Botón "Restablecer"):**
  - Permite descartar los cambios locales guardados en `localStorage` y volver a los datos originales base cargados desde Google Sheet o `menu.json`.
  - Dispone de una advertencia modal de confirmación antes de ejecutarse.

---

## 3. Estructura de Archivos Clave
- `src/context/SuplevitDataContext.jsx`: Administra el estado global, la persistencia en `localStorage` (`suplevit_custom_cms_data_v1`), atajos de teclado y sincronización.
- `src/components/AdminDashboard.jsx`: Componente maestro del panel de desarrollador con autenticación, pestañas y modales.
- `src/components/AdminDashboard.css`: Estilos visuales con estética oscura de lujo, acentos en azul Suplevit (`#5D93E1`) y ámbar (`#FFC107`).
- `src/App.jsx`: Componente raíz que renderiza el catálogo, modal de detalles de suplemento, carrito y el disparador del panel.
- `src/utils/sheets.js`: Utilidad PapaParse para consultar y normalizar datos desde Google Sheets.
- `src/utils/whatsapp.js`: Generador de links de WhatsApp formateados para procesar los pedidos del carrito.
