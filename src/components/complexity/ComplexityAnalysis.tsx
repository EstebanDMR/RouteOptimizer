import React, { useState } from 'react';
import { BookOpen, Compass, Cpu, Check, AlertTriangle } from 'lucide-react';

export const ComplexityAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dijkstra' | 'astar' | 'comparison'>('dijkstra');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Análisis del Algoritmo y Complejidad
          </h2>
        </div>

        {/* Selector de Tabs */}
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dijkstra')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'dijkstra'
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dijkstra
          </button>
          <button
            onClick={() => setActiveTab('astar')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'astar'
                ? 'bg-indigo-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A* (A-Star)
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'comparison'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criterios de Elección
          </button>
        </div>
      </div>

      {/* Contenido del Tab */}
      {activeTab === 'dijkstra' && (
        <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                Complejidad Temporal
              </span>
              <p className="font-mono text-base font-semibold text-slate-100">
                O((V + E) log V)
              </p>
              <p className="text-slate-400 text-[11px]">
                Utilizando una cola de prioridad basada en Min-Heap binario (Binary Min-Heap). Cada vértice se extrae una vez (V log V) y cada arista se relaja a lo sumo una vez (E log V).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                Complejidad Espacial
              </span>
              <p className="font-mono text-base font-semibold text-slate-100">
                O(V)
              </p>
              <p className="text-slate-400 text-[11px]">
                Almacena los mapas de distancias acumuladas, punteros anteriores para reconstrucción de ruta y los elementos en el heap.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Concepto y Funcionamiento</span>
            </h4>
            <p className="text-slate-400">
              Es un algoritmo voraz (greedy) de búsqueda de caminos mínimos no informada. Expande el espacio de búsqueda de forma concéntrica y radial, explorando siempre el nodo más cercano al origen en términos de costo acumulado g(n).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>¿Cuándo utilizarlo?</span>
            </h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Cuando no se dispone de información espacial o coordenadas (grafos abstractos de telecomunicaciones, dependencias de software, redes de flujo).</li>
              <li>Cuando se requiere calcular el camino más corto hacia <em>múltiples o todos los destinos</em> desde un solo origen.</li>
              <li>Imprescindible: los pesos de las aristas deben ser estrictamente no negativos (w ≥ 0).</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'astar' && (
        <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">
                Función de Evaluación
              </span>
              <p className="font-mono text-base font-semibold text-slate-100">
                f(n) = g(n) + h(n)
              </p>
              <p className="text-slate-400 text-[11px]">
                <strong>g(n)</strong>: Costo real acumulado desde el origen. <br />
                <strong>h(n)</strong>: Costo estimado hasta el destino mediante la heurística.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">
                Complejidad Temporal
              </span>
              <p className="font-mono text-base font-semibold text-slate-100">
                O((V + E) log V) en peor caso
              </p>
              <p className="text-slate-400 text-[11px]">
                En la práctica, la heurística poda drásticamente las ramas irrelevantes, visitando significativamente menos nodos que Dijkstra en grafos euclidianos.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Condiciones de Optimalidad (Admisibilidad y Consistencia)</span>
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-slate-300">
              <p>
                <strong>Admisibilidad:</strong> Una heurística es admisible si nunca sobreestima el costo real hacia la meta: <code>h(n) ≤ h*(n)</code>. En nuestro sistema usamos la distancia euclidiana directa multiplicada por un factor de escala seguro α ≤ min(w(u,v) / d_E(u,v)).
              </p>
              <p>
                <strong>Consistencia (Monotonía):</strong> Satisface la desigualdad triangular: <code>h(u) ≤ w(u,v) + h(v)</code>. Garantiza que cuando un nodo se extrae de la cola de prioridad, su camino encontrado ya es estrictamente óptimo.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Ventajas y Limitaciones</span>
            </h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li><strong className="text-emerald-300">Ventaja:</strong> Búsqueda informada y dirigida; no malgasta ciclos explorando en dirección opuesta a la meta.</li>
              <li><strong className="text-amber-300">Limitación:</strong> Si la heurística no es admisible, puede encontrar soluciones subóptimas. Requiere información geométrica sobre el dominio.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <h4 className="text-sky-400 font-semibold font-mono flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Elegir Dijkstra cuando:</span>
              </h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1.5">
                <li>El grafo no posee coordenadas geográficas o espaciales conocidas.</li>
                <li>Se necesita calcular rutas hacia múltiples paradas o generar un árbol de cobertura total desde el centro de distribución.</li>
                <li>La métrica de costo no guarda correlación con la distancia física (ej. peajes financieros, latencia de paquetes).</li>
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <h4 className="text-indigo-400 font-semibold font-mono flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Elegir A* cuando:</span>
              </h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1.5">
                <li>Se tiene un destino único bien identificado (origen ➔ destino puntual).</li>
                <li>El grafo modela un espacio métrico donde la distancia euclidiana o Manhattan es una cota inferior válida del costo.</li>
                <li>En sistemas de navegación GPS y logística de entregas donde la velocidad de respuesta en grafos gigantescos es crítica.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
