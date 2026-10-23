import Papa from 'papaparse';
import menuData from '../data/menu.json'; // Respaldo por defecto

export const fetchProductsFromSheet = (csvUrl) => {
  return new Promise((resolve) => {
    // Si no hay URL, usamos el json local directamente
    if (!csvUrl) {
      resolve(menuData);
      return;
    }

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(), // Eliminar espacios al final
      beforeFirstChunk: (chunk) => {
        // La primera fila es "Suplevit", la segunda son los encabezados reales
        // Removemos la primera línea del chunk inicial
        const lines = chunk.split(/\r?\n/);
        if (lines[0] && lines[0].startsWith('Suplevit')) {
          lines.shift();
        }
        return lines.join('\n');
      },
      complete: (results) => {
        try {
          const rawData = results.data;
          
          // Agrupar productos por categoría
          const categoryMap = {};
          
          rawData.forEach((row, index) => {
            // Ignorar filas sin nombre de producto
            if (!row['Producto'] || row['Producto'].trim() === '') return;

            const rawCategoryName = row['Categoría'] || 'General';
            const categoryNames = rawCategoryName.split('/').map(c => c.trim()).filter(Boolean);

            // Remover el símbolo $ o € y cambiar comas por puntos
            const parsePrice = (priceStr) => {
              if (!priceStr) return 0;
              return parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            };

            const priceBcv = parsePrice(row['Precio Bs (tasa euro)'] || row['Precio Bs (tasa bcv)'] || row['Precio']);
            const pricePromoUsd = parsePrice(row['Precio (Efectivo-Zelle-Binance)']);

            const stock = parseInt(row['Cantidad'], 10) || 0;

            // Procesar imagenes (pueden venir con ruta local como C:\...\imagen.png, comillas extras o URL directa)
            const resolveImageUrl = (path, folder) => {
              if (!path) return '';
              const cleanPath = path.replace(/['"]/g, '').trim();
              if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
                return cleanPath;
              }
              const parts = cleanPath.split(/[\/\\]/);
              const filename = parts[parts.length - 1].trim();
              if (!filename) return '';
              return `/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
            };

            const image = resolveImageUrl(row['Imagen sin fondo'], 'imagenes suplevit');
            const nutritionImage = resolveImageUrl(row['Tabla Nutricional'], 'tablas nutricionales');

            const item = {
              id: `p${index}`,
              name: row['Producto'].trim(),
              brand: row['Marca'] && row['Marca'].trim() !== '-' ? row['Marca'].trim() : '',
              stock: stock,
              priceBcv: priceBcv,
              pricePromoUsd: pricePromoUsd,
              price: priceBcv, // Usaremos el priceBcv como principal
              description: row['Descripción'] || '',
              image: image,
              nutritionImage: nutritionImage,
              concentration: row['Concentración'] && row['Concentración'].trim() !== '-' ? row['Concentración'].trim() : null,
              services: row['Servicios'] && row['Servicios'].trim() !== '-' ? row['Servicios'].trim() : null,
              flavor: row['Sabor'] && row['Sabor'].trim() !== '-' ? row['Sabor'].trim() : null,
              presentation: row['Presentación'] && row['Presentación'].trim() !== '-' ? row['Presentación'].trim() : null,
              badges: row['Etiquetas'] ? row['Etiquetas'].split(',').map(i => i.trim()).filter(Boolean) : []
            };
            
            categoryNames.forEach(categoryName => {
              if (!categoryMap[categoryName]) {
                categoryMap[categoryName] = {
                  id: `c${Object.keys(categoryMap).length + 1}`,
                  name: categoryName,
                  items: []
                };
              }
              categoryMap[categoryName].items.push(item);
            });
          });

          const categories = Object.values(categoryMap);
          
          // Si por alguna razón el CSV está vacío, usamos el respaldo
          if (categories.length === 0) {
            resolve(menuData);
          } else {
            // Armamos el objeto final imitando a menu.json
            const finalData = {
              ...menuData, // Mantenemos la información del restaurante y tema
              categories: categories
            };
            resolve(finalData);
          }
        } catch (error) {
          console.error("Error procesando los datos del Sheet:", error);
          resolve(menuData); // Fallback en caso de error
        }
      },
      error: (error) => {
        console.error("Error descargando el Sheet:", error);
        resolve(menuData); // Fallback en caso de error
      }
    });
  });
};
