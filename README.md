# RouteOptimizer — Motor de Planificación y Optimización de Rutas de Entrega

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-yellow.svg?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Proyecto de Portafolio Técnico**: Aplicación web profesional diseñada para demostrar el diseño y análisis de estructuras de datos avanzadas, algoritmos de grafos, búsqueda heurística en redes métricas, rigurosidad matemática y arquitectura desacoplada Full-Stack.

---

## 1. ¿Qué es RouteOptimizer?

**RouteOptimizer** es una plataforma interactiva de ingeniería para la simulación, análisis comparativo y optimización de redes viales de entrega logística. Permite modelar redes topológicas de ciudades, definir centros de despacho (origen) y puntos de entrega (destinos), y ejecutar algoritmos de camino mínimo para encontrar la ruta óptima en términos de distancia y tiempo estimado.

A diferencia de proyectos demostrativos superficiales, RouteOptimizer implementa **100% desde cero** tanto las estructuras de datos fundamentales (listas de adyacencia y colas de prioridad con Min-Heap binario) como los algoritmos clásicos de búsqueda (**Dijkstra** y **A\***), garantizando una separación limpia de responsabilidades y cero dependencias de librerías externas para el cálculo algorítmico.

---

## 2. Problema que Resuelve

En el transporte de última milla y la logística urbana, la asignación eficiente de rutas reduce costos operativos, emisiones de carbono y tiempos de entrega. Resolver este desafío requiere responder a dos necesidades críticas de ingeniería:

1. **Garantía de optimalidad matemática**: Asegurar que la ruta seleccionada sea estrictamente la de menor costo acumulado.
2. **Eficiencia en la exploración**: En redes viales de gran escala con cientos o miles de intersecciones, una búsqueda ciega o no informada (Dijkstra) evalúa un volumen excesivo de vértices radialmente. El uso de búsqueda heurística orientada (**A\***) poda ramas innecesarias manteniendo la optimalidad bajo condiciones formales de admisibilidad.

---

## 3. Tecnologías Utilizadas

* **Lenguaje**: TypeScript 5.5 (Modo estricto, tipos compartidos y tipado estático riguroso).
* **Frontend**:
  * **React 18**: Arquitectura de componentes desacoplados.
  * **Vite 5**: Bundler ultrarrápido y entorno de desarrollo ESM nativo.
  * **Tailwind CSS 3**: Sistema de diseño técnico y minimalista inspirado en developer tools.
  * **Lucide React**: Iconografía técnica y moderna.
* **Backend**:
  * **Node.js**: Entorno de ejecución en servidor.
  * **Express**: API RESTful con endpoints tipados para cálculo, validación y benchmarking.
  * **TSX**: Motor de ejecución de TypeScript en tiempo de ejecución.
* **Testing**:
  * **Vitest**: Suite de pruebas unitarias e integración de alto rendimiento.
  * **Supertest**: Pruebas de integración HTTP sobre endpoints de Express.

---

## 4. Arquitectura del Sistema

El proyecto sigue una arquitectura unificada con **una sola fuente de verdad para el motor algorítmico**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    shared/ (Core Engine)                    │
│  - Graph (Listas de Adyacencia y validación de integridad)  │
│  - MinPriorityQueue (Min-Heap binario O(log n))             │
│  - Dijkstra (Búsqueda no informada con step recording)      │
│  - A* (Búsqueda heurística desacoplada f(n) = g(n) + h(n))  │
│  - Heuristics (Euclidiana admisible, Manhattan y escala)    │
│  - Shared Domain Types (GraphNode, GraphEdge, Steps)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐        ┌─────────────────────────┐
│    server/ (Backend API)    │        │   tests/ (Unit Tests)   │
│  - Endpoints REST Express   │        │  - MinPriorityQueue     │
│  - Validación robusta 400   │        │  - Graph integrity      │
│  - Escenarios predefinidos  │        │  - Dijkstra & A* parity │
│  - Generador conexo         │        │  - Supertest API tests  │
└──────────────┬──────────────┘        └─────────────────────────┘
               │ HTTP JSON (path, steps, metrics)
               ▼
┌─────────────────────────────┐
│   src/ (Frontend Client)    │
│  - Lienzo SVG interactivo   │
│  - Motor de playback steps  │
│  - Tabla comparativa matrix │
│  - Panel educativo teórico  │
│  - Editor de grafos         │
└─────────────────────────────┘
```

### Flujo de Datos
1. El usuario selecciona o diseña una red vial en el cliente.
2. El frontend envía los datos del grafo y los nodos origen/destino al backend Express.
3. El backend valida exhaustivamente la solicitud (nodos existentes, pesos no negativos).
4. El servicio invoca el motor de `shared/algorithms`, ejecutando la búsqueda y registrando cronológicamente cada paso (`visit_node`, `examine_edge`, `update_distance`, `finish`).
5. El backend responde con el camino óptimo, las métricas reales y el historial de pasos.
6. El hook `useAlgorithmPlayback` en el cliente reproduce la animación de la búsqueda paso a paso de forma controlable.

---

## 5. Representación del Grafo

El grafo se implementa en la clase `Graph` mediante **Listas de Adyacencia** estructuradas en tablas hash (`Map`):

```typescript
type NeighborInfo = {
  nodeId: string;
  weight: number; // Distancia en kilómetros (w >= 0)
  time: number;   // Tiempo estimado en minutos
  edgeId: string;
};

// Map: fromNodeId -> (toNodeId -> NeighborInfo)
private adjacency: Map<string, Map<string, NeighborInfo>> = new Map();
```

### Ventajas de esta representación
* **Eficiencia espacial**: $O(V + E)$ en comparación con $O(V^2)$ de una matriz de adyacencia, ideal para redes viales reales que son grafos dispersos (*sparse graphs*).
* **Consulta de vecinos**: $O(k)$ donde $k$ es el grado del vértice explorado.
* **Consulta de peso de arista**: $O(1)$ amortizado.

---

## 6. Cola de Prioridad Mínima (`MinPriorityQueue`)

Ambos algoritmos requieren extraer reiteradamente el vértice con menor costo estimado. Se implementó un **Min-Heap binario sobre un array dinámico** (Binary Min-Heap) desde cero:

* **Índices del árbol**:
  * Padre de $i$: $\lfloor(i - 1) / 2\rfloor$
  * Hijo izquierdo: $2i + 1$
  * Hijo derecho: $2i + 2$
* **Inserción (`push`)**: Añade al final y realiza *bubble-up* en $O(\log V)$.
* **Extracción del mínimo (`pop`)**: Reemplaza la raíz con el último elemento y ejecuta *sink-down* en $O(\log V)$.
* **Consulta del mínimo (`peek`)**: $O(1)$.

---

## 7. Algoritmos Implementados

### A. Dijkstra
Algoritmo voraz no informado para caminos mínimos en grafos con pesos no negativos ($w \ge 0$):

1. Inicializa $g(\text{origen}) = 0$ y $g(v) = \infty$ para todos los demás vértices.
2. Inserta el origen en la cola de prioridad con prioridad $0$.
3. Mientras la cola no esté vacía:
   * Extrae el nodo $u$ con menor $g(u)$.
   * Si $u$ es el destino, se finaliza la búsqueda de inmediato.
   * Para cada vecino $v$, si $g(u) + w(u, v) < g(v)$, se relaja la arista, se actualiza $g(v)$, se asigna `previous[v] = u` y se añade $v$ a la cola.
4. Si se detecta alguna arista con $w < 0$, lanza formalmente `NegativeWeightError`.

### B. A* (A-Star)
Algoritmo de búsqueda informada con función heurística:

$$f(n) = g(n) + h(n)$$

* **$g(n)$**: Costo real acumulado desde el origen hasta el vértice $n$.
* **$h(n)$**: Estimación del costo restante desde $n$ hasta el destino.
* **$f(n)$**: Costo total estimado del camino que pasa por $n$. Se utiliza como prioridad en el Min-Heap.

### Admisibilidad y Consistencia de la Heurística
Para que A* garantice encontrar el camino óptimo manteniendo su propiedad de optimalidad:
1. **Admisibilidad**: $h(n) \le h^*(n)$ (la heurística nunca sobreestima la distancia real a la meta).
2. **Consistencia (Monotonía)**: Satisface la desigualdad triangular:
   $$h(u) \le w(u, v) + h(v)$$

> **Teorema de Admisibilidad en RouteOptimizer**:
> En un plano cartesiano, la distancia en línea recta $d_E(u, v) = \sqrt{(u.x - v.x)^2 + (u.y - v.y)^2}$ representa la geodésica mínima teórica. Para cualquier red vial donde las aristas representen carreteras reales, la longitud del tramo $w(u, v) \ge d_E(u, v)$.
> 
> Para grafos sintéticos con coordenadas arbitrarias, el sistema calcula un factor de escala seguro:
> $$\alpha = \min \left(1.0, \min_{(u, v) \in E} \frac{w(u, v)}{d_E(u, v)}\right)$$
> garantizando matemáticamente que $h(n) = d_E(n, \text{destino}) \times \alpha$ sea siempre **admisible** y **consistente**, preservando la precisión completa de punto flotante sin redondeos espurios hacia arriba.

---

## 8. Análisis de Complejidad Algorítmica

| Algoritmo | Complejidad Temporal (Peor caso) | Complejidad Temporal (Promedio) | Complejidad Espacial | Garantía de Optimalidad |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | $O((V + E) \log V)$ | $O((V + E) \log V)$ | $O(V)$ | Estricta ($w \ge 0$) |
| **A\*** | $O((V + E) \log V)$ | $O(b^d)$ con poda drástica | $O(V)$ | Estricta si $h(n)$ es admisible |

* $V$: Número de vértices (nodos).
* $E$: Número de aristas (conexiones).
* $b$: Factor de ramificación efectivo.
* $d$: Profundidad de la solución.

---

## 9. Comparación Objetiva: Dijkstra vs A*

RouteOptimizer no declara un "ganador universal" ni utiliza el tiempo de CPU como criterio definitivo. La comparación se basa en métricas estructurales:

1. **Optimalidad idéntica**: Ambos algoritmos encuentran exactamente la misma distancia total cuando la heurística es admisible ($d_{\text{Dijkstra}} = d_{\text{A*}}$).
2. **Nodos visitados (Carga de Búsqueda)**: En escenarios donde la geometría orienta adecuadamente hacia la meta, A* suele explorar sustancialmente menos nodos que Dijkstra al podar direcciones opuestas. En escenarios con obstáculos severos o rutas con desvíos forzados, la cantidad de nodos explorados puede aproximarse a la de Dijkstra manteniendo en todo momento la optimalidad.
3. **Aristas examinadas**: Refleja la cantidad de inspecciones y evaluaciones de relajación requeridas.
4. **Tiempo de CPU**: Se reporta como métrica experimental complementaria, advirtiendo sobre su dependencia de la carga del procesador.

---

## 10. Escenarios Incluidos

* **Ciudad Pequeña (10 nodos)**: Red céntrica con anillo vial y rutas alternativas evidentes. Ideal para entender la exploración visual.
* **Ciudad Mediana (25 nodos)**: Cuadrícula urbana con distritos interconectados y vías rápidas en diagonal.
* **Ciudad Grande (50 nodos)**: Red metropolitana con 5 clusters urbanos (Norte, Sur, Este, Oeste, Centro) conectados mediante autopistas arteriales.
* **Generador de Grafos Conexos**: Genera redes aleatorias garantizando conectividad total entre origen y destino mediante un árbol de expansión (*Spanning Tree*) y enlaces por vecindad $k$-NN.

---

## 11. Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18 o superior (verificado en v24).
* npm v9 o superior.

### Pasos de Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/EstebanDMR/RouteOptimizer.git
   cd RouteOptimizer
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo de desarrollo (inicia Frontend y Backend concurrentemente):
   ```bash
   npm run dev
   ```
   * **Frontend (Vite)**: `http://localhost:5173`
   * **Backend API (Express)**: `http://localhost:3001`

---

## 12. Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia Frontend (`vite`) y Backend (`tsx watch`) concurrentemente. |
| `npm run dev:client` | Inicia únicamente el servidor de desarrollo de Vite. |
| `npm run dev:server` | Inicia únicamente la API de Express con recarga en caliente. |
| `npm run test` | Ejecuta la suite completa de pruebas unitarias e integración con Vitest. |
| `npm run typecheck` | Ejecuta el análisis estricto de tipos de TypeScript sin emitir código. |
| `npm run build` | Compila TypeScript y genera el bundle optimizado para producción. |

---

## 13. Suite de Pruebas Automatizadas

La aplicación cuenta con **30 pruebas unitarias e integrales** que validan la lógica crítica:

```bash
npm run test
```

### Cobertura de Pruebas:
* `priorityQueue.test.ts`: Extracciones ordenadas en Min-Heap, manejo de prioridades idénticas y cola vacía.
* `graph.test.ts`: Listas de adyacencia, inserción/eliminación de nodos y aristas, detección de ciclos y validaciones de integridad.
* `algorithms.test.ts`:
  * Paridad de optimalidad: `dijkstra.totalDistance === astar.totalDistance`.
  * Selección de camino más corto ante múltiples rutas alternativas.
  * Manejo del caso borde origen = destino ($d = 0$, camino `[origen]`).
  * Detección de grafos desconectados y destinos inalcanzables (`unreachable: true`).
  * Demostración de ventaja heurística en corredor geométrico controlado ($A^*$ visita menos nodos que Dijkstra).
  * Equivalencia estricta de A* con heurística nula $h(n) = 0$ frente a Dijkstra.
* `validation.test.ts`: Rechazo de pesos negativos con `NegativeWeightError` y validación de nodos inexistentes.
* `api.test.ts`: Integración de endpoints Express (`GET /api/scenarios`, `POST /api/algorithms/dijkstra`, `POST /api/algorithms/astar`, `POST /api/algorithms/compare`, `POST /api/scenarios/generate`).

---

## 14. Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
