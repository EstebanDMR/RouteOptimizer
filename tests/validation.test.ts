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
});
