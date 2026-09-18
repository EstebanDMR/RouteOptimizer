import { Graph, NegativeWeightError } from '../graph/Graph';
import { AlgorithmResult, AlgorithmStep, GraphData } from '../types/graph';
import { calculateSafeScaleFactor, euclideanDistance, HeuristicFn } from './heuristics';
import { MinPriorityQueue } from './priorityQueue';

export interface AStarOptions {
  heuristic?: HeuristicFn;
  scaleFactor?: number;
  metric?: 'distance';
}

/**
 * Implementación manual de A* (A-Star) para caminos mínimos con función heurística.
 * f(n) = g(n) + h(n)
 * donde:
 *   g(n) = costo real acumulado desde el origen hasta n (distancia)
 *   h(n) = estimación heurística admisible desde n hasta el destino (distancia en línea recta)
 *
 * Optimiza estrictamente por distancia (metric: 'distance') para garantizar que g(n) y h(n)
 * compartan la misma unidad métrica dimensional, preservando la admisibilidad y consistencia.
 * Registra cada paso cronológico para reproducción visual fidedigna en la UI.
 */
export function astar(
  graphInput: Graph | GraphData,
  startNodeId: string,
  targetNodeId: string,
  options: AStarOptions = {}
): AlgorithmResult {
  const startTime = performance.now();
  const graph = graphInput instanceof Graph ? graphInput : new Graph(graphInput);

  // Validación de métrica soportada
  if (options.metric && (options.metric as string) !== 'distance') {
    throw new Error('A* solo admite la métrica "distance" para garantizar la admisibilidad y consistencia de la heurística euclidiana.');
  }

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
      heuristicCost: 0,
      totalEstimatedCost: 0,
      visitedNodesSoFar: [startNodeId],
      examinedEdgesSoFar: [],
    });

    return {
      algorithm: 'astar',
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

  const targetNode = graph.getNode(targetNodeId)!;
  const startNode = graph.getNode(startNodeId)!;

  // Heurística y factor de escala para admisibilidad garantizada
  const heuristicFn = options.heuristic || euclideanDistance;
  const safeScale = options.scaleFactor !== undefined
    ? options.scaleFactor
    : calculateSafeScaleFactor(graph.toJSON());

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const times = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const examinedEdges: Array<{ from: string; to: string }> = [];

  for (const node of graph.getNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
    times.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  const initialH = heuristicFn(startNode, targetNode, safeScale);
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, initialH);
  times.set(startNodeId, 0);

  // MinPriorityQueue donde la prioridad es f(n) = g(n) + h(n)
  const openSet = new MinPriorityQueue<string>();
  openSet.push(startNodeId, initialH);

  let targetReached = false;

  while (!openSet.isEmpty()) {
    const current = openSet.pop()!;
    const u = current.item;
    const currentG = gScore.get(u)!;
    const currentF = fScore.get(u)!;
    const uNode = graph.getNode(u)!;
    const currentH = heuristicFn(uNode, targetNode, safeScale);

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
      currentDistance: currentG,
      heuristicCost: Number(currentH.toFixed(2)),
      totalEstimatedCost: Number(currentF.toFixed(2)),
      visitedNodesSoFar: [...visitedOrder],
      examinedEdgesSoFar: [...examinedEdges],
    });

    // En A* con heurística consistente, al extraer el target de la cola el camino es óptimo
    if (u === targetNodeId) {
      targetReached = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);

    for (const neighbor of neighbors) {
      const v = neighbor.nodeId;
      const vNode = graph.getNode(v)!;
      const edgeWeight = neighbor.weight; // Siempre utiliza distancia
      const edgeTime = neighbor.time;

      examinedEdges.push({ from: u, to: v });

      // Registro de paso: examine_edge
      steps.push({
        type: 'examine_edge',
        stepNumber: stepCounter++,
        nodeId: u,
        edge: { from: u, to: v },
        currentDistance: currentG,
        heuristicCost: Number(currentH.toFixed(2)),
        totalEstimatedCost: Number(currentF.toFixed(2)),
        visitedNodesSoFar: [...visitedOrder],
        examinedEdgesSoFar: [...examinedEdges],
      });

      if (!visited.has(v)) {
        const tentativeG = currentG + edgeWeight;
        const currentBestG = gScore.get(v)!;

        if (tentativeG < currentBestG) {
          const h = heuristicFn(vNode, targetNode, safeScale);
          const f = tentativeG + h;

          previous.set(v, u);
          gScore.set(v, tentativeG);
          fScore.set(v, f);
          times.set(v, (times.get(u) || 0) + edgeTime);

          openSet.push(v, f);

          // Registro de paso: update_distance
          steps.push({
            type: 'update_distance',
            stepNumber: stepCounter++,
            nodeId: v,
            edge: { from: u, to: v },
            currentDistance: Number(tentativeG.toFixed(2)),
            heuristicCost: Number(h.toFixed(2)),
            totalEstimatedCost: Number(f.toFixed(2)),
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
      algorithm: 'astar',
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

  // Reconstrucción de la ruta
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
    algorithm: 'astar',
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
