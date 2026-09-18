import { describe, it, expect } from 'vitest';
import { Graph, NegativeWeightError } from '@shared/graph/Graph';
import { dijkstra } from '@shared/algorithms/dijkstra';
import { astar } from '@shared/algorithms/astar';
import { GraphData } from '@shared/types/graph';

describe('Validation and Error Handling', () => {
  it('throws error when start node does not exist in graph', () => {
    const graph = new Graph();
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 10 });

    expect(() => dijkstra(graph, 'NON_EXISTENT', 'B')).toThrow('no existe en el grafo');
    expect(() => astar(graph, 'NON_EXISTENT', 'B')).toThrow('no existe en el grafo');
  });

  it('throws error when target node does not exist in graph', () => {
    const graph = new Graph();
    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });

    expect(() => dijkstra(graph, 'A', 'NON_EXISTENT')).toThrow('no existe en el grafo');
    expect(() => astar(graph, 'A', 'NON_EXISTENT')).toThrow('no existe en el grafo');
  });

  it('strictly rejects negative edge weights with NegativeWeightError in Dijkstra and A*', () => {
    // Grafo con peso negativo inyectado
    const invalidGraphData: GraphData = {
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 10, y: 0 },
      ],
      edges: [
        { id: 'e1', from: 'A', to: 'B', weight: -3.5 },
      ],
    };

    expect(() => dijkstra(invalidGraphData, 'A', 'B')).toThrow(NegativeWeightError);
    expect(() => astar(invalidGraphData, 'A', 'B')).toThrow(NegativeWeightError);
  });

  it('validates node coordinates and rejects NaN / Infinity', async () => {
    const { validateAlgorithmRequest } = await import('../server/src/utils/validation');

    const nanCoordsPayload = {
      graph: {
        nodes: [
          { id: 'A', label: 'A', x: NaN, y: 0 },
          { id: 'B', label: 'B', x: 10, y: 0 },
        ],
        edges: [],
      },
      startNodeId: 'A',
      targetNodeId: 'B',
    };

    const res = validateAlgorithmRequest(nanCoordsPayload);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('números finitos válidos');
  });

  it('rejects duplicate node IDs in request validation', async () => {
    const { validateAlgorithmRequest } = await import('../server/src/utils/validation');

    const duplicatePayload = {
      graph: {
        nodes: [
          { id: 'A', label: 'A1', x: 0, y: 0 },
          { id: 'A', label: 'A2', x: 10, y: 10 },
        ],
        edges: [],
      },
      startNodeId: 'A',
      targetNodeId: 'A',
    };

    const res = validateAlgorithmRequest(duplicatePayload);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('ID de nodo duplicado detectado');
  });

  it('rejects A* request when metric is "time"', async () => {
    const { validateAlgorithmRequest } = await import('../server/src/utils/validation');

    const astarTimePayload = {
      graph: {
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0 },
          { id: 'B', label: 'B', x: 10, y: 10 },
        ],
        edges: [{ id: 'e1', from: 'A', to: 'B', weight: 10 }],
      },
      startNodeId: 'A',
      targetNodeId: 'B',
      metric: 'time',
    };

    const res = validateAlgorithmRequest(astarTimePayload, 'astar');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('A* solo admite la optimización por "distance"');

    // Dijkstra sí debe admitir time
    const dijkstraRes = validateAlgorithmRequest(astarTimePayload, 'dijkstra');
    expect(dijkstraRes.isValid).toBe(true);
  });
});
