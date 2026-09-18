import { GraphData, GraphEdge, GraphNode } from '../types/graph';

export interface NeighborInfo {
  nodeId: string;
  weight: number;
  time: number;
  edgeId: string;
}

export class NegativeWeightError extends Error {
  constructor(message = 'Dijkstra y A* no admiten aristas con pesos negativos.') {
    super(message);
    this.name = 'NegativeWeightError';
  }
}

export class Graph {
  private nodes: Map<string, GraphNode> = new Map();
  // Adjacency map: fromNodeId -> (toNodeId -> NeighborInfo)
  private adjacency: Map<string, Map<string, NeighborInfo>> = new Map();

  constructor(data?: GraphData) {
    if (data) {
      this.load(data);
    }
  }

  /**
   * Carga nodos y aristas desde una estructura GraphData
   */
  public load(data: GraphData): void {
    this.clear();
    for (const node of data.nodes) {
      this.addNode(node);
    }
    for (const edge of data.edges) {
      this.addEdge(edge);
    }
  }

  /**
   * Limpia el grafo por completo
   */
  public clear(): void {
    this.nodes.clear();
    this.adjacency.clear();
  }

  /**
   * Agrega un nodo al grafo
   */
  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Map());
    }
  }

  /**
   * Elimina un nodo y todas las aristas conectadas a él
   */
  public removeNode(id: string): boolean {
    if (!this.nodes.has(id)) return false;

    // Eliminar aristas salientes
    this.adjacency.delete(id);

    // Eliminar aristas entrantes de otros nodos
    for (const [, neighbors] of this.adjacency) {
      neighbors.delete(id);
    }

    this.nodes.delete(id);
    return true;
  }

  /**
   * Verifica si un nodo existe
   */
  public hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /**
   * Obtiene un nodo por su identificador
   */
  public getNode(id: string): GraphNode | undefined {
    const n = this.nodes.get(id);
    return n ? { ...n } : undefined;
  }

  /**
   * Retorna todos los nodos
   */
  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values()).map((n) => ({ ...n }));
  }

  /**
   * Retorna el número de nodos
   */
  public getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Agrega una conexión (arista) entre dos nodos.
   * Por defecto es bidireccional si no se especifica.
   */
  public addEdge(edge: GraphEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`No se puede agregar arista entre nodos inexistentes: ${edge.from} -> ${edge.to}`);
    }

    if (edge.weight < 0) {
      throw new NegativeWeightError(`Peso negativo no permitido: ${edge.weight} en arista ${edge.from} -> ${edge.to}`);
    }

    const estimatedTime = edge.time !== undefined && edge.time >= 0
      ? edge.time
      : Number((edge.weight * 1.5).toFixed(1)); // Estimación por defecto: 1.5 min por km

    // Conexión from -> to
    const fromNeighbors = this.adjacency.get(edge.from)!;
    fromNeighbors.set(edge.to, {
      nodeId: edge.to,
      weight: edge.weight,
      time: estimatedTime,
      edgeId: edge.id,
    });

    // Si es bidireccional (por defecto true)
    if (edge.bidirectional !== false) {
      const toNeighbors = this.adjacency.get(edge.to)!;
      toNeighbors.set(edge.from, {
        nodeId: edge.from,
        weight: edge.weight,
        time: estimatedTime,
        edgeId: edge.id,
      });
    }
  }

  /**
   * Elimina una arista entre dos nodos
   */
  public removeEdge(from: string, to: string, bidirectional = true): boolean {
    let removed = false;
    const fromMap = this.adjacency.get(from);
    if (fromMap && fromMap.has(to)) {
      fromMap.delete(to);
      removed = true;
    }

    if (bidirectional) {
      const toMap = this.adjacency.get(to);
      if (toMap && toMap.has(from)) {
        toMap.delete(from);
        removed = true;
      }
    }

    return removed;
  }

  /**
   * Obtiene la lista de vecinos de un nodo
   */
  public getNeighbors(id: string): NeighborInfo[] {
    const neighborsMap = this.adjacency.get(id);
    if (!neighborsMap) return [];
    return Array.from(neighborsMap.values());
  }

  /**
   * Obtiene el peso de la arista entre dos nodos, o null si no existe
   */
  public getEdgeWeight(from: string, to: string): number | null {
    const neighbors = this.adjacency.get(from);
    if (!neighbors) return null;
    const info = neighbors.get(to);
    return info ? info.weight : null;
  }

  /**
   * Obtiene la arista entre dos nodos
   */
  public getEdgeInfo(from: string, to: string): NeighborInfo | null {
    const neighbors = this.adjacency.get(from);
    if (!neighbors) return null;
    return neighbors.get(to) || null;
  }

  /**
   * Retorna todas las aristas sin duplicados para aristas bidireccionales
   */
  public getEdges(): GraphEdge[] {
    const seen = new Set<string>();
    const edges: GraphEdge[] = [];

    for (const [fromId, neighbors] of this.adjacency) {
      for (const [toId, info] of neighbors) {
        const pairKey = fromId < toId ? `${fromId}->${toId}` : `${toId}->${fromId}`;
        const reverseNeighbor = this.adjacency.get(toId)?.get(fromId);
        const isBidi = !!reverseNeighbor && reverseNeighbor.weight === info.weight;

        if (isBidi) {
          if (!seen.has(pairKey)) {
            seen.add(pairKey);
            edges.push({
              id: info.edgeId,
              from: fromId,
              to: toId,
              weight: info.weight,
              time: info.time,
              bidirectional: true,
            });
          }
        } else {
          const directedKey = `dir:${fromId}->${toId}`;
          if (!seen.has(directedKey)) {
            seen.add(directedKey);
            edges.push({
              id: info.edgeId,
              from: fromId,
              to: toId,
              weight: info.weight,
              time: info.time,
              bidirectional: false,
            });
          }
        }
      }
    }

    return edges;
  }

  /**
   * Valida la integridad del grafo
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.nodes.size === 0) {
      errors.push('El grafo está vacío. Debe contener al menos un nodo.');
    }

    for (const [fromId, neighbors] of this.adjacency) {
      if (!this.nodes.has(fromId)) {
        errors.push(`Existe una lista de adyacencia para un nodo inexistente: ${fromId}`);
      }
      for (const [toId, info] of neighbors) {
        if (!this.nodes.has(toId)) {
          errors.push(`Arista apunta a un nodo destino inexistente: ${toId}`);
        }
        if (info.weight < 0) {
          errors.push(`Arista con peso negativo detectada: ${fromId} -> ${toId} (${info.weight})`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Serializa el grafo a la estructura GraphData
   */
  public toJSON(): GraphData {
    return {
      nodes: this.getNodes(),
      edges: this.getEdges(),
    };
  }

  /**
   * Crea una instancia de Graph a partir de GraphData
   */
  public static fromJSON(data: GraphData): Graph {
    return new Graph(data);
  }
}
