import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface EdgeModalProps {
  isOpen: boolean;
  fromNodeId: string;
  toNodeId: string;
  defaultWeight?: number;
  onConfirm: (weight: number, time?: number) => void;
  onCancel: () => void;
}

export const EdgeModal: React.FC<EdgeModalProps> = ({
  isOpen,
  fromNodeId,
  toNodeId,
  defaultWeight = 10,
  onConfirm,
  onCancel,
}) => {
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(weight) || weight < 0) {
      setError('El peso debe ser un número positivo (>= 0). Dijkstra no admite pesos negativos.');
      return;
    }
    setError(null);
    onConfirm(weight, Math.round(weight * 1.4));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Nueva Conexión Vial
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-mono">
          Conectando nodo <strong className="text-sky-400">[{fromNodeId}]</strong> con nodo{' '}
          <strong className="text-emerald-400">[{toNodeId}]</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Distancia de la ruta (km):
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              autoFocus
            />
            {error && <p className="text-rose-400 text-[11px] font-mono mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Conectar Arista</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
