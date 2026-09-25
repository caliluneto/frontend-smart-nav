// ============================================================================
// Catálogo de Panoramas 360° do Campus UNAERP
// Imagens equirretangulares (proporção 2:1)
// ============================================================================

// Panoramas de alta qualidade de demonstração (fallback público testado)
const DEMO_PANOS = {
  library: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg',
  cafeteria: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg',
  campus_outdoors: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-test.jpg',
};

export const CAMPUS_PANORAMAS = {
  'unaerp-biblioteca': {
    name: 'Biblioteca Central (Profª Nair Fortes Abu-Jamra)',
    url: DEMO_PANOS.library,
    hotspots: [
      { yaw: 35, pitch: -2, targetId: 'unaerp-cantina', text: 'Ir para a Cantina Central ☕' },
      { yaw: 195, pitch: -5, targetId: 'unaerp-bloco-a', text: 'Ir para o Bloco A 🏫' },
      { yaw: 270, pitch: 0, targetId: 'unaerp-portaria-1', text: 'Ir para a Portaria Principal 🚪' },
    ],
  },
  'unaerp-cantina': {
    name: 'Praça de Convivência & Cantina Central',
    url: DEMO_PANOS.cafeteria,
    hotspots: [
      { yaw: 85, pitch: 0, targetId: 'unaerp-biblioteca', text: 'Voltar à Biblioteca Central 📚' },
      { yaw: 210, pitch: -4, targetId: 'unaerp-bloco-b', text: 'Ir para o Bloco B (Saúde) 🔬' },
    ],
  },
  'unaerp-bloco-a': {
    name: 'Bloco A — Administração & Direito',
    url: DEMO_PANOS.campus_outdoors,
    hotspots: [
      { yaw: 110, pitch: -3, targetId: 'unaerp-biblioteca', text: 'Ir para a Biblioteca Central 📚' },
      { yaw: 290, pitch: 0, targetId: 'unaerp-portaria-1', text: 'Ir para a Portaria Principal 🚪' },
    ],
  },
  'unaerp-portaria-1': {
    name: 'Portaria Principal (Av. Costábile Romano)',
    url: DEMO_PANOS.campus_outdoors,
    hotspots: [
      { yaw: 45, pitch: 0, targetId: 'unaerp-bloco-a', text: 'Entrar pelo Bloco A 🏫' },
      { yaw: 120, pitch: -5, targetId: 'unaerp-biblioteca', text: 'Ir para a Biblioteca Central 📚' },
    ],
  },
  'unaerp-bloco-b': {
    name: 'Bloco B — Ciências da Saúde & Medicina',
    url: DEMO_PANOS.campus_outdoors,
    hotspots: [
      { yaw: 15, pitch: 0, targetId: 'unaerp-cantina', text: 'Ir para a Cantina ☕' },
      { yaw: 180, pitch: 0, targetId: 'unaerp-bloco-c', text: 'Ir para o Bloco C (Engenharias) ⚙️' },
    ],
  },
  'unaerp-bloco-c': {
    name: 'Bloco C — Engenharia & Tecnologia',
    url: DEMO_PANOS.campus_outdoors,
    hotspots: [
      { yaw: 0, pitch: 0, targetId: 'unaerp-bloco-b', text: 'Ir para o Bloco B 🔬' },
      { yaw: 90, pitch: 0, targetId: 'unaerp-lab-ti', text: 'Ir para Laboratório de Informática 💻' },
    ],
  },
};

// Fallback por tipo de POI
export const PANORAMAS_BY_TYPE = {
  library: DEMO_PANOS.library,
  cafeteria: DEMO_PANOS.cafeteria,
  entrance: DEMO_PANOS.campus_outdoors,
  classroom: DEMO_PANOS.campus_outdoors,
  laboratory: DEMO_PANOS.campus_outdoors,
  auditorium: DEMO_PANOS.library,
  health: DEMO_PANOS.campus_outdoors,
  sports: DEMO_PANOS.campus_outdoors,
  parking: DEMO_PANOS.campus_outdoors,
};
