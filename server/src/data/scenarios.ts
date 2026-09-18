import { ScenarioPreset } from '@shared/types/graph';

// Helper para calcular la distancia euclidiana redondeada para pesos realistas
const dist = (x1: number, y1: number, x2: number, y2: number, factor = 0.08): number => {
  const d = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) * factor;
  return Number(d.toFixed(1));
};

export const smallCityScenario: ScenarioPreset = {
  id: 'small-city',
  name: 'Ciudad Pequeña (10 nodos)',
  description: 'Red urbana básica con centro cívico, anillos viales y rutas alternativas.',
  nodeCount: 10,
  edgeCount: 15,
  defaultStart: 'A',
  defaultTarget: 'J',
  graph: {
    nodes: [
      { id: 'A', label: 'Almacén Central (A)', x: 120, y: 300 },
      { id: 'B', label: 'Zona Industrial (B)', x: 250, y: 150 },
      { id: 'C', label: 'Avenida Norte (C)', x: 420, y: 120 },
      { id: 'D', label: 'Parque Central (D)', x: 300, y: 300 },
      { id: 'E', label: 'Centro Comercial (E)', x: 440, y: 280 },
      { id: 'F', label: 'Avenida Sur (F)', x: 260, y: 460 },
      { id: 'G', label: 'Zona Residencial (G)', x: 430, y: 450 },
      { id: 'H', label: 'Campus Universitario (H)', x: 600, y: 180 },
      { id: 'I', label: 'Distrito Médico (I)', x: 610, y: 400 },
      { id: 'J', label: 'Centro de Entrega Final (J)', x: 740, y: 300 },
    ],
    edges: [
      { id: 'e_ab', from: 'A', to: 'B', weight: 14.5, time: 22, bidirectional: true },
      { id: 'e_ad', from: 'A', to: 'D', weight: 14.4, time: 20, bidirectional: true },
      { id: 'e_af', from: 'A', to: 'F', weight: 17.0, time: 25, bidirectional: true },
      { id: 'e_bc', from: 'B', to: 'C', weight: 13.8, time: 18, bidirectional: true },
      { id: 'e_bd', from: 'B', to: 'D', weight: 12.6, time: 16, bidirectional: true },
      { id: 'e_ch', from: 'C', to: 'H', weight: 15.2, time: 21, bidirectional: true },
      { id: 'e_de', from: 'D', to: 'E', weight: 11.2, time: 14, bidirectional: true },
      { id: 'e_df', from: 'D', to: 'F', weight: 13.2, time: 17, bidirectional: true },
      { id: 'e_eg', from: 'E', to: 'G', weight: 13.6, time: 18, bidirectional: true },
      { id: 'e_eh', from: 'E', to: 'H', weight: 15.1, time: 20, bidirectional: true },
      { id: 'e_ei', from: 'E', to: 'I', weight: 16.6, time: 22, bidirectional: true },
      { id: 'e_fg', from: 'F', to: 'G', weight: 13.6, time: 19, bidirectional: true },
      { id: 'e_gi', from: 'G', to: 'I', weight: 14.9, time: 20, bidirectional: true },
      { id: 'e_hj', from: 'H', to: 'J', weight: 14.8, time: 18, bidirectional: true },
      { id: 'e_ij', from: 'I', to: 'J', weight: 13.1, time: 17, bidirectional: true },
    ],
  },
};

export const mediumCityScenario: ScenarioPreset = {
  id: 'medium-city',
  name: 'Ciudad Mediana (25 nodos)',
  description: 'Red metropolitana con múltiples distritos interconectados y vías rápidas.',
  nodeCount: 25,
  edgeCount: 42,
  defaultStart: 'N01',
  defaultTarget: 'N25',
  graph: (() => {
    // Generación estructurada de 25 nodos en 5 columnas x 5 filas con dispersión realista
    const nodes: ScenarioPreset['graph']['nodes'] = [];
    const edges: ScenarioPreset['graph']['edges'] = [];

    const labels = [
      'Hub Logístico A', 'Puerto Fluvial', 'Aduana Norte', 'Parque Tecnológico', 'Sector Aeropuerto',
      'Distrito Financiero', 'Centro Histórico', 'Plaza Mayor', 'Estación Central', 'Terminal Carga',
      'Mercado Central', 'Distrito Creativo', 'Parque de la Paz', 'Zona Comercial Este', 'Subestación Este',
      'Hospital Regional', 'Avenida del Río', 'Puente Bicentenario', 'Distrito Sur', 'Complejo Deportivo',
      'Polígono Industrial Sur', 'Depósito Sur', 'Zona Aduanera Sur', 'Corredor Autopista', 'Centro Logístico Final',
    ];

    let idx = 1;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const id = `N${String(idx).padStart(2, '0')}`;
        const jitterX = ((idx * 37) % 30) - 15;
        const jitterY = ((idx * 53) % 30) - 15;
        const x = 100 + col * 150 + jitterX;
        const y = 80 + row * 110 + jitterY;
        nodes.push({
          id,
          label: `${labels[idx - 1]} (${id})`,
          x,
          y,
        });
        idx++;
      }
    }

    // Conexiones en rejilla con diagonales selectivas para caminos alternativos
    let edgeId = 1;
    const getNode = (r: number, c: number) => nodes[r * 5 + c];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const current = getNode(r, c);

        // Conexión horizontal derecha
        if (c < 4) {
          const right = getNode(r, c + 1);
          const w = dist(current.x, current.y, right.x, right.y);
          edges.push({
            id: `me_${edgeId++}`,
            from: current.id,
            to: right.id,
            weight: w,
            time: Math.round(w * 1.4),
            bidirectional: true,
          });
        }

        // Conexión vertical abajo
        if (r < 4) {
          const down = getNode(r + 1, c);
          const w = dist(current.x, current.y, down.x, down.y);
          edges.push({
            id: `me_${edgeId++}`,
            from: current.id,
            to: down.id,
            weight: w,
            time: Math.round(w * 1.4),
            bidirectional: true,
          });
        }

        // Algunas diagonales (autopistas rápidas)
        if (r < 4 && c < 4 && (r + c) % 2 === 0) {
          const diag = getNode(r + 1, c + 1);
          const w = dist(current.x, current.y, diag.x, diag.y);
          edges.push({
            id: `me_${edgeId++}`,
            from: current.id,
            to: diag.id,
            weight: Number((w * 0.95).toFixed(1)), // Vía rápida ligeramente más eficiente
            time: Math.round(w * 1.1),
            bidirectional: true,
          });
        }
      }
    }

    return { nodes, edges };
  })(),
};

export const largeCityScenario: ScenarioPreset = {
  id: 'large-city',
  name: 'Ciudad Grande (50 nodos)',
  description: 'Gran área metropolitana con 5 distritos, anillos periféricos y rutas de distribución complejas.',
  nodeCount: 50,
  edgeCount: 95,
  defaultStart: 'C01',
  defaultTarget: 'C50',
  graph: (() => {
    const nodes: ScenarioPreset['graph']['nodes'] = [];
    const edges: ScenarioPreset['graph']['edges'] = [];

    // 50 nodos distribuidos en un mapa de 900x600 con 5 clusters urbanos
    const clusterCenters = [
      { x: 160, y: 150, name: 'Distrito Norte' },
      { x: 180, y: 450, name: 'Distrito Oeste' },
      { x: 450, y: 300, name: 'Centro Metropolitano' },
      { x: 720, y: 150, name: 'Distrito Este' },
      { x: 740, y: 450, name: 'Distrito Sur' },
    ];

    let nodeIdx = 1;
    for (let c = 0; c < 5; c++) {
      const center = clusterCenters[c];
      for (let i = 0; i < 10; i++) {
        const id = `C${String(nodeIdx).padStart(2, '0')}`;
        const angle = (i / 10) * Math.PI * 2;
        const radius = 45 + ((nodeIdx * 17) % 65);
        const x = Math.round(center.x + Math.cos(angle) * radius);
        const y = Math.round(center.y + Math.sin(angle) * radius);

        nodes.push({
          id,
          label: `${center.name} - Estación ${i + 1} (${id})`,
          x,
          y,
        });
        nodeIdx++;
      }
    }

    let edgeCounter = 1;
    // Conectar nodos dentro de cada cluster
    for (let c = 0; c < 5; c++) {
      const startI = c * 10;
      for (let i = 0; i < 10; i++) {
        const current = nodes[startI + i];
        const next = nodes[startI + ((i + 1) % 10)];
        const w = dist(current.x, current.y, next.x, next.y);
        edges.push({
          id: `le_${edgeCounter++}`,
          from: current.id,
          to: next.id,
          weight: Math.max(2, w),
          time: Math.round(w * 1.5),
          bidirectional: true,
        });

        // Enlace al centro del cluster (cada 2 nodos)
        if (i % 2 === 0) {
          const cross = nodes[startI + ((i + 4) % 10)];
          const cw = dist(current.x, current.y, cross.x, cross.y);
          edges.push({
            id: `le_${edgeCounter++}`,
            from: current.id,
            to: cross.id,
            weight: Math.max(3, cw),
            time: Math.round(cw * 1.4),
            bidirectional: true,
          });
        }
      }
    }

    // Vías arteriales interconectando los clusters
    const connectClusters = (c1: number, c2: number, nodeIn1: number, nodeIn2: number) => {
      const u = nodes[c1 * 10 + nodeIn1];
      const v = nodes[c2 * 10 + nodeIn2];
      const w = dist(u.x, u.y, v.x, v.y);
      edges.push({
        id: `le_${edgeCounter++}`,
        from: u.id,
        to: v.id,
        weight: Math.max(10, w),
        time: Math.round(w * 1.2), // Autopista inter-distrital rápida
        bidirectional: true,
      });
    };

    // Anillo exterior y conexiones hacia el Centro Metropolitano (cluster 2)
    connectClusters(0, 2, 5, 0); // Norte -> Centro
    connectClusters(1, 2, 2, 3); // Oeste -> Centro
    connectClusters(3, 2, 8, 5); // Este -> Centro
    connectClusters(4, 2, 4, 7); // Sur -> Centro
    connectClusters(0, 1, 6, 1); // Norte -> Oeste
    connectClusters(0, 3, 3, 1); // Norte -> Este
    connectClusters(1, 4, 8, 9); // Oeste -> Sur
    connectClusters(3, 4, 6, 2); // Este -> Sur

    return { nodes, edges };
  })(),
};

export const defaultScenarios: ScenarioPreset[] = [
  smallCityScenario,
  mediumCityScenario,
  largeCityScenario,
];
