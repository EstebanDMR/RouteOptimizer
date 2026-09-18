import { AlgorithmRequest } from '@shared/types/graph';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export function validateAlgorithmRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'El cuerpo de la solicitud no es un objeto JSON válido.', statusCode: 400 };
  }

  const req = body as Partial<AlgorithmRequest>;

  if (!req.graph || typeof req.graph !== 'object') {
    return { isValid: false, error: 'Se requiere un objeto "graph" válido en la solicitud.', statusCode: 400 };
  }

  if (!Array.isArray(req.graph.nodes) || req.graph.nodes.length === 0) {
    return { isValid: false, error: 'El grafo no contiene nodos. Debe incluir al menos un nodo.', statusCode: 400 };
  }

  if (!req.startNodeId || typeof req.startNodeId !== 'string') {
    return { isValid: false, error: 'Debe especificar un "startNodeId" válido (string).', statusCode: 400 };
  }

  if (!req.targetNodeId || typeof req.targetNodeId !== 'string') {
    return { isValid: false, error: 'Debe especificar un "targetNodeId" válido (string).', statusCode: 400 };
  }

  const nodeIds = new Set(req.graph.nodes.map((n) => n.id));

  if (!nodeIds.has(req.startNodeId)) {
    return {
      isValid: false,
      error: `El nodo de origen "${req.startNodeId}" no existe en el grafo proporcionado.`,
      statusCode: 400,
    };
  }

  if (!nodeIds.has(req.targetNodeId)) {
    return {
      isValid: false,
      error: `El nodo de destino "${req.targetNodeId}" no existe en el grafo proporcionado.`,
      statusCode: 400,
    };
  }

  if (Array.isArray(req.graph.edges)) {
    for (const edge of req.graph.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return {
          isValid: false,
          error: `Arista inválida: conecta con nodo inexistente (${edge.from} -> ${edge.to}).`,
          statusCode: 400,
        };
      }

      if (typeof edge.weight !== 'number' || isNaN(edge.weight)) {
        return {
          isValid: false,
          error: `El peso de la arista ${edge.from} -> ${edge.to} debe ser un número válido.`,
          statusCode: 400,
        };
      }

      if (edge.weight < 0) {
        return {
          isValid: false,
          error: `Dijkstra y A* no admiten aristas con pesos negativos (${edge.weight} en ${edge.from} -> ${edge.to}).`,
          statusCode: 400,
        };
      }
    }
  }

  return { isValid: true };
}
