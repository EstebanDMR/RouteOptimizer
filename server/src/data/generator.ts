import { GraphData, GraphEdge, GraphNode, ScenarioPreset } from '@shared/types/graph';

export interface GeneratorOptions {
  nodeCount?: number;
  width?: number;
  height?: number;
  density?: 'sparse' | 'medium' | 'dense';
}

/**
 * Generador de grafos aleatorios controlados.
 * Garantiza que:
 * 1. El grafo es 100% conexo entre el origen y el destino.
 * 2. No existen aristas con pesos negativos.
 * 3. Las posiciones espaciales son legibles y distribuidas en el lienzo.
 * 4. Las aristas se conectan preferentemente entre nodos vecinos cercanos (apariencia de red vial real).
 */
export function generateRandomConnectedGraph(options: GeneratorOptions = {}): ScenarioPreset {
  const nodeCount = Math.min(60, Math.max(8, options.nodeCount || 18));
  const width = options.width || 800;
  const height = options.height || 550;
  const padding = 60;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 1. Generar nodos con separación mínima
  for (let i = 0; i < nodeCount; i++) {
    const id = `R${String(i + 1).padStart(2, '0')}`;
    let x = 0;
    let y = 0;
    let tooClose = true;
    let attempts = 0;

    while (tooClose && attempts < 50) {
      x = Math.round(padding + Math.random() * (width - 2 * padding));
      y = Math.round(padding + Math.random() * (height - 2 * padding));
      tooClose = nodes.some((n) => Math.hypot(n.x - x, n.y - y) < 45);
      attempts++;
    }

    nodes.push({
      id,
      label: `Punto de Distribución ${id}`,
      x,
      y,
    });
  }

  // 2. Construir árbol de expansión (Spanning Tree) para garantizar conectividad total
  const connected = new Set<string>([nodes[0].id]);
  const unconnected = new Set<string>(nodes.slice(1).map((n) => n.id));
  const nodeMap = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));
  let edgeCounter = 1;

  while (unconnected.size > 0) {
    let closestDist = Infinity;
    let bestFrom: string | null = null;
    let bestTo: string | null = null;

    for (const cId of connected) {
      const cNode = nodeMap.get(cId)!;
      for (const uId of unconnected) {
        const uNode = nodeMap.get(uId)!;
        const d = Math.hypot(cNode.x - uNode.x, cNode.y - uNode.y);
        if (d < closestDist) {
          closestDist = d;
          bestFrom = cId;
          bestTo = uId;
        }
      }
    }

    if (bestFrom && bestTo) {
      connected.add(bestTo);
      unconnected.delete(bestTo);

      const w = Number((closestDist * 0.08).toFixed(1));
      edges.push({
        id: `re_${edgeCounter++}`,
        from: bestFrom,
        to: bestTo,
        weight: Math.max(1.5, w),
        time: Math.round(w * 1.4),
        bidirectional: true,
      });
    }
  }

  // 3. Agregar aristas adicionales basadas en proximidad para crear caminos alternativos
  const extraK = options.density === 'dense' ? 3 : options.density === 'sparse' ? 1 : 2;
  const existingPairs = new Set<string>();
  for (const e of edges) {
    const key = e.from < e.to ? `${e.from}-${e.to}` : `${e.to}-${e.from}`;
    existingPairs.add(key);
  }

  for (const node of nodes) {
    // Buscar los k vecinos más cercanos
    const candidates = nodes
      .filter((n) => n.id !== node.id)
      .map((n) => ({
        id: n.id,
        distance: Math.hypot(n.x - node.x, n.y - node.y),
      }))
      .sort((a, b) => a.distance - b.distance);

    for (let k = 0; k < Math.min(extraK, candidates.length); k++) {
      const candidate = candidates[k];
      const key = node.id < candidate.id ? `${node.id}-${candidate.id}` : `${candidate.id}-${node.id}`;

      if (!existingPairs.has(key) && candidate.distance < 200) {
        existingPairs.add(key);
        const w = Number((candidate.distance * 0.08).toFixed(1));
        edges.push({
          id: `re_${edgeCounter++}`,
          from: node.id,
          to: candidate.id,
          weight: Math.max(1.5, w),
          time: Math.round(w * 1.4),
          bidirectional: true,
        });
      }
    }
  }

  // 4. Seleccionar origen en un extremo y destino en el otro para una búsqueda significativa
  nodes.sort((a, b) => a.x - b.x);
  const defaultStart = nodes[0].id;
  const defaultTarget = nodes[nodes.length - 1].id;

  const graph: GraphData = { nodes, edges };

  return {
    id: `random-${Date.now()}`,
    name: `Red Conexa Generada (${nodeCount} nodos)`,
    description: 'Escenario sintético generado algorítmicamente con conectividad garantizada.',
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graph,
    defaultStart,
    defaultTarget,
  };
}
