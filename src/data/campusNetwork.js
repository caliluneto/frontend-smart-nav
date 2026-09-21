// ============================================================================
// Rede de caminhos do campus UNAERP
// Nós = pontos de referência nos caminhos
// Arestas = conexões entre nós (a pé)
// ============================================================================

export const CAMPUS_NODES = {
  // ===== Entradas =====
  'portaria-principal': { lat: -21.203093, lng: -47.779654, label: 'Portaria Principal' },
  'entrada-sul':        { lat: -21.202800, lng: -47.780300, label: 'Entrada Sul' },
  'entrada-norte':      { lat: -21.199800, lng: -47.779000, label: 'Entrada Norte' },

  // ===== Cruzamentos principais =====
  'cruz-central':       { lat: -21.201800, lng: -47.779500, label: 'Cruzamento Central' },
  'cruz-norte':         { lat: -21.200500, lng: -47.779000, label: 'Cruzamento Norte' },
  'cruz-sul':           { lat: -21.202500, lng: -47.779800, label: 'Cruzamento Sul' },
  'cruz-leste':         { lat: -21.201500, lng: -47.778300, label: 'Cruzamento Leste' },
  'cruz-oeste':         { lat: -21.201800, lng: -47.780500, label: 'Cruzamento Oeste' },

  // ===== Blocos (entradas) =====
  'entrada-bloco-a':    { lat: -21.202065, lng: -47.779884, label: 'Bloco A' },
  'entrada-bloco-b':    { lat: -21.202438, lng: -47.780059, label: 'Bloco B' },
  'entrada-bloco-d':    { lat: -21.201677, lng: -47.778533, label: 'Bloco D' },
  'entrada-bloco-e':    { lat: -21.201207, lng: -47.778468, label: 'Bloco E' },
  'entrada-bloco-f':    { lat: -21.200845, lng: -47.778398, label: 'Bloco F' },
  'entrada-bloco-g':    { lat: -21.202678, lng: -47.778790, label: 'Bloco G' },
  'entrada-bloco-h':    { lat: -21.202808, lng: -47.779155, label: 'Bloco H' },
  'entrada-bloco-i':    { lat: -21.199212, lng: -47.777851, label: 'Bloco I' },
  'entrada-bloco-k':    { lat: -21.202237, lng: -47.778468, label: 'Bloco K' },
  'entrada-bloco-r':    { lat: -21.201332, lng: -47.779697, label: 'Bloco R' },
  'entrada-bloco-s':    { lat: -21.201387, lng: -47.779380, label: 'Bloco S' },

  // ===== Serviços =====
  'entrada-cantina':    { lat: -21.202322, lng: -47.779104, label: 'Cantina' },
  'entrada-plug':       { lat: -21.202458, lng: -47.779372, label: 'Centro de Convivência' },
  'entrada-bradesco':   { lat: -21.202570, lng: -47.779605, label: 'Bradesco' },
  'entrada-hospital':   { lat: -21.201037, lng: -47.779943, label: 'Hospital' },
  'entrada-quadras':    { lat: -21.200317, lng: -47.779326, label: 'Quadras' },
};

// Arestas = conexões caminháveis entre nós
export const CAMPUS_EDGES = [
  // Entradas ↔ Cruzamentos
  ['portaria-principal', 'cruz-sul'],
  ['entrada-sul',        'cruz-sul'],
  ['entrada-norte',      'cruz-norte'],

  // Cruzamentos entre si
  ['cruz-sul',    'cruz-central'],
  ['cruz-central','cruz-norte'],
  ['cruz-central','cruz-leste'],
  ['cruz-central','cruz-oeste'],
  ['cruz-norte',  'cruz-leste'],

  // Cruzamentos ↔ Blocos
  ['cruz-sul',     'entrada-bloco-a'],
  ['cruz-sul',     'entrada-bloco-b'],
  ['cruz-sul',     'entrada-bloco-h'],
  ['cruz-sul',     'entrada-bloco-g'],
  ['cruz-central', 'entrada-bloco-r'],
  ['cruz-central', 'entrada-bloco-s'],
  ['cruz-central', 'entrada-plug'],
  ['cruz-central', 'entrada-bradesco'],
  ['cruz-central', 'entrada-cantina'],
  ['cruz-central', 'entrada-bloco-k'],
  ['cruz-leste',   'entrada-bloco-d'],
  ['cruz-leste',   'entrada-bloco-e'],
  ['cruz-leste',   'entrada-bloco-f'],
  ['cruz-leste',   'entrada-bloco-i'],
  ['cruz-oeste',   'entrada-hospital'],
  ['cruz-norte',   'entrada-quadras'],
];

// Configuração
export const NETWORK_CONFIG = {
  // Distância máxima (em metros) para conectar um ponto (POI ou usuário) à rede
  maxSnapDistance: 200,
  // Velocidade média de caminhada (m/s)
  walkingSpeed: 1.4,
};

// Helper: calcula distância Haversine
export const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
