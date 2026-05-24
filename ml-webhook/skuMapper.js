// Mapeo: título exacto de publicación ML → SKU interno ZetaPets
// Actualizar con los títulos reales una vez que tengamos el Access Token
const SKU_MAP = {
  // Ejemplos — reemplazar con títulos reales de ML
  // "Limpiador de Pelo Mascotas": "002",
  // "Botella Portátil Comida y Agua Blanca": "005-A",
  // "Botella Portátil Comida y Agua Verde": "005-B",
  // "Collar Airtag Negro S": "009-A",
};

// También busca por coincidencia parcial (normalizada)
function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

function getSKU(itemTitle) {
  // Búsqueda exacta primero
  if (SKU_MAP[itemTitle]) return SKU_MAP[itemTitle];

  // Búsqueda parcial: si alguna clave está contenida en el título
  const normalizedTitle = normalize(itemTitle);
  for (const [key, sku] of Object.entries(SKU_MAP)) {
    if (normalizedTitle.includes(normalize(key))) return sku;
  }

  return "DESCONOCIDO";
}

module.exports = { getSKU };
