import { describe, it, expect, beforeEach } from 'vitest';
import { Graph, NegativeWeightError } from '@shared/graph/Graph';

describe('Graph Data Structure (Adjacency List)', () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph();
  });

  it('adds and retrieves nodes correctly', () => {
    graph.addNode({ id: 'A', label: 'Origen A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'Destino B', x: 10, y: 20 });

    expect(graph.hasNode('A')).toBe(true);
    expect(graph.hasNode('B')).toBe(true);
    expect(graph.hasNode('C')).toBe(false);
    expect(graph.getNodeCount()).toBe(2);

    const nodeA = graph.getNode('A');
    expect(nodeA).toEqual({ id: 'A', label: 'Origen A', x: 0, y: 0 });
  });

  it('adds bidirectional edges by default', () => {
    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 0 });

    graph.addEdge({
      id: 'e1',
      from: 'A',
      to: 'B',
      weight: 15.5,
    });

    // En grafos bidireccionales, A es vecino de B y B es vecino de A
    expect(graph.getEdgeWeight('A', 'B')).toBe(15.5);
    expect(graph.getEdgeWeight('B', 'A')).toBe(15.5);

    const neighborsA = graph.getNeighbors('A');
    expect(neighborsA.length).toBe(1);
    expect(neighborsA[0].nodeId).toBe('B');
    expect(neighborsA[0].weight).toBe(15.5);

    const neighborsB = graph.getNeighbors('B');
    expect(neighborsB.length).toBe(1);
    expect(neighborsB[0].nodeId).toBe('A');
  });

  it('supports directed edges when bidirectional is false', () => {
    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 0 });

    graph.addEdge({
      id: 'e1',
      from: 'A',
      to: 'B',
      weight: 8,
      bidirectional: false,
    });

    expect(graph.getEdgeWeight('A', 'B')).toBe(8);
    expect(graph.getEdgeWeight('B', 'A')).toBeNull();
    expect(graph.getNeighbors('B').length).toBe(0);
  });

  it('removes nodes and all connected edges', () => {
    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 0 });
    graph.addNode({ id: 'C', label: 'C', x: 20, y: 0 });

    graph.addEdge({ id: 'e1', from: 'A', to: 'B', weight: 5 });
    graph.addEdge({ id: 'e2', from: 'B', to: 'C', weight: 5 });

    expect(graph.removeNode('B')).toBe(true);
    expect(graph.hasNode('B')).toBe(false);
    expect(graph.getNodeCount()).toBe(2);

    // Las aristas conectadas a B deben desaparecer
    expect(graph.getNeighbors('A').length).toBe(0);
    expect(graph.getNeighbors('C').length).toBe(0);
  });

  it('throws NegativeWeightError when adding edge with negative weight', () => {
    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 0 });

    expect(() => {
      graph.addEdge({ id: 'neg', from: 'A', to: 'B', weight: -5 });
    }).toThrow(NegativeWeightError);
  });

  it('validates graph integrity', () => {
    const emptyValidation = graph.validate();
    expect(emptyValidation.valid).toBe(false);
    expect(emptyValidation.errors[0]).toContain('El grafo está vacío');

    graph.addNode({ id: 'A', label: 'A', x: 0, y: 0 });
    graph.addNode({ id: 'B', label: 'B', x: 10, y: 0 });
    graph.addEdge({ id: 'e1', from: 'A', to: 'B', weight: 10 });

    const validValidation = graph.validate();
    expect(validValidation.valid).toBe(true);
    expect(validValidation.errors.length).toBe(0);
  });
});
