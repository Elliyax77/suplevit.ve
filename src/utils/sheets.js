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
      complete: (results) => {
        try {
          const rawData = results.data;
          
          // Agrupar productos por categoría
          const categoryMap = {};
          
          rawData.forEach((row, index) => {
            // Ignorar filas sin nombre de producto
            if (!(row.nombre || row.name) || (row.nombre || row.name).trim() === '') return;

            const categoryName = row.categoria || row.category || 'Catálogo de Suplementos';
            
            if (!categoryMap[categoryName]) {
              categoryMap[categoryName] = {
                id: `c${Object.keys(categoryMap).length + 1}`,
                name: categoryName,
                items: []
              };
            }

            const item = {
              id: row.id || `p${index}`,
              name: (row.nombre || row.name || '').trim(),
              description: row.descripcion || row.description || '',
              price: parseFloat(row.precio || row.price) || 0,
              image: row.imagen || row.image || '',
              badges: (row.etiquetas || row.badges) ? (row.etiquetas || row.badges).split(',').map(i => i.trim()).filter(Boolean) : [],
              conditions: (row.condiciones || row.conditions) ? (row.condiciones || row.conditions).split(',').map(i => i.trim()).filter(Boolean) : [],
              customizable: false,
              keyIngredients: (row.ingredientes || row.keyIngredients) ? (row.ingredientes || row.keyIngredients).split(';').map(i => i.trim()).filter(Boolean) : [],
              benefitsList: (row.beneficios || row.benefitsList) ? (row.beneficios || row.benefitsList).split(';').map(i => i.trim()).filter(Boolean) : [],
              usageInstructions: row.instrucciones || row.usageInstructions || ''
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
