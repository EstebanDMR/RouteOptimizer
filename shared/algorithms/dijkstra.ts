import { Graph, NegativeWeightError } from '../graph/Graph';
import { AlgorithmResult, AlgorithmStep, GraphData } from '../types/graph';
import { MinPriorityQueue } from './priorityQueue';

export interface DijkstraOptions {
  metric?: 'distance' | 'time';
}

/**
 * Implementación manual de Dijkstra para caminos mínimos con pesos no negativos.
 * Registra cada paso cronológico para reproducción visual fidedigna.
 */
export function dijkstra(
  graphInput: Graph | GraphData,
  startNodeId: string,
  targetNodeId: string,
  options: DijkstraOptions = {}
): AlgorithmResult {
  const startTime = performance.now();
  const graph = graphInput instanceof Graph ? graphInput : new Graph(graphInput);

  // Validación de existencia de nodos
  if (!graph.hasNode(startNodeId)) {
    throw new Error(`El nodo de origen "${startNodeId}" no existe en el grafo.`);
  }
  if (!graph.hasNode(targetNodeId)) {
    throw new Error(`El nodo de destino "${targetNodeId}" no existe en el grafo.`);
  }

  // Validación de pesos negativos
  for (const edge of graph.getEdges()) {
    if (edge.weight < 0) {
      throw new NegativeWeightError(`Peso negativo no permitido: ${edge.weight} en la arista ${edge.from} -> ${edge.to}`);
    }
  }

  const steps: AlgorithmStep[] = [];
  let stepCounter = 1;

  // Manejo directo de caso especial: Origen === Destino
  if (startNodeId === targetNodeId) {
    const endTime = performance.now();
    const executionTimeMs = Number((endTime - startTime).toFixed(3));

    steps.push({
      type: 'finish',
      stepNumber: stepCounter++,
      nodeId: startNodeId,
      currentDistance: 0,
      totalEstimatedCost: 0,
      visitedNodesSoFar: [startNodeId],
      examinedEdgesSoFar: [],
    });

    return {
      algorithm: 'dijkstra',
      path: [startNodeId],
      totalDistance: 0,
      estimatedTime: 0,
      visitedNodes: [startNodeId],
      visitedCount: 1,
      examinedEdgesCount: 0,
      executionTimeMs,
      steps,
      unreachable: false,
    };
  }

  const distances = new Map<string, number>();
  const times = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const examinedEdges: Array<{ from: string; to: string }> = [];

  // Inicializar distancias a infinito
  for (const node of graph.getNodes()) {
    distances.set(node.id, Infinity);
    times.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  distances.set(startNodeId, 0);
  times.set(startNodeId, 0);

  // MinPriorityQueue donde la prioridad es la distancia acumulada g(u)
  const pq = new MinPriorityQueue<string>();
  pq.push(startNodeId, 0);

  let targetReached = false;

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    const u = current.item;
    const currentDist = current.priority;

    // Si ya procesamos este nodo con una distancia menor, saltarlo
    if (visited.has(u)) {
      continue;
    }

    visited.add(u);
    visitedOrder.push(u);

    // Registro de paso: visit_node
    steps.push({
      type: 'visit_node',
      stepNumber: stepCounter++,
      nodeId: u,
      currentDistance: currentDist,
      totalEstimatedCost: currentDist,
      visitedNodesSoFar: [...visitedOrder],
      examinedEdgesSoFar: [...examinedEdges],
    });

    // Si hemos alcanzado el destino, detenemos la búsqueda inmediatamente
    if (u === targetNodeId) {
      targetReached = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);

    for (const neighbor of neighbors) {
      const v = neighbor.nodeId;
      const edgeWeight = options.metric === 'time' ? neighbor.time : neighbor.weight;
      const edgeTime = neighbor.time;

      examinedEdges.push({ from: u, to: v });

      // Registro de paso: examine_edge
      steps.push({
        type: 'examine_edge',
        stepNumber: stepCounter++,
        nodeId: u,
        edge: { from: u, to: v },
        currentDistance: currentDist,
        visitedNodesSoFar: [...visitedOrder],
        examinedEdgesSoFar: [...examinedEdges],
      });

      if (!visited.has(v)) {
        const altDist = currentDist + edgeWeight;
        const currentBestDist = distances.get(v)!;

        if (altDist < currentBestDist) {
          distances.set(v, altDist);
          times.set(v, (times.get(u) || 0) + edgeTime);
          previous.set(v, u);

          pq.push(v, altDist);

          // Registro de paso: update_distance (relajación exitosa)
          steps.push({
            type: 'update_distance',
            stepNumber: stepCounter++,
            nodeId: v,
            edge: { from: u, to: v },
            currentDistance: altDist,
            totalEstimatedCost: altDist,
            visitedNodesSoFar: [...visitedOrder],
            examinedEdgesSoFar: [...examinedEdges],
          });
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTimeMs = Number((endTime - startTime).toFixed(3));

  // Caso: Destino inalcanzable
  if (!targetReached) {
    steps.push({
      type: 'unreachable',
      stepNumber: stepCounter++,
      nodeId: targetNodeId,
      visitedNodesSoFar: [...visitedOrder],
      examinedEdgesSoFar: [...examinedEdges],
    });

    return {
      algorithm: 'dijkstra',
      path: [],
      totalDistance: Infinity,
      estimatedTime: Infinity,
      visitedNodes: visitedOrder,
      visitedCount: visitedOrder.length,
      examinedEdgesCount: examinedEdges.length,
      executionTimeMs,
      steps,
      unreachable: true,
    };
  }

  // Reconstrucción del camino óptimo desde previous
  const path: string[] = [];
  let curr: string | null = targetNodeId;

  while (curr !== null) {
    path.unshift(curr);
    curr = previous.get(curr) || null;
  }

  // Calcular la distancia y tiempo exactos recorriendo la ruta reconstruida
  let totalDistance = 0;
  let estimatedTime = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const edgeInfo = graph.getEdgeInfo(fromId, toId);
    if (edgeInfo) {
      totalDistance += edgeInfo.weight;
      estimatedTime += edgeInfo.time;
    }
  }

  totalDistance = Number(totalDistance.toFixed(2));
  estimatedTime = Number(estimatedTime.toFixed(1));

  // Registro de paso final
  steps.push({
    type: 'finish',
    stepNumber: stepCounter++,
    nodeId: targetNodeId,
    currentDistance: totalDistance,
    totalEstimatedCost: totalDistance,
    visitedNodesSoFar: [...visitedOrder],
    examinedEdgesSoFar: [...examinedEdges],
  });

  return {
    algorithm: 'dijkstra',
    path,
    totalDistance,
    estimatedTime,
    visitedNodes: visitedOrder,
    visitedCount: visitedOrder.length,
    examinedEdgesCount: examinedEdges.length,
    executionTimeMs,
    steps,
    unreachable: false,
  };
}
