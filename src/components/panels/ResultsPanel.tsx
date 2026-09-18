import React, { useState } from 'react';
import { AlgorithmResult } from '@shared/types/graph';
import { Route, Clock, Check, Copy, AlertCircle } from 'lucide-react';

interface ResultsPanelProps {
  result: AlgorithmResult | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-500 text-xs font-mono">
        <p>Selecciona un escenario y ejecuta un algoritmo para ver el desglose de resultados.</p>
      </div>
    );
  }

  if (result.unreachable) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>Destino Inalcanzable</span>
        </div>
        <p className="text-xs text-rose-300/80 font-mono">
          No existe ninguna ruta conectada entre el nodo de origen y el de destino en la topología actual.
        </p>
      </div>
    );
  }

  const routeString = result.path.join(' → ');

  const handleCopyRoute = () => {
    navigator.clipboard.writeText(routeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header del panel */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Route className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Resultado de la Optimización
          </h2>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
            result.algorithm === 'astar'
              ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
              : 'bg-sky-900/60 text-sky-300 border border-sky-700/50'
          }`}
        >
          {result.algorithm === 'astar' ? 'A* (A-Star)' : 'Dijkstra'}
        </span>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Distancia Total */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 text-xs font-medium">Distancia Total</div>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
            {result.totalDistance} <span className="text-xs font-normal text-emerald-500">km</span>
          </div>
        </div>

        {/* Tiempo Estimado */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 text-xs font-medium">Tiempo Estimado</div>
          <div className="text-lg font-mono font-bold text-sky-400 mt-1">
            {result.estimatedTime} <span className="text-xs font-normal text-sky-500">min</span>
          </div>
        </div>

        {/* Nodos Visitados */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 text-xs font-medium">Nodos Visitados</div>
          <div className="text-lg font-mono font-bold text-amber-400 mt-1">
            {result.visitedCount}
          </div>
        </div>

        {/* Aristas Examinadas */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 text-xs font-medium">Aristas Inspeccionadas</div>
          <div className="text-lg font-mono font-bold text-purple-400 mt-1">
            {result.examinedEdgesCount}
          </div>
        </div>
      </div>

      {/* Tiempo de CPU experimental */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Tiempo de ejecución CPU (backend):</span>
        </span>
        <span className="font-semibold text-slate-200">
          {result.executionTimeMs} ms{' '}
          <span className="text-[10px] text-slate-500 font-normal">(métrica experimental)</span>
        </span>
      </div>

      {/* Ruta encontrada con botón de copiar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Ruta Óptima ({result.path.length} paradas):</span>
          <button
            onClick={handleCopyRoute}
            className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copiar ruta</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 break-words leading-relaxed">
          {routeString}
        </div>
      </div>
    </div>
  );
};
