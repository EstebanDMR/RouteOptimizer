import {
  AlgorithmRequest,
  AlgorithmResult,
  ComparisonResult,
} from '@shared/types/graph';
import { dijkstra } from '@shared/algorithms/dijkstra';
import { astar } from '@shared/algorithms/astar';
import { compareAlgorithms } from '@shared/algorithms/compare';

export class AlgorithmService {
  public runDijkstra(request: AlgorithmRequest): AlgorithmResult {
    return dijkstra(request.graph, request.startNodeId, request.targetNodeId);
  }

  public runAStar(request: AlgorithmRequest): AlgorithmResult {
    return astar(request.graph, request.startNodeId, request.targetNodeId);
  }

  public runComparison(request: AlgorithmRequest): ComparisonResult {
    return compareAlgorithms(request.graph, request.startNodeId, request.targetNodeId);
  }
}

export const algorithmService = new AlgorithmService();
