import React from 'react';
import { Route, Terminal, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Marca y Nombre */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
            <Route className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-sans">
                RouteOptimizer
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/60">
                v1.0 • Portfolio Project
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Planificación y optimización de rutas con algoritmos de grafos y búsqueda heurística
            </p>
          </div>
        </div>

        {/* Badges técnicos de arquitectura */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Backend Engine: Node / Express</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dijkstra & A* (0 libs)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
