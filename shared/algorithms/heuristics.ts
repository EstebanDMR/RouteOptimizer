import { GraphData, GraphNode } from '../types/graph';

export type HeuristicFn = (
  currentNode: GraphNode,
  targetNode: GraphNode,
  scaleFactor?: number
) => number;

/**
 * Distancia Euclidiana en línea recta:
 * d_E(u, v) = sqrt((u.x - v.x)^2 + (u.y - v.y)^2) * scaleFactor
 *
 * Condiciones de Admisibilidad y Consistencia:
 * - Es admisible (h(n) <= h*(n)) si scaleFactor <= min_{(u,v) in E} (weight(u,v) / d_E(u,v)).
 * - En redes viales donde los pesos representan distancias reales por carretera (weight >= d_E),
 *   un scaleFactor de 1.0 garantiza admisibilidad y consistencia monotónica por desigualdad triangular.
 */
export const euclideanDistance: HeuristicFn = (
  currentNode: GraphNode,
  targetNode: GraphNode,
  scaleFactor = 1.0
): number => {
  const dx = currentNode.x - targetNode.x;
  const dy = currentNode.y - targetNode.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist * scaleFactor;
};

/**
 * Distancia Manhattan (L1 norm / Grid distance):
 * d_M(u, v) = (|u.x - v.x| + |u.y - v.y|) * scaleFactor
 * Adecuada para cuadrículas urbanas ortogonales sin diagonales.
 */
export const manhattanDistance: HeuristicFn = (
  currentNode: GraphNode,
  targetNode: GraphNode,
  scaleFactor = 1.0
): number => {
  const dx = Math.abs(currentNode.x - targetNode.x);
  const dy = Math.abs(currentNode.y - targetNode.y);
  return (dx + dy) * scaleFactor;
};

/**
 * Heurística nula (h(n) = 0):
 * Convierte el algoritmo A* formalmente en Dijkstra.
 * Permite verificar que cuando h(n) = 0, A* reproduce exactamente la búsqueda no informada de Dijkstra.
 */
export const zeroHeuristic: HeuristicFn = (): number => 0;

/**
 * Calcula dinámicamente un scaleFactor seguro para el grafo, garantizando
 * que h(n) nunca sobreestime el costo de ninguna arista directa:
 * alpha = min(1.0, min_{(u,v) in E} (weight(u,v) / euclideanDistance(u,v)))
 */
export function calculateSafeScaleFactor(graph: GraphData): number {
  if (!graph.edges || graph.edges.length === 0) {
    return 1.0;
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const n of graph.nodes) {
    nodeMap.set(n.id, n);
  }

  let minRatio = 1.0;

  for (const edge of graph.edges) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (fromNode && toNode) {
      const dx = fromNode.x - toNode.x;
      const dy = fromNode.y - toNode.y;
      const rawDistance = Math.sqrt(dx * dx + dy * dy);

      if (rawDistance > 0.001) {
        const ratio = edge.weight / rawDistance;
        if (ratio < minRatio) {
          minRatio = ratio;
        }
      }
    }
  }

  // Redondear a 4 decimales para estabilidad numérica
  return Math.max(0.0001, Number(minRatio.toFixed(4)));
}
