import React, { useRef, useState, useCallback, useMemo } from 'react';
import { GraphData, GraphNode } from '@shared/types/graph';
import { EditorMode } from '../editor/GraphEditorToolbar';

interface GraphCanvasProps {
  graph: GraphData;
  startNodeId: string;
  targetNodeId: string;
  activeNodeId: string | null;
  activeEdge: { from: string; to: string } | null;
  visitedNodeIds: Set<string>;
  finalPath: string[];
  showFinalPath: boolean;
  onNodePositionChange?: (id: string, x: number, y: number) => void;
  onSelectStart?: (id: string) => void;
  onSelectTarget?: (id: string) => void;
  editorMode?: EditorMode;
  onNodeClickInEditor?: (id: string) => void;
  onCanvasClickInEditor?: (x: number, y: number) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  startNodeId,
  targetNodeId,
  activeNodeId,
  activeEdge,
  visitedNodeIds,
  finalPath,
  showFinalPath,
  onNodePositionChange,
  onSelectStart,
  onSelectTarget,
  editorMode = 'view',
  onNodeClickInEditor,
  onCanvasClickInEditor,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Map rápido para acceso O(1) a coordenadas de nodos
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of graph.nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [graph.nodes]);

  // Set de aristas que forman parte del camino final óptimo
  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (!showFinalPath || finalPath.length < 2) return set;
    for (let i = 0; i < finalPath.length - 1; i++) {
      const u = finalPath[i];
      const v = finalPath[i + 1];
      set.add(u < v ? `${u}-${v}` : `${v}-${u}`);
    }
    return set;
  }, [finalPath, showFinalPath]);

  // Manejo de drag & drop de nodos
  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editorMode === 'view') {
      setDraggingNodeId(id);
    }
  };

  // Conversión exacta de coordenadas de pantalla a coordenadas del viewBox SVG (0 0 900 600)
  const getSVGCoordinates = useCallback((e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPoint = pt.matrixTransform(ctm.inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    }
    // Fallback matemático estándar
    const rect = svg.getBoundingClientRect();
    const scaleX = 900 / (rect.width || 1);
    const scaleY = 600 / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingNodeId || !svgRef.current || !onNodePositionChange) return;

      const coords = getSVGCoordinates(e);
      if (!coords) return;

      const clampedX = Math.round(Math.max(30, Math.min(870, coords.x)));
      const clampedY = Math.round(Math.max(30, Math.min(570, coords.y)));

      onNodePositionChange(draggingNodeId, clampedX, clampedY);
    },
    [draggingNodeId, onNodePositionChange, getSVGCoordinates]
  );

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !onCanvasClickInEditor) return;
    const coords = getSVGCoordinates(e);
    if (!coords) return;
    onCanvasClickInEditor(Math.round(coords.x), Math.round(coords.y));
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editorMode === 'set-start') {
      onSelectStart?.(id);
    } else if (editorMode === 'set-target') {
      onSelectTarget?.(id);
    } else if (onNodeClickInEditor) {
      onNodeClickInEditor(id);
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] xl:h-[680px] 2xl:h-[740px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none shadow-inner">
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 900 600"
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <defs>
          {/* Patrón de cuadrícula técnica */}
          <pattern id="tech-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
          </pattern>
        </defs>

        {/* Fondo con rejilla técnica */}
        <rect width="900" height="600" fill="url(#tech-grid)" />

        {/* 1. Capa de Aristas */}
        <g className="edges-layer">
          {graph.edges.map((edge) => {
            const u = nodeMap.get(edge.from);
            const v = nodeMap.get(edge.to);
            if (!u || !v) return null;

            const edgeKey = edge.from < edge.to ? `${edge.from}-${edge.to}` : `${edge.to}-${edge.from}`;
            const isPath = pathEdgeSet.has(edgeKey);
            const isActive =
              activeEdge &&
              ((activeEdge.from === edge.from && activeEdge.to === edge.to) ||
                (activeEdge.from === edge.to && activeEdge.to === edge.from));

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            // Determinar apariencia de la arista
            let strokeColor = '#334155'; // slate-700
            let strokeWidth = 1.8;

            if (isPath) {
              strokeColor = '#10b981'; // emerald-500
              strokeWidth = 4.5;
            } else if (isActive) {
              strokeColor = '#f59e0b'; // amber-500
              strokeWidth = 3;
            }

            return (
              <g key={edge.id || `${edge.from}-${edge.to}`}>
                {/* Halo de resplandor para camino óptimo */}
                {isPath && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#10b981"
                    strokeWidth={10}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                  />
                )}

                {/* Halo de resplandor para arista activa */}
                {isActive && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#f59e0b"
                    strokeWidth={8}
                    strokeOpacity={0.35}
                    strokeLinecap="round"
                  />
                )}

                {/* Línea principal de la conexión */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="transition-colors duration-200"
                />

                {/* Badge con el peso/distancia de la arista */}
                <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer pointer-events-none">
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="18"
                    rx="4"
                    fill={isPath ? '#064e3b' : isActive ? '#78350f' : '#0f172a'}
                    stroke={isPath ? '#10b981' : isActive ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isPath ? '#a7f3d0' : isActive ? '#fde68a' : '#94a3b8'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {edge.weight}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 2. Capa de Nodos */}
        <g className="nodes-layer">
          {graph.nodes.map((node) => {
            const isStart = node.id === startNodeId;
            const isTarget = node.id === targetNodeId;
            const isActive = node.id === activeNodeId;
            const isVisited = visitedNodeIds.has(node.id);
            const isInPath = showFinalPath && finalPath.includes(node.id);

            // Colores y radios
            let fillColor = '#1e293b'; // slate-800
            let strokeColor = '#475569'; // slate-600
            let radius = 16;
            let strokeWidth = 2;

            if (isStart) {
              fillColor = '#065f46'; // emerald-800
              strokeColor = '#10b981'; // emerald-500
              radius = 20;
              strokeWidth = 3;
            } else if (isTarget) {
              fillColor = '#881337'; // rose-900
              strokeColor = '#f43f5e'; // rose-500
              radius = 20;
              strokeWidth = 3;
            } else if (isActive) {
              fillColor = '#b45309'; // amber-700
              strokeColor = '#f59e0b'; // amber-500
              radius = 19;
              strokeWidth = 3;
            } else if (isInPath) {
              fillColor = '#047857'; // emerald-700
              strokeColor = '#34d399'; // emerald-400
              radius = 18;
              strokeWidth = 2.5;
            } else if (isVisited) {
              fillColor = '#0369a1'; // sky-700
              strokeColor = '#38bdf8'; // sky-400
              radius = 17;
            }

            const isHovered = hoveredNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onClick={(e) => handleNodeClick(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-transform duration-100"
              >
                {/* Anillo de pulso si el nodo está activo o en origen/destino */}
                {(isActive || isStart || isTarget) && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                    className="animate-spin"
                    style={{ animationDuration: '6s', transformOrigin: '0 0' }}
                  />
                )}

                {/* Halo de resplandor para nodos en la ruta óptima */}
                {isInPath && (
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth={3}
                    opacity={0.45}
                  />
                )}

                {/* Círculo base del nodo */}
                <circle
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />

                {/* Identificador central del nodo */}
                <text
                  x="0"
                  y="4.5"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize={node.id.length > 2 ? '10' : '11.5'}
                  fontFamily="monospace"
                  fontWeight="700"
                  className="pointer-events-none"
                >
                  {node.id}
                </text>

                {/* Etiqueta flotante / Badge */}
                {(isStart || isTarget || isHovered) && (
                  <g transform={`translate(0, ${-radius - 12})`} className="pointer-events-none">
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="20"
                      rx="4"
                      fill="#020617"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {isStart ? 'ORIGEN' : isTarget ? 'DESTINO' : node.id}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Leyenda técnica en esquina inferior */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono flex items-center space-x-4 shadow-lg">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Origen</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span className="text-slate-300">Destino</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
          <span className="text-slate-300">Visitado</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-300">Explorando</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-5 h-1 bg-emerald-400 inline-block rounded"></span>
          <span className="text-emerald-300 font-semibold">Ruta Óptima</span>
        </div>
      </div>
    </div>
  );
};
