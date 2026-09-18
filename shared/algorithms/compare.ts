import { ComparisonResult, GraphData } from '../types/graph';
import { astar, AStarOptions } from './astar';
import { dijkstra, DijkstraOptions } from './dijkstra';

export function compareAlgorithms(
  graph: GraphData,
  startNodeId: string,
  targetNodeId: string,
  options?: { dijkstra?: DijkstraOptions; astar?: AStarOptions }
): ComparisonResult {
  const dijkstraResult = dijkstra(graph, startNodeId, targetNodeId, options?.dijkstra);
  const astarResult = astar(graph, startNodeId, targetNodeId, options?.astar);

  const distDiff = Math.abs(dijkstraResult.totalDistance - astarResult.totalDistance);
  const sameOptimalDistance = distDiff < 0.01;

  return {
    dijkstra: dijkstraResult,
    astar: astarResult,
    sameOptimalDistance,
    visitedNodesDelta: dijkstraResult.visitedCount - astarResult.visitedCount,
    examinedEdgesDelta: dijkstraResult.examinedEdgesCount - astarResult.examinedEdgesCount,
    timeDeltaMs: Number((dijkstraResult.executionTimeMs - astarResult.executionTimeMs).toFixed(3)),
  };
}
