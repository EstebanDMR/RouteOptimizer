import { useState, useCallback } from 'react';
import { GraphData, GraphEdge, GraphNode, ScenarioPreset } from '@shared/types/graph';

export function useGraph(initialScenario?: ScenarioPreset) {
  const [graph, setGraph] = useState<GraphData>(
    initialScenario ? initialScenario.graph : { nodes: [], edges: [] }
  );
  const [startNodeId, setStartNodeId] = useState<string>(
    initialScenario?.defaultStart || ''
  );
  const [targetNodeId, setTargetNodeId] = useState<string>(
    initialScenario?.defaultTarget || ''
  );
  const [currentScenarioId, setCurrentScenarioId] = useState<string>(
    initialScenario?.id || ''
  );

  const loadScenario = useCallback((scenario: ScenarioPreset) => {
    // Clonar profundamente para permitir edición local
    setGraph({
      nodes: scenario.graph.nodes.map((n) => ({ ...n })),
      edges: scenario.graph.edges.map((e) => ({ ...e })),
    });
    setStartNodeId(scenario.defaultStart || scenario.graph.nodes[0]?.id || '');
    setTargetNodeId(
      scenario.defaultTarget || scenario.graph.nodes[scenario.graph.nodes.length - 1]?.id || ''
    );
    setCurrentScenarioId(scenario.id);
  }, []);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)),
    }));
  }, []);

  const addNode = useCallback((node: GraphNode) => {
    setGraph((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setGraph((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.from !== id && e.to !== id),
    }));
    setStartNodeId((current) => (current === id ? '' : current));
    setTargetNodeId((current) => (current === id ? '' : current));
  }, []);

  const addEdge = useCallback((edge: GraphEdge) => {
    setGraph((prev) => ({
      ...prev,
      edges: [...prev.edges, edge],
    }));
  }, []);

  const removeEdge = useCallback((edgeId: string) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
  }, []);

  const updateEdgeWeight = useCallback((edgeId: string, weight: number) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((e) =>
        e.id === edgeId ? { ...e, weight, time: Math.round(weight * 1.4) } : e
      ),
    }));
  }, []);

  return {
    graph,
    setGraph,
    startNodeId,
    setStartNodeId,
    targetNodeId,
    setTargetNodeId,
    currentScenarioId,
    loadScenario,
    updateNodePosition,
    addNode,
    removeNode,
    addEdge,
    removeEdge,
    updateEdgeWeight,
  };
}
