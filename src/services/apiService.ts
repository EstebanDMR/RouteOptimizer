import {
  AlgorithmRequest,
  AlgorithmResult,
  ComparisonResult,
  GraphData,
  ScenarioPreset,
} from '@shared/types/graph';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Error HTTP ${res.status}: ${res.statusText}`);
  }
  return json.data;
}

export const apiService = {
  async fetchScenarios(): Promise<ScenarioPreset[]> {
    const res = await fetch(`${API_BASE}/scenarios`);
    return handleResponse<ScenarioPreset[]>(res);
  },

  async fetchScenarioById(id: string): Promise<ScenarioPreset> {
    const res = await fetch(`${API_BASE}/scenarios/${id}`);
    return handleResponse<ScenarioPreset>(res);
  },

  async generateRandomScenario(nodeCount = 20): Promise<ScenarioPreset> {
    const res = await fetch(`${API_BASE}/scenarios/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeCount }),
    });
    return handleResponse<ScenarioPreset>(res);
  },

  async executeDijkstra(graph: GraphData, startNodeId: string, targetNodeId: string): Promise<AlgorithmResult> {
    const payload: AlgorithmRequest = { graph, startNodeId, targetNodeId };
    const res = await fetch(`${API_BASE}/algorithms/dijkstra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AlgorithmResult>(res);
  },

  async executeAStar(graph: GraphData, startNodeId: string, targetNodeId: string): Promise<AlgorithmResult> {
    const payload: AlgorithmRequest = { graph, startNodeId, targetNodeId };
    const res = await fetch(`${API_BASE}/algorithms/astar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AlgorithmResult>(res);
  },

  async compareAlgorithms(graph: GraphData, startNodeId: string, targetNodeId: string): Promise<ComparisonResult> {
    const payload: AlgorithmRequest = { graph, startNodeId, targetNodeId };
    const res = await fetch(`${API_BASE}/algorithms/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ComparisonResult>(res);
  },
};
