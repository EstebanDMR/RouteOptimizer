import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { GraphCanvas } from './components/canvas/GraphCanvas';
import { ScenarioSelector } from './components/controls/ScenarioSelector';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { ResultsPanel } from './components/panels/ResultsPanel';
import { AlgorithmComparison } from './components/comparison/AlgorithmComparison';
import { ComplexityAnalysis } from './components/complexity/ComplexityAnalysis';
import { GraphEditorToolbar, EditorMode } from './components/editor/GraphEditorToolbar';
import { EdgeModal } from './components/editor/EdgeModal';
import { useGraph } from './hooks/useGraph';
import { useAlgorithmPlayback } from './hooks/useAlgorithmPlayback';
import { apiService } from './services/apiService';
import { fallbackSmallCity } from './data/defaultScenarios';
import { ComparisonResult, ScenarioPreset } from '@shared/types/graph';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([fallbackSmallCity]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Estado del Editor de Grafos
  const [editorMode, setEditorMode] = useState<EditorMode>('view');
  const [edgePendingFrom, setEdgePendingFrom] = useState<string | null>(null);
  const [edgeModalOpen, setEdgeModalOpen] = useState<boolean>(false);
  const [pendingEdgeTo, setPendingEdgeTo] = useState<string | null>(null);

  // Hook del Grafo
  const {
    graph,
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
  } = useGraph(fallbackSmallCity);

  // Hook de Reproducción Animada de Steps devueltos por el backend
  const {
    result,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isFinished,
    isAtBeginning,
    speed,
    setSpeed,
    currentStep,
    visitedNodeIds,
    showFinalPath,
    activeNodeId,
    activeEdge,
    loadResult,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    jumpToEnd,
  } = useAlgorithmPlayback();

  const addToast = useCallback((type: 'error' | 'success' | 'info', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cargar lista de escenarios desde el Backend al iniciar
  useEffect(() => {
    async function initScenarios() {
      try {
        const fetched = await apiService.fetchScenarios();
        if (fetched && fetched.length > 0) {
          setScenarios(fetched);
          loadScenario(fetched[0]);
        }
      } catch (err) {
        console.warn('Backend API inicial no disponible, usando escenarios locales de fallback.', err);
      }
    }
    initScenarios();
  }, [loadScenario]);

  // Selección de Escenario
  const handleSelectScenario = async (scenarioId: string) => {
    setIsLoading(true);
    try {
      const scenario = await apiService.fetchScenarioById(scenarioId);
      loadScenario(scenario);
      setComparisonResult(null);
      addToast('info', 'Escenario cargado', `Se ha cargado "${scenario.name}".`);
    } catch {
      // Fallback a escenarios en memoria
      const local = scenarios.find((s) => s.id === scenarioId);
      if (local) {
        loadScenario(local);
        setComparisonResult(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generador de Grafo Conexo
  const handleGenerateRandom = async () => {
    setIsLoading(true);
    try {
      const randomScenario = await apiService.generateRandomScenario(20);
      setScenarios((prev) => [randomScenario, ...prev.filter((s) => !s.id.startsWith('random-'))]);
      loadScenario(randomScenario);
      setComparisonResult(null);
      addToast('success', 'Grafo generado', 'Nueva red vial conexa generada exitosamente.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo generar el grafo.';
      addToast('error', 'Error al generar grafo', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecución de Dijkstra en Backend
  const handleRunDijkstra = async () => {
    if (!startNodeId || !targetNodeId) {
      addToast('error', 'Faltan parámetros', 'Debe seleccionar un nodo de origen y uno de destino.');
      return;
    }
    setIsLoading(true);
    setComparisonResult(null);
    try {
      const dijkstraResult = await apiService.executeDijkstra(graph, startNodeId, targetNodeId);
      loadResult(dijkstraResult);
      if (dijkstraResult.unreachable) {
        addToast('error', 'Destino inalcanzable', 'No existe conexión posible hacia el destino seleccionado.');
      } else {
        addToast(
          'success',
          'Dijkstra completado',
          `Ruta óptima calculada en ${dijkstraResult.executionTimeMs} ms (${dijkstraResult.totalDistance} km).`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al ejecutar Dijkstra en backend.';
      addToast('error', 'Error en Dijkstra', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecución de A* en Backend
  const handleRunAStar = async () => {
    if (!startNodeId || !targetNodeId) {
      addToast('error', 'Faltan parámetros', 'Debe seleccionar un nodo de origen y uno de destino.');
      return;
    }
    setIsLoading(true);
    setComparisonResult(null);
    try {
      const astarResult = await apiService.executeAStar(graph, startNodeId, targetNodeId);
      loadResult(astarResult);
      if (astarResult.unreachable) {
        addToast('error', 'Destino inalcanzable', 'No existe conexión posible hacia el destino seleccionado.');
      } else {
        addToast(
          'success',
          'A* completado',
          `Ruta heurística calculada en ${astarResult.executionTimeMs} ms (${astarResult.totalDistance} km).`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al ejecutar A* en backend.';
      addToast('error', 'Error en A*', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Comparación en Backend
  const handleRunCompare = async () => {
    if (!startNodeId || !targetNodeId) {
      addToast('error', 'Faltan parámetros', 'Debe seleccionar un nodo de origen y uno de destino.');
      return;
    }
    setIsLoading(true);
    try {
      const comp = await apiService.compareAlgorithms(graph, startNodeId, targetNodeId);
      setComparisonResult(comp);
      loadResult(comp.astar, false); // Cargar steps de A* sin autoplay inmediato
      jumpToEnd(); // Mostrar estado final directamente
      addToast('success', 'Comparación finalizada', 'Métricas analíticas calculadas por el backend.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al comparar algoritmos en backend.';
      addToast('error', 'Error en Comparación', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Interacción del Editor en el Canvas
  const handleCanvasClickInEditor = (x: number, y: number) => {
    if (editorMode === 'add-node') {
      const newId = `N${graph.nodes.length + 1}`;
      addNode({
        id: newId,
        label: `Parada ${newId}`,
        x,
        y,
      });
      addToast('info', 'Nodo agregado', `Se creó el nodo [${newId}] en (${x}, ${y}).`);
    }
  };

  const handleNodeClickInEditor = (id: string) => {
    if (editorMode === 'delete') {
      removeNode(id);
      addToast('info', 'Nodo eliminado', `Se eliminó el nodo [${id}].`);
    } else if (editorMode === 'add-edge') {
      if (!edgePendingFrom) {
        setEdgePendingFrom(id);
      } else if (edgePendingFrom === id) {
        setEdgePendingFrom(null); // Cancelar si hace clic en el mismo
      } else {
        setPendingEdgeTo(id);
        setEdgeModalOpen(true);
      }
    }
  };

  const handleConfirmEdge = (weight: number, time?: number) => {
    if (edgePendingFrom && pendingEdgeTo) {
      addEdge({
        id: `e_${Date.now()}`,
        from: edgePendingFrom,
        to: pendingEdgeTo,
        weight,
        time,
        bidirectional: true,
      });
      addToast('success', 'Arista creada', `Conexión entre [${edgePendingFrom}] y [${pendingEdgeTo}] establecida (${weight} km).`);
    }
    setEdgeModalOpen(false);
    setEdgePendingFrom(null);
    setPendingEdgeTo(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* 1. Selector de Escenario y Botones de Ejecución */}
        <ScenarioSelector
          scenarios={scenarios}
          currentScenarioId={currentScenarioId}
          nodes={graph.nodes}
          startNodeId={startNodeId}
          targetNodeId={targetNodeId}
          isLoading={isLoading}
          onSelectScenario={handleSelectScenario}
          onSelectStartNode={setStartNodeId}
          onSelectTargetNode={setTargetNodeId}
          onGenerateRandom={handleGenerateRandom}
          onRunDijkstra={handleRunDijkstra}
          onRunAStar={handleRunAStar}
          onRunCompare={handleRunCompare}
        />

        {/* 2. Área Central: Lienzo de Grafo y Controles de Reproducción */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda / Central: Visualizador y Controles */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-4">
            {/* Barra de Herramientas del Editor */}
            <GraphEditorToolbar
              mode={editorMode}
              onModeChange={setEditorMode}
              edgePendingFrom={edgePendingFrom}
            />

            {/* Canvas de Grafo SVG Interactivo */}
            <GraphCanvas
              graph={graph}
              startNodeId={startNodeId}
              targetNodeId={targetNodeId}
              activeNodeId={activeNodeId}
              activeEdge={activeEdge}
              visitedNodeIds={visitedNodeIds}
              finalPath={result?.path || []}
              showFinalPath={showFinalPath}
              onNodePositionChange={updateNodePosition}
              onSelectStart={setStartNodeId}
              onSelectTarget={setTargetNodeId}
              editorMode={editorMode}
              onNodeClickInEditor={handleNodeClickInEditor}
              onCanvasClickInEditor={handleCanvasClickInEditor}
            />

            {/* Controles de Reproducción Animada de Steps */}
            <PlaybackControls
              isPlaying={isPlaying}
              isFinished={isFinished}
              isAtBeginning={isAtBeginning}
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              speed={speed}
              currentStep={currentStep}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onJumpToEnd={jumpToEnd}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* Columna Derecha: Panel de Métricas, Resultados y Comparativa */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-5">
            {/* Panel de Telemetría y Topología estilo Portafolio */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Topología y Telemetría
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Activo</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] mb-0.5">ESCENARIO</span>
                  <span className="text-slate-200 font-semibold truncate block">
                    {scenarios.find((s) => s.id === currentScenarioId)?.name || 'Personalizado'}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] mb-0.5">TOPOLOGÍA</span>
                  <span className="text-slate-200 font-semibold block">
                    {graph.nodes.length} V • {graph.edges.length} E
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] mb-0.5">ORIGEN</span>
                  <span className="text-emerald-400 font-semibold block truncate">
                    {startNodeId} ({graph.nodes.find((n) => n.id === startNodeId)?.label || 'Nodo'})
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] mb-0.5">DESTINO</span>
                  <span className="text-rose-400 font-semibold block truncate">
                    {targetNodeId} ({graph.nodes.find((n) => n.id === targetNodeId)?.label || 'Nodo'})
                  </span>
                </div>
              </div>
            </div>

            <ResultsPanel result={result} />
            {comparisonResult && <AlgorithmComparison comparison={comparisonResult} />}
          </div>
        </div>

        {/* 3. Comparativa Completa (si se ejecutó comparar) o Sección Educativa */}
        {!comparisonResult && result && (
          <div className="text-center py-2">
            <button
              onClick={handleRunCompare}
              disabled={isLoading}
              className="text-xs font-mono text-sky-400 hover:text-sky-300 underline underline-offset-4"
            >
              ¿Deseas comparar este resultado con el otro algoritmo? Haz clic aquí para ejecutar la comparativa.
            </button>
          </div>
        )}

        {/* 4. Sección de Análisis del Algoritmo y Complejidad */}
        <ComplexityAnalysis />
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 xl:px-10 text-center text-xs font-mono text-slate-500">
        <p>
          RouteOptimizer • Proyecto 3 Portafolio • Algoritmos y Estructuras de Datos desde Cero
        </p>
      </footer>

      {/* Modal para ingresar peso de arista */}
      <EdgeModal
        isOpen={edgeModalOpen}
        fromNodeId={edgePendingFrom || ''}
        toNodeId={pendingEdgeTo || ''}
        onConfirm={handleConfirmEdge}
        onCancel={() => {
          setEdgeModalOpen(false);
          setEdgePendingFrom(null);
          setPendingEdgeTo(null);
        }}
      />

      {/* Notificaciones Toast */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
