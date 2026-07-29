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

            const categoryName = row['Categoría'] || 'General';
            
            if (!categoryMap[categoryName]) {
              categoryMap[categoryName] = {
                id: `c${Object.keys(categoryMap).length + 1}`,
                name: categoryName,
                items: []
              };
            }

            // Procesar precios
            // Remover el símbolo $ o € y cambiar comas por puntos
            const parsePrice = (priceStr) => {
              if (!priceStr) return 0;
              return parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            };

            const priceEuro = parsePrice(row['Precio Bs (tasa euro)']);
            const pricePromoUsd = parsePrice(row['Precio (Efectivo-Zelle-Binance)']);

            const stock = parseInt(row['Cantidad'], 10) || 0;

            // Procesar imagenes (pueden venir con ruta local como C:\...\imagen.png y con comillas extras)
            const extractFilename = (path) => {
              if (!path) return '';
              const cleanPath = path.replace(/['"]/g, ''); // Eliminar comillas dobles o simples extra
              const parts = cleanPath.split(/[\/\\]/);
              return parts[parts.length - 1];
            };

            const imageFile = extractFilename(row['Imagen sin fondo']);
            const image = imageFile ? `/imagenes%20suplevit/${encodeURIComponent(imageFile)}` : '';
            
            const nutritionFile = extractFilename(row['Tabla Nutricional']);
            const nutritionImage = nutritionFile ? `/tablas%20nutricionales/${encodeURIComponent(nutritionFile)}` : '';

            const item = {
              id: `p${index}`,
              name: row['Producto'].trim(),
              brand: row['Marca'] && row['Marca'].trim() !== '-' ? row['Marca'].trim() : '',
              stock: stock,
              priceEuro: priceEuro,
              pricePromoUsd: pricePromoUsd,
              price: priceEuro, // Usaremos el priceEuro como principal
              description: row['Descripción'] || '',
              image: image,
              nutritionImage: nutritionImage,
              concentration: row['Concentración'] && row['Concentración'].trim() !== '-' ? row['Concentración'].trim() : null,
              services: row['Servicios'] && row['Servicios'].trim() !== '-' ? row['Servicios'].trim() : null,
              flavor: row['Sabor'] && row['Sabor'].trim() !== '-' ? row['Sabor'].trim() : null,
              presentation: row['Presentación'] && row['Presentación'].trim() !== '-' ? row['Presentación'].trim() : null,
              badges: row['Etiquetas'] ? row['Etiquetas'].split(',').map(i => i.trim()).filter(Boolean) : []
            };
            
            categoryMap[categoryName].items.push(item);
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
