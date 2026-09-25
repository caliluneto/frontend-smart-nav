import { CAMPUS_PANORAMAS, PANORAMAS_BY_TYPE } from '../data/campusPanoramas';

/**
 * Retorna a configuração do panorama para um POI
 * @param {Object} poi - Objeto POI com { id, type, name }
 * @returns {Object|null} - { url, name, hotspots } ou null
 */
export const getPanoramaForPOI = (poi) => {
  if (!poi) return null;

  // 1. Tenta buscar por ID específico
  if (poi.id && CAMPUS_PANORAMAS[poi.id]) {
    return {
      ...CAMPUS_PANORAMAS[poi.id],
      id: poi.id,
      name: poi.name || CAMPUS_PANORAMAS[poi.id].name,
    };
  }

  // 2. Fallback: busca por tipo
  if (poi.type && PANORAMAS_BY_TYPE[poi.type]) {
    return {
      id: poi.id || 'poi-generic',
      name: poi.name || 'Local do Campus',
      url: PANORAMAS_BY_TYPE[poi.type],
      hotspots: [],
    };
  }

  // 3. Nada encontrado
  return null;
};

/**
 * Verifica se um POI tem panorama disponível
 */
export const hasPanorama = (poi) => {
  return getPanoramaForPOI(poi) !== null;
};

export default {
  getPanoramaForPOI,
  hasPanorama,
};
