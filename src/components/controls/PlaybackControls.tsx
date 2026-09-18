import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { AlgorithmStep } from '@shared/types/graph';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isFinished: boolean;
  isAtBeginning: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  currentStep: AlgorithmStep | null;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToEnd: () => void;
  onSpeedChange: (speed: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isFinished,
  isAtBeginning,
  currentStepIndex,
  totalSteps,
  speed,
  currentStep,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onJumpToEnd,
  onSpeedChange,
}) => {
  const speeds = [0.5, 1, 2, 4, 8];

  const getStepDescription = (step: AlgorithmStep | null): string => {
    if (!step) return 'Esperando ejecución del algoritmo...';
    switch (step.type) {
      case 'visit_node':
        return `Extrayendo nodo "${step.nodeId}" del Min-Heap (costo acumulado g = ${step.currentDistance ?? 0} km${
          step.heuristicCost !== undefined ? `, heurística h = ${step.heuristicCost}` : ''
        })`;
      case 'examine_edge':
        return `Inspeccionando arista ${step.edge?.from} ➔ ${step.edge?.to}`;
      case 'update_distance':
        return `Relajación: Se encontró un camino más corto hacia "${step.nodeId}" (nuevo g = ${step.currentDistance} km)`;
      case 'finish':
        return `¡Destino alcanzado! Ruta óptima reconstruida (distancia total = ${step.currentDistance} km)`;
      case 'unreachable':
        return 'No existe ningún camino viable entre el origen y el destino.';
      default:
        return 'Procesando paso...';
    }
  };

  const progressPercent =
    totalSteps > 1 ? Math.round((currentStepIndex / (totalSteps - 1)) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      {/* Barra de progreso y estado del paso */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>
              Paso {totalSteps > 0 ? currentStepIndex + 1 : 0} de {totalSteps}
            </span>
          </span>
          <span>{progressPercent}% completado</span>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Descripción textual del paso actual */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 min-h-[38px] flex items-center">
        <span className="text-slate-500 mr-2">›</span>
        <span className="truncate">{getStepDescription(currentStep)}</span>
      </div>

      {/* Botones de control de reproducción */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center space-x-1.5">
          {/* Reset */}
          <button
            onClick={onReset}
            disabled={totalSteps === 0 || isAtBeginning}
            title="Reiniciar animación"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Paso atrás */}
          <button
            onClick={onStepBackward}
            disabled={totalSteps === 0 || isAtBeginning}
            title="Paso anterior"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Principal */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={totalSteps === 0}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium flex items-center space-x-1.5 shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span className="text-xs font-semibold">Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span className="text-xs font-semibold">
                  {isFinished ? 'Repetir' : 'Iniciar'}
                </span>
              </>
            )}
          </button>

          {/* Paso adelante */}
          <button
            onClick={onStepForward}
            disabled={totalSteps === 0 || isFinished}
            title="Paso siguiente"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Salto al final */}
          <button
            onClick={onJumpToEnd}
            disabled={totalSteps === 0 || isFinished}
            title="Saltar al final (Resultado directo)"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Velocidad */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400 ml-1 mr-0.5" />
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                speed === s
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
