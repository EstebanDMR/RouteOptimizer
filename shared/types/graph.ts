export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;          // Distancia (ej. km) >= 0
  time?: number;           // Tiempo estimado (minutos)
  bidirectional?: boolean; // Default: true
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type StepType = 
  | 'visit_node'       // Nodo extraído del Min-Heap para explorar sus vecinos
  | 'examine_edge'     // Inspección de la arista hacia un vecino
  | 'update_distance'  // Relajación de la arista (se encontró un camino de menor costo)
  | 'finish'           // Se llegó al nodo destino y se reconstruyó la ruta
  | 'unreachable';     // La cola quedó vacía sin alcanzar el destino

export interface AlgorithmStep {
  type: StepType;
  stepNumber: number;
  nodeId?: string;
  edge?: { from: string; to: string };
  currentDistance?: number;    // g(n): costo real acumulado desde origen
  heuristicCost?: number;      // h(n): costo estimado hasta destino (en A*)
  totalEstimatedCost?: number; // f(n) = g(n) + h(n)
  visitedNodesSoFar: string[]; // Nodos visitados acumulados
  examinedEdgesSoFar: Array<{ from: string; to: string }>;
}

export interface AlgorithmResult {
  algorithm: 'dijkstra' | 'astar';
  path: string[];              // Secuencia ordenada de IDs de nodos: ['A', 'B', 'C']
  totalDistance: number;       // Suma de distancias del camino
  estimatedTime: number;       // Suma de tiempos estimados (minutos)
  visitedNodes: string[];      // Lista ordenada de nodos visitados
  visitedCount: number;        // Total de nodos visitados
  examinedEdgesCount: number;  // Total de aristas examinadas
  executionTimeMs: number;     // Métrica experimental (medida con performance.now())
  steps: AlgorithmStep[];      // Pasos cronológicos para reproducción visual
  unreachable: boolean;        // true si no hay camino posible
}

export interface ComparisonResult {
  dijkstra: AlgorithmResult;
  astar: AlgorithmResult;
  sameOptimalDistance: boolean;
  visitedNodesDelta: number;    // dijkstra.visitedCount - astar.visitedCount
  examinedEdgesDelta: number;   // dijkstra.examinedEdgesCount - astar.examinedEdgesCount
  timeDeltaMs: number;          // dijkstra.executionTimeMs - astar.executionTimeMs
}

export interface AlgorithmRequest {
  graph: GraphData;
  startNodeId: string;
  targetNodeId: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  graph: GraphData;
  defaultStart: string;
  defaultTarget: string;
}
