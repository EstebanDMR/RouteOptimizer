import React from 'react';
import { Route, Terminal, Cpu, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Marca y Nombre */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
            <Route className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold text-amber-500 tracking-wider">
                [ 03 ]
              </span>
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-sans">
                RouteOptimizer
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/60">
                PROYECTO PORTAFOLIO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Planificación y optimización de rutas con algoritmos de grafos y búsqueda heurística
            </p>
          </div>
        </div>

        {/* Badges técnicos de arquitectura */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Node / Express</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dijkstra & A* (0 libs)</span>
          </div>

          <a
            href="https://github.com/EstebanDMR/RouteOptimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
