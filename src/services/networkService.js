import campusOSM from '../data/campus-osm.geojson';

// ============================================================================
// Limites do campus UNAERP (mais restritos que a bounding box do OSM)
// ============================================================================
const CAMPUS_BOUNDS = {
  minLat: -21.2035,
  maxLat: -21.1985,
  minLng: -47.7810,
  maxLng: -47.7770,
};

const isInsideCampus = (lat, lng) =>
  lat >= CAMPUS_BOUNDS.minLat &&
  lat <= CAMPUS_BOUNDS.maxLat &&
  lng >= CAMPUS_BOUNDS.minLng &&
  lng <= CAMPUS_BOUNDS.maxLng;

// ============================================================================
// Haversine
// ============================================================================
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// Constrói grafo a partir do GeoJSON (lazy, uma única vez)
// ============================================================================
let GRAPH = null;
let NODES = null;

const buildGraph = () => {
  if (GRAPH) return { graph: GRAPH, nodes: NODES };

  const graph = {};
  const nodes = {};
  let nodeIdCounter = 0;

  const getNodeId = (lat, lng) => {
    const key = `${lat.toFixed(7)},${lng.toFixed(7)}`;
    if (!nodes[key]) {
      nodes[key] = {
        id: `node-${nodeIdCounter++}`,
        lat,
        lng,
      };
    }
    return nodes[key].id;
  };

  const validTypes = [
    'footway', 'path', 'pedestrian', 'steps',
    'service', 'residential', 'tertiary', 'cycleway',
  ];

  const features = campusOSM?.features || [];

  features.forEach((feature) => {
    const highway = feature?.properties?.highway;
    if (!validTypes.includes(highway)) return;

    const coords = feature?.geometry?.coordinates || [];
    const coordsInCampus = coords.filter(([lng, lat]) => isInsideCampus(lat, lng));
    if (coordsInCampus.length < 2) return;

    for (let i = 0; i < coordsInCampus.length - 1; i++) {
      const [lng1, lat1] = coordsInCampus[i];
      const [lng2, lat2] = coordsInCampus[i + 1];

      const id1 = getNodeId(lat1, lng1);
      const id2 = getNodeId(lat2, lng2);

      if (id1 === id2) continue;

      const distance = haversine(lat1, lng1, lat2, lng2);

      if (!graph[id1]) graph[id1] = [];
      if (!graph[id2]) graph[id2] = [];

      graph[id1].push({ node: id2, distance, highway });
      graph[id2].push({ node: id1, distance, highway });
    }
  });

  const nodesById = {};
  Object.values(nodes).forEach((node) => {
    nodesById[node.id] = node;
  });

  GRAPH = graph;
  NODES = nodesById;

  const totalEdges = Object.values(graph).reduce((acc, a) => acc + a.length, 0) / 2;
  console.log(`🌐 Grafo construído: ${Object.keys(nodesById).length} nós, ${totalEdges} arestas`);

  return { graph, nodes: nodesById };
};

// ============================================================================
// Encontra o nó mais próximo de uma coordenada
// ============================================================================
export const findNearestNode = (lat, lng) => {
  const { nodes } = buildGraph();

  let nearest = null;
  let minDistance = Infinity;

  Object.values(nodes).forEach((node) => {
    const distance = haversine(lat, lng, node.lat, node.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = node;
    }
  });

  return { node: nearest, distance: minDistance };
};

// ============================================================================
// A* (A-Star) sobre o grafo
// ============================================================================
const aStar = (graph, nodes, startId, endId) => {
  const endNode = nodes[endId];

  const openSet = [startId];
  const cameFrom = {};
  const gScore = { [startId]: 0 };
  const fScore = {
    [startId]: haversine(
      nodes[startId].lat, nodes[startId].lng,
      endNode.lat, endNode.lng
    ),
  };

  const closedSet = new Set();

  while (openSet.length > 0) {
    let currentIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if ((fScore[openSet[i]] || Infinity) < (fScore[openSet[currentIdx]] || Infinity)) {
        currentIdx = i;
      }
    }
    const current = openSet.splice(currentIdx, 1)[0];

    if (current === endId) {
      const path = [current];
      let node = current;
      const pathSeen = new Set([current]);
      while (cameFrom[node]) {
        node = cameFrom[node];
        if (pathSeen.has(node)) break;
        pathSeen.add(node);
        path.unshift(node);
      }
      return path;
    }

    closedSet.add(current);

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.node)) continue;

      const tentativeG = (gScore[current] || 0) + neighbor.distance;
      if (tentativeG < (gScore[neighbor.node] || Infinity)) {
        cameFrom[neighbor.node] = current;
        gScore[neighbor.node] = tentativeG;
        const neighborNode = nodes[neighbor.node];
        fScore[neighbor.node] =
          tentativeG +
          haversine(neighborNode.lat, neighborNode.lng, endNode.lat, endNode.lng);
        if (!openSet.includes(neighbor.node)) {
          openSet.push(neighbor.node);
        }
      }
    }
  }

  return null;
};

// ============================================================================
// Função principal: roteamento entre dois pontos
// ============================================================================
export const findPath = (startLat, startLng, endLat, endLng) => {
  const { graph, nodes } = buildGraph();

  const startSnap = findNearestNode(startLat, startLng);
  const endSnap = findNearestNode(endLat, endLng);

  console.log(`📍 Origem: ${startSnap.distance.toFixed(0)}m do nó ${startSnap.node?.id}`);
  console.log(`📍 Destino: ${endSnap.distance.toFixed(0)}m do nó ${endSnap.node?.id}`);

  if (!startSnap.node || !endSnap.node) {
    console.warn('⚠️ Não foi possível encontrar nós próximos');
    return null;
  }

  if (startSnap.distance > 100 || endSnap.distance > 100) {
    console.warn(`⚠️ Snap distante: origem ${startSnap.distance.toFixed(0)}m, destino ${endSnap.distance.toFixed(0)}m`);
  }

  const path = aStar(graph, nodes, startSnap.node.id, endSnap.node.id);

  if (!path) {
    console.warn('⚠️ Nenhum caminho encontrado na rede');
    return null;
  }

  const coordinates = path.map((id) => {
    const node = nodes[id];
    return [node.lat, node.lng];
  });

  const fullPath = [
    [startLat, startLng],
    ...coordinates,
    [endLat, endLng],
  ];

  console.log(`✅ Rota encontrada com ${fullPath.length} pontos`);
  return fullPath;
};
