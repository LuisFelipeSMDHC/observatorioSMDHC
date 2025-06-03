// Core data interfaces
export interface Endereco {
  coords: {
    lat: number;
    lng: number;
  };
  endereco: string;
}

export interface Parceria {
  termos: string;
  celebracao: string;
  pagamento: string;
  inicio: string;
  termino: string;
  osc: string;
  nome: string;
  enderecos: Endereco[];
  verba: number;
  origemRecurso: string;
  unidadeGestora: string;
  categoria: string;
}

export interface Filter {
  category: string;
  value: string;
}

export interface RangeFilter {
  category: string;
  type: 'range';
  min: number;
  max: number;
}

export type FilterType = Filter | RangeFilter;

// Visualization types
export type VisualizationType = 'pontos' | 'coropletico' | 'heatmap';
export type DivisionType = 'regioes' | 'subprefeituras' | 'distritos';

export interface VisualizationCriteria {
  color: string;
  size: string;
  density?: boolean;
  showValueMarkers?: boolean;
}

// Map constants
export const MAP_CONFIG = {
  BOUNDS: [
    [-24.000, -47.000],
    [-23.275, -46.200]
  ] as [number, number][],
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
  TILE_URL: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'
} as const;

export const FILTER_CATEGORIES = ['nome', 'osc', 'unidadeGestora', 'origemRecurso', 'categoria'] as string[];

export const RANGE_FILTER_CATEGORIES = ['verba', 'data'] as string[];

// Mapping for user-friendly category names
export const CATEGORY_LABELS: Record<string, string> = {
  nome: 'Projeto',
  osc: 'OSC',
  unidadeGestora: 'Unidade Gestora',
  origemRecurso: 'Origem do Recurso',
  categoria: 'Categoria',
  verba: 'Verba',
  data: 'Período'
};
