import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AlgorithmResult, AlgorithmStep } from '@shared/types/graph';

export function useAlgorithmPlayback() {
  const [result, setResult] = useState<AlgorithmResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // Multiplicador de velocidad (1x = ~80ms por paso)

  const timerRef = useRef<number | null>(null);

  const steps = useMemo<AlgorithmStep[]>(() => {
    return result?.steps || [];
  }, [result]);

  const totalSteps = steps.length;
  const isFinished = totalSteps > 0 && currentStepIndex >= totalSteps - 1;
  const isAtBeginning = currentStepIndex <= 0;

  // Cargar nuevo resultado y reiniciar simulación
  const loadResult = useCallback((newResult: AlgorithmResult, autoPlay = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setResult(newResult);
    setCurrentStepIndex(0);
    setIsPlaying(autoPlay);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [totalSteps, currentStepIndex]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const stepForward = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [pause, totalSteps]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [pause]);

  const jumpToEnd = useCallback(() => {
    pause();
    if (totalSteps > 0) {
      setCurrentStepIndex(totalSteps - 1);
    }
  }, [pause, totalSteps]);

  // Intervalo de animación según la velocidad seleccionada
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (totalSteps === 0 || currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    // Intervalo base en ms: 100ms / speed (ej. 1x = 100ms, 2x = 50ms, 4x = 25ms, 0.5x = 200ms)
    const intervalMs = Math.max(10, Math.round(100 / speed));

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentStepIndex, totalSteps, speed]);

  // Estado derivado del paso actual
  const currentStep = useMemo<AlgorithmStep | null>(() => {
    if (currentStepIndex >= 0 && currentStepIndex < totalSteps) {
      return steps[currentStepIndex];
    }
    return null;
  }, [currentStepIndex, steps, totalSteps]);

  const visitedNodeIds = useMemo<Set<string>>(() => {
    if (!currentStep) return new Set();
    return new Set(currentStep.visitedNodesSoFar);
  }, [currentStep]);

  const examinedEdges = useMemo<Array<{ from: string; to: string }>>(() => {
    if (!currentStep) return [];
    return currentStep.examinedEdgesSoFar;
  }, [currentStep]);

  // La ruta óptima se resalta cuando el algoritmo finaliza o el usuario avanza al final
  const showFinalPath = useMemo<boolean>(() => {
    if (!result || result.unreachable) return false;
    if (isFinished) return true;
    if (currentStep?.type === 'finish') return true;
    return false;
  }, [result, isFinished, currentStep]);

  const activeNodeId = currentStep?.nodeId || null;
  const activeEdge = currentStep?.edge || null;

  return {
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
    examinedEdges,
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
  };
}
