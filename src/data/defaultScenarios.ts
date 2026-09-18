import { ScenarioPreset } from '@shared/types/graph';

// Escenarios locales para inicialización inmediata del cliente antes del primer fetch
export const fallbackSmallCity: ScenarioPreset = {
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
