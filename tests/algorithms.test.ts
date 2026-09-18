import { describe, it, expect } from 'vitest';
import { Graph } from '@shared/graph/Graph';
import { dijkstra } from '@shared/algorithms/dijkstra';
import { astar } from '@shared/algorithms/astar';
import { zeroHeuristic } from '@shared/algorithms/heuristics';
import { compareAlgorithms } from '@shared/algorithms/compare';

describe('Pathfinding Algorithms: Dijkstra & A*', () => {
  // Helper para construir un grafo en diamante con dos caminos alternativos
  // A -> B (weight: 10), B -> D (weight: 10) => total 20
  // A -> C (weight: 4),  C -> D (weight: 5)  => total 9 (Óptimo)
  const createDiamondGraph = () => {
    const g = new Graph();
    g.addNode({ id: 'A', label: 'Origen', x: 0, y: 0 });
    g.addNode({ id: 'B', label: 'Norte', x: 10, y: 10 });
    g.addNode({ id: 'C', label: 'Sur', x: 10, y: -10 });
    g.addNode({ id: 'D', label: 'Destino', x: 20, y: 0 });

    g.addEdge({ id: 'ab', from: 'A', to: 'B', weight: 10 });
    g.addEdge({ id: 'bd', from: 'B', to: 'D', weight: 10 });
    g.addEdge({ id: 'ac', from: 'A', to: 'C', weight: 4 });
    g.addEdge({ id: 'cd', from: 'C', to: 'D', weight: 5 });
    return g;
  };

  it('both find the exact same optimal shortest path in a multi-path graph', () => {
    const graph = createDiamondGraph();

    const dijkstraResult = dijkstra(graph, 'A', 'D');
    const astarResult = astar(graph, 'A', 'D');

    // Ambos deben seleccionar el camino A -> C -> D con distancia 9
    expect(dijkstraResult.path).toEqual(['A', 'C', 'D']);
    expect(astarResult.path).toEqual(['A', 'C', 'D']);

    expect(dijkstraResult.totalDistance).toBe(9);
    expect(astarResult.totalDistance).toBe(9);
    expect(dijkstraResult.unreachable).toBe(false);
    expect(astarResult.unreachable).toBe(false);
  });

  it('handles start === target edge case properly', () => {
    const graph = createDiamondGraph();

    const dijkstraResult = dijkstra(graph, 'A', 'A');
    const astarResult = astar(graph, 'A', 'A');

    expect(dijkstraResult.path).toEqual(['A']);
    expect(dijkstraResult.totalDistance).toBe(0);
    expect(dijkstraResult.unreachable).toBe(false);
    expect(dijkstraResult.steps[0].type).toBe('finish');

    expect(astarResult.path).toEqual(['A']);
    expect(astarResult.totalDistance).toBe(0);
    expect(astarResult.unreachable).toBe(false);
  });

  it('handles disconnected graphs and unreachable target', () => {
    const graph = createDiamondGraph();
    // Agregar un nodo aislado sin ninguna arista
    graph.addNode({ id: 'ISOLATED', label: 'Isla', x: 100, y: 100 });

    const dijkstraResult = dijkstra(graph, 'A', 'ISOLATED');
    const astarResult = astar(graph, 'A', 'ISOLATED');

    expect(dijkstraResult.unreachable).toBe(true);
    expect(dijkstraResult.path).toEqual([]);
    expect(dijkstraResult.totalDistance).toBe(Infinity);

    expect(astarResult.unreachable).toBe(true);
    expect(astarResult.path).toEqual([]);
    expect(astarResult.totalDistance).toBe(Infinity);
  });

  it('A* with zero heuristic (h(n) = 0) behaves identically to Dijkstra', () => {
    const graph = createDiamondGraph();

    const dijkstraResult = dijkstra(graph, 'A', 'D');
    const astarZeroResult = astar(graph, 'A', 'D', { heuristic: zeroHeuristic });

    expect(astarZeroResult.path).toEqual(dijkstraResult.path);
    expect(astarZeroResult.totalDistance).toBe(dijkstraResult.totalDistance);
    expect(astarZeroResult.visitedCount).toBe(dijkstraResult.visitedCount);
  });

  it('demonstrates that A* visits fewer nodes in a directed geometric corridor scenario', () => {
    // Escenario geométrico euclidiano consistente (weight >= distancia geométrica):
    // Origen: (0, 0) -> Destino: (100, 0)
    // Camino directo hacia el destino:
    // (0,0) -> (20,0) -> (40,0) -> (60,0) -> (80,0) -> (100,0) con peso 20 por tramo
    // Ramas distractoras perpendiculares al objetivo (hacia Norte y Sur):
    // Con pesos pequeños (15), Dijkstra las explora radialmente porque g < 100.
    // A* no las explora porque f = g + h >= 15 + 101 = 116, mientras que el camino hacia la meta tiene f = 20 + 80 = 100.
    const graph = new Graph();

    // Nodos directos hacia el objetivo (Este)
    graph.addNode({ id: 'START', label: 'Start', x: 0, y: 0 });
    graph.addNode({ id: 'E1', label: 'E1', x: 20, y: 0 });
    graph.addNode({ id: 'E2', label: 'E2', x: 40, y: 0 });
    graph.addNode({ id: 'E3', label: 'E3', x: 60, y: 0 });
    graph.addNode({ id: 'E4', label: 'E4', x: 80, y: 0 });
    graph.addNode({ id: 'GOAL', label: 'Goal', x: 100, y: 0 });

    graph.addEdge({ id: 'e01', from: 'START', to: 'E1', weight: 20 });
    graph.addEdge({ id: 'e12', from: 'E1', to: 'E2', weight: 20 });
    graph.addEdge({ id: 'e23', from: 'E2', to: 'E3', weight: 20 });
    graph.addEdge({ id: 'e34', from: 'E3', to: 'E4', weight: 20 });
    graph.addEdge({ id: 'e4g', from: 'E4', to: 'GOAL', weight: 20 });

    // Ramas distractoras perpendiculares (Norte y Sur)
    graph.addNode({ id: 'N1', label: 'N1', x: 0, y: 15 });
    graph.addNode({ id: 'N2', label: 'N2', x: 0, y: 30 });
    graph.addNode({ id: 'N3', label: 'N3', x: 0, y: 45 });
    graph.addNode({ id: 'S1', label: 'S1', x: 0, y: -15 });
    graph.addNode({ id: 'S2', label: 'S2', x: 0, y: -30 });
    graph.addNode({ id: 'S3', label: 'S3', x: 0, y: -45 });

    graph.addEdge({ id: 'en1', from: 'START', to: 'N1', weight: 15 });
    graph.addEdge({ id: 'en2', from: 'N1', to: 'N2', weight: 15 });
    graph.addEdge({ id: 'en3', from: 'N2', to: 'N3', weight: 15 });
    graph.addEdge({ id: 'es1', from: 'START', to: 'S1', weight: 15 });
    graph.addEdge({ id: 'es2', from: 'S1', to: 'S2', weight: 15 });
    graph.addEdge({ id: 'es3', from: 'S2', to: 'S3', weight: 15 });

    const dijkstraResult = dijkstra(graph, 'START', 'GOAL');
    const astarResult = astar(graph, 'START', 'GOAL');

    // Ambos deben encontrar exactamente el camino óptimo de costo 100
    expect(dijkstraResult.totalDistance).toBe(100);
    expect(astarResult.totalDistance).toBe(100);

    // Dijkstra explora radialmente las ramas N1, N2, N3, S1, S2, S3 porque sus distancias son < 100.
    // A* se enfoca directamente hacia el objetivo gracias a la heurística euclidiana admisible.
    expect(astarResult.visitedCount).toBe(6);
    expect(dijkstraResult.visitedCount).toBeGreaterThan(astarResult.visitedCount);
  });

  it('records chronological steps for visualization', () => {
    const graph = createDiamondGraph();
    const result = dijkstra(graph, 'A', 'D');

    expect(result.steps.length).toBeGreaterThan(0);
    const stepTypes = result.steps.map((s) => s.type);

    expect(stepTypes).toContain('visit_node');
    expect(stepTypes).toContain('examine_edge');
    expect(stepTypes).toContain('update_distance');
    expect(stepTypes[stepTypes.length - 1]).toBe('finish');
  });

  it('compareAlgorithms utility computes deltas correctly without declaring a false universal winner', () => {
    const graph = createDiamondGraph();
    const comparison = compareAlgorithms(graph.toJSON(), 'A', 'D');

    expect(comparison.sameOptimalDistance).toBe(true);
    expect(comparison.dijkstra.totalDistance).toBe(9);
    expect(comparison.astar.totalDistance).toBe(9);
    expect(typeof comparison.visitedNodesDelta).toBe('number');
    expect(typeof comparison.examinedEdgesDelta).toBe('number');
  });
});
