import React from 'react';
import { Play, Sparkles, RefreshCw, GitCompare, MapPin, Navigation } from 'lucide-react';
import { GraphNode, ScenarioPreset } from '@shared/types/graph';

interface ScenarioSelectorProps {
  scenarios: ScenarioPreset[];
  currentScenarioId: string;
  nodes: GraphNode[];
  startNodeId: string;
  targetNodeId: string;
  isLoading: boolean;
  onSelectScenario: (scenarioId: string) => void;
  onSelectStartNode: (nodeId: string) => void;
  onSelectTargetNode: (nodeId: string) => void;
  onGenerateRandom: () => void;
  onRunDijkstra: () => void;
  onRunAStar: () => void;
  onRunCompare: () => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  currentScenarioId,
  nodes,
  startNodeId,
  targetNodeId,
  isLoading,
  onSelectScenario,
  onSelectStartNode,
  onSelectTargetNode,
  onGenerateRandom,
  onRunDijkstra,
  onRunAStar,
  onRunCompare,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* 1. Selector de Escenarios */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Escenario:
          </label>
          <select
            value={currentScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={isLoading}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onGenerateRandom}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700/60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Generar Conexo</span>
        </button>
      </div>

      {/* 2. Selector de Origen y Destino */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Punto de Origen:</span>
          </label>
          <select
            value={startNodeId}
            onChange={(e) => onSelectStartNode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono text-rose-400 flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5" />
            <span>Punto de Destino:</span>
          </label>
          <select
            value={targetNodeId}
            onChange={(e) => onSelectTargetNode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Botones de Ejecución */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Ejecutar Dijkstra */}
        <button
          onClick={onRunDijkstra}
          disabled={isLoading || !startNodeId || !targetNodeId}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Ejecutar Dijkstra</span>
        </button>

        {/* Ejecutar A* */}
        <button
          onClick={onRunAStar}
          disabled={isLoading || !startNodeId || !targetNodeId}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ejecutar A*</span>
        </button>

        {/* Comparar */}
        <button
          onClick={onRunCompare}
          disabled={isLoading || !startNodeId || !targetNodeId}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <GitCompare className="w-4 h-4" />
          <span>Comparar Ambos</span>
        </button>
      </div>
    </div>
  );
};
