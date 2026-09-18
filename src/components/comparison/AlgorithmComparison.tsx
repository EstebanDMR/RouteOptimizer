import React from 'react';
import { ComparisonResult } from '@shared/types/graph';
import { GitCompare, CheckCircle2, Info } from 'lucide-react';

interface AlgorithmComparisonProps {
  comparison: ComparisonResult | null;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({ comparison }) => {
  if (!comparison) return null;

  const { dijkstra, astar, sameOptimalDistance, visitedNodesDelta, examinedEdgesDelta } = comparison;

  const maxVisited = Math.max(dijkstra.visitedCount, astar.visitedCount, 1);
  const dijkstraBarPercent = Math.round((dijkstra.visitedCount / maxVisited) * 100);
  const astarBarPercent = Math.round((astar.visitedCount / maxVisited) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Comparativa de Rendimiento: Dijkstra vs A*
          </h2>
        </div>
        {sameOptimalDistance && (
          <span className="flex items-center space-x-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimalidad Idéntica Confirmada</span>
          </span>
        )}
      </div>

      {/* Gráficos de barras comparativos de Nodos Visitados */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Exploración de Nodos (Carga de Búsqueda)
        </h3>

        <div className="space-y-2">
          {/* Barra Dijkstra */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="text-sky-400 font-semibold">Dijkstra:</span>
              <span>{dijkstra.visitedCount} nodos explorados</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${dijkstraBarPercent}%` }}
              />
            </div>
          </div>

          {/* Barra A* */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="text-indigo-400 font-semibold">A* (A-Star):</span>
              <span>{astar.visitedCount} nodos explorados</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${astarBarPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Comparativa de Métricas Reales */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left bg-slate-950/40">
              <th className="p-3 font-semibold">Métrica</th>
              <th className="p-3 font-semibold text-sky-400">Dijkstra</th>
              <th className="p-3 font-semibold text-indigo-400">A* (A-Star)</th>
              <th className="p-3 font-semibold text-slate-300">Diferencia / Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {/* Distancia */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 text-slate-300 font-medium">Distancia Total</td>
              <td className="p-3 text-emerald-400 font-bold">{dijkstra.totalDistance} km</td>
              <td className="p-3 text-emerald-400 font-bold">{astar.totalDistance} km</td>
              <td className="p-3 text-slate-400">
                {sameOptimalDistance ? (
                  <span className="text-emerald-400">Distancia idéntica (garantía de optimalidad)</span>
                ) : (
                  <span className="text-amber-400">Variación observada</span>
                )}
              </td>
            </tr>

            {/* Nodos Visitados */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 text-slate-300 font-medium">Nodos Visitados</td>
              <td className="p-3 font-semibold text-slate-200">{dijkstra.visitedCount}</td>
              <td className="p-3 font-semibold text-slate-200">{astar.visitedCount}</td>
              <td className="p-3 text-slate-400">
                {visitedNodesDelta > 0 ? (
                  <span className="text-indigo-300">
                    A* exploró {visitedNodesDelta} nodo{visitedNodesDelta > 1 ? 's' : ''} menos que Dijkstra
                  </span>
                ) : visitedNodesDelta < 0 ? (
                  <span className="text-sky-300">
                    Dijkstra exploró {Math.abs(visitedNodesDelta)} nodo{Math.abs(visitedNodesDelta) > 1 ? 's' : ''} menos
                  </span>
                ) : (
                  <span>Ambos exploraron la misma cantidad de nodos</span>
                )}
              </td>
            </tr>

            {/* Aristas Examinadas */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 text-slate-300 font-medium">Aristas Inspeccionadas</td>
              <td className="p-3 font-semibold text-slate-200">{dijkstra.examinedEdgesCount}</td>
              <td className="p-3 font-semibold text-slate-200">{astar.examinedEdgesCount}</td>
              <td className="p-3 text-slate-400">
                {examinedEdgesDelta > 0
                  ? `A* examinó ${examinedEdgesDelta} aristas menos`
                  : examinedEdgesDelta < 0
                  ? `Dijkstra examinó ${Math.abs(examinedEdgesDelta)} aristas menos`
                  : 'Mismo número de inspecciones'}
              </td>
            </tr>

            {/* Tiempo CPU */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 text-slate-300 font-medium">Tiempo de CPU (experimental)</td>
              <td className="p-3 text-slate-300">{dijkstra.executionTimeMs} ms</td>
              <td className="p-3 text-slate-300">{astar.executionTimeMs} ms</td>
              <td className="p-3 text-slate-500 italic">Métrica sensible a carga del servidor</td>
            </tr>

            {/* Ruta Reconstruida */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 text-slate-300 font-medium">Ruta Encontrada</td>
              <td className="p-3 text-slate-300 truncate max-w-[200px]">{dijkstra.path.join(' → ')}</td>
              <td className="p-3 text-slate-300 truncate max-w-[200px]">{astar.path.join(' → ')}</td>
              <td className="p-3 text-slate-400">
                {dijkstra.path.join(',') === astar.path.join(',')
                  ? 'Idéntica trayectoria'
                  : 'Rutas alternativas de igual costo'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nota técnica objetiva */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Interpretación de ingeniería:</strong> En este escenario específico,{' '}
          {astar.visitedCount <= dijkstra.visitedCount
            ? `A* visitó ${astar.visitedCount} nodos frente a ${dijkstra.visitedCount} de Dijkstra gracias a que la función heurística euclidiana orientó la exploración en dirección al destino.`
            : `Dijkstra visitó ${dijkstra.visitedCount} nodos frente a ${astar.visitedCount} de A*. La efectividad de A* depende de la geometría de las conexiones y de la alineación de la heurística con los obstáculos del grafo.`}{' '}
          La optimalidad es idéntica en ambos algoritmos cuando la heurística es admisible y consistente.
        </p>
      </div>
    </div>
  );
};
