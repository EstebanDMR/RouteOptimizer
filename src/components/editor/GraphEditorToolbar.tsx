import React from 'react';
import {
  MousePointer,
  MapPin,
  Navigation,
  PlusCircle,
  GitCommit,
  Trash2,
} from 'lucide-react';

export type EditorMode = 'view' | 'set-start' | 'set-target' | 'add-node' | 'add-edge' | 'delete';

interface GraphEditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  edgePendingFrom: string | null;
}

export const GraphEditorToolbar: React.FC<GraphEditorToolbarProps> = ({
  mode,
  onModeChange,
  edgePendingFrom,
}) => {
  const getInstructions = (): string => {
    switch (mode) {
      case 'view':
        return 'Modo Navegación: Puedes arrastrar nodos con el cursor para reorganizar visualmente la red vial.';
      case 'set-start':
        return 'Modo Origen: Haz clic sobre cualquier nodo del lienzo para fijarlo como Centro de Despacho (Origen).';
      case 'set-target':
        return 'Modo Destino: Haz clic sobre cualquier nodo del lienzo para fijarlo como Punto de Entrega (Destino).';
      case 'add-node':
        return 'Modo Agregar Nodo: Haz clic en cualquier área vacía del lienzo para situar una nueva parada de entrega.';
      case 'add-edge':
        return edgePendingFrom
          ? `Conectando desde nodo [${edgePendingFrom}]... Ahora haz clic sobre el nodo destino.`
          : 'Modo Conectar: Haz clic sobre el primer nodo para iniciar la conexión de la ruta.';
      case 'delete':
        return 'Modo Eliminar: Haz clic sobre cualquier nodo para suprimirlo junto con sus aristas incidentes.';
      default:
        return '';
    }
  };

  const tools: Array<{ id: EditorMode; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'view', label: 'Mover / Ver', icon: MousePointer },
    { id: 'set-start', label: 'Fijar Origen', icon: MapPin },
    { id: 'set-target', label: 'Fijar Destino', icon: Navigation },
    { id: 'add-node', label: 'Agregar Nodo', icon: PlusCircle },
    { id: 'add-edge', label: 'Conectar Nodos', icon: GitCommit },
    { id: 'delete', label: 'Eliminar Nodo', icon: Trash2 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2">
      {/* Botones de herramientas */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
          Herramientas:
        </span>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = mode === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onModeChange(t.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Banner de instrucciones dinámicas */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1.5 text-[11px] font-mono text-sky-300/90 flex items-center">
        <span className="text-sky-400 font-bold mr-2">ℹ</span>
        <span>{getInstructions()}</span>
      </div>
    </div>
  );
};
