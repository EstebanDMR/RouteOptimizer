import { AlgorithmRequest } from '@shared/types/graph';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export function validateAlgorithmRequest(
  body: unknown,
  algorithmName?: 'dijkstra' | 'astar' | 'compare'
): ValidationResult {
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

  // Validación de Nodos
  const nodeIds = new Set<string>();
  for (const node of req.graph.nodes) {
    if (!node || typeof node !== 'object') {
      return { isValid: false, error: 'Cada nodo en el grafo debe ser un objeto válido.', statusCode: 400 };
    }

    if (!node.id || typeof node.id !== 'string' || node.id.trim() === '') {
      return { isValid: false, error: 'Todo nodo debe poseer un identificador "id" no vacío (string).', statusCode: 400 };
    }

    if (nodeIds.has(node.id)) {
      return { isValid: false, error: `ID de nodo duplicado detectado: "${node.id}".`, statusCode: 400 };
    }
    nodeIds.add(node.id);

    if (typeof node.x !== 'number' || !Number.isFinite(node.x) || typeof node.y !== 'number' || !Number.isFinite(node.y)) {
      return {
        isValid: false,
        error: `Las coordenadas (x, y) del nodo "${node.id}" deben ser números finitos válidos.`,
        statusCode: 400,
      };
    }
  }

  // Validación de Origen y Destino
  if (!req.startNodeId || typeof req.startNodeId !== 'string') {
    return { isValid: false, error: 'Debe especificar un "startNodeId" válido (string).', statusCode: 400 };
  }

  if (!req.targetNodeId || typeof req.targetNodeId !== 'string') {
    return { isValid: false, error: 'Debe especificar un "targetNodeId" válido (string).', statusCode: 400 };
  }

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

  // Validación de Métrica
  if (req.metric !== undefined && req.metric !== 'distance' && req.metric !== 'time') {
    return {
      isValid: false,
      error: `Métrica no soportada: "${req.metric}". Las métricas válidas son "distance" o "time".`,
      statusCode: 400,
    };
  }

  // A* solo admite 'distance'
  if (algorithmName === 'astar' && req.metric === 'time') {
    return {
      isValid: false,
      error: 'A* solo admite la optimización por "distance" para garantizar la admisibilidad y consistencia de la heurística euclidiana.',
      statusCode: 400,
    };
  }

  // Validación de Aristas
  if (Array.isArray(req.graph.edges)) {
    const edgeIds = new Set<string>();

    for (const edge of req.graph.edges) {
      if (!edge || typeof edge !== 'object') {
        return { isValid: false, error: 'Cada arista en el grafo debe ser un objeto válido.', statusCode: 400 };
      }

      if (edge.id && typeof edge.id === 'string') {
        if (edgeIds.has(edge.id)) {
          return { isValid: false, error: `ID de arista duplicado detectado: "${edge.id}".`, statusCode: 400 };
        }
        edgeIds.add(edge.id);
      }

      if (!edge.from || !edge.to || typeof edge.from !== 'string' || typeof edge.to !== 'string') {
        return { isValid: false, error: 'Toda arista debe definir extremos "from" y "to" válidos.', statusCode: 400 };
      }

      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return {
          isValid: false,
          error: `Arista inválida: conecta con nodo inexistente (${edge.from} -> ${edge.to}).`,
          statusCode: 400,
        };
      }

      if (typeof edge.weight !== 'number' || !Number.isFinite(edge.weight)) {
        return {
          isValid: false,
          error: `El peso de la arista ${edge.from} -> ${edge.to} debe ser un número finito válido.`,
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

      if (edge.time !== undefined) {
        if (typeof edge.time !== 'number' || !Number.isFinite(edge.time) || edge.time < 0) {
          return {
            isValid: false,
            error: `El tiempo estimado de la arista ${edge.from} -> ${edge.to} debe ser un número finito no negativo.`,
            statusCode: 400,
          };
        }
      }
    }
  }

  return { isValid: true };
}
