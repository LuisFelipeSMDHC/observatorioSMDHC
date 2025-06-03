import type { Parceria, Filter, RangeFilter, FilterType } from '../types';

/**
 * Filters partnerships based on applied filters (categorical and range)
 */
export function filterParcerias(parcerias: Parceria[], appliedFilters: FilterType[]): Parceria[] {
  if (!appliedFilters.length) return parcerias;

  const categoricalFilters: Filter[] = [];
  const rangeFilters: RangeFilter[] = [];

  // Separate filters by type
  appliedFilters.forEach(filter => {
    if ('type' in filter && filter.type === 'range') {
      rangeFilters.push(filter);
    } else {
      categoricalFilters.push(filter as Filter);
    }
  });

  // Apply categorical filters
  let filtered = parcerias;
  
  if (categoricalFilters.length > 0) {
    const filtersByCategory: Record<string, Set<string>> = {};
    
    categoricalFilters.forEach(filter => {
      if (!filtersByCategory[filter.category]) {
        filtersByCategory[filter.category] = new Set();
      }
      filtersByCategory[filter.category].add(filter.value);
    });

    filtered = filtered.filter(parceria =>
      Object.entries(filtersByCategory).every(
        ([category, values]) => values.has(parceria[category as keyof Parceria] as string)
      )
    );
  }
  // Apply range filters
  if (rangeFilters.length > 0) {
    filtered = filtered.filter(parceria => {
      return rangeFilters.every(filter => {
        if (filter.category === 'verba') {
          // For cost filtering, compare value per address instead of total value
          const valuePerAddress = parceria.verba / (parceria.enderecos?.length || 1);
          return valuePerAddress >= filter.min && valuePerAddress <= filter.max;
        } else if (filter.category === 'data') {
          const inicioDate = new Date(parceria.inicio).getTime();
          const terminoDate = new Date(parceria.termino).getTime();
          return (inicioDate >= filter.min && inicioDate <= filter.max) ||
                 (terminoDate >= filter.min && terminoDate <= filter.max) ||
                 (inicioDate <= filter.min && terminoDate >= filter.max);
        }
        return true;
      });
    });
  }

  return filtered;
}

/**
 * Generates unique values for a given category from partnerships data
 */
export function getUniqueValues(parcerias: Parceria[], category: keyof Parceria): string[] {
  return [...new Set(parcerias.map(p => String(p[category])))].filter(Boolean);
}

/**
 * Generates a color palette for categorical data
 */
export function generateColorPalette(values: string[]): Record<string, string> {
  const colors: Record<string, string> = {};
  const step = 360 / values.length;

  values.forEach((value, index) => {
    const hue = Math.round(index * step);
    colors[value] = `hsla(${hue}, 70%, 50%, 0.6)`;
  });

  return colors;
}

/**
 * Calculates marker radius based on value range
 */
export function calculateMarkerRadius(value: number, minValue: number, maxValue: number): number {
  const MIN_RADIUS = 250;
  const MAX_RADIUS = 1000;

  // Handle invalid values
  if (!value || isNaN(value) || maxValue === minValue || minValue < 0) {
    return MIN_RADIUS;
  }

  // Ensure value is within range
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));
  
  // Calculate normalized radius
  const normalizedRatio = (clampedValue - minValue) / (maxValue - minValue);
  return Math.round(MIN_RADIUS + normalizedRatio * (MAX_RADIUS - MIN_RADIUS));
}

/**
 * Formats numbers for display
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

/**
 * Gets the min and max values for verba (valor total) in partnerships
 * For projects with multiple addresses, calculates value per address
 */
export function getVerbaRange(parcerias: Parceria[]): { min: number; max: number } {
  if (!parcerias.length) return { min: 0, max: 0 };
  
  // Calculate value per address for each project
  const verbas: number[] = [];
  parcerias.forEach(p => {
    if (p.verba && !isNaN(p.verba) && p.enderecos && p.enderecos.length > 0) {
      const valuePerAddress = p.verba / p.enderecos.length;
      verbas.push(valuePerAddress);
    }
  });
  
  if (verbas.length === 0) return { min: 0, max: 0 };
  
  const maxValue = Math.max(...verbas);
  // Round up to the nearest million
  const maxRounded = Math.ceil(maxValue / 1000000) * 1000000;
  
  return {
    min: 0, // Sempre começar do 0 para permitir filtrar desde valores baixos
    max: maxRounded
  };
}

/**
 * Gets the min and max dates for partnerships
 */
export function getDateRange(parcerias: Parceria[]): { min: number; max: number } {
  if (!parcerias.length) return { min: 0, max: 0 };
  
  const dates: number[] = [];
  parcerias.forEach(p => {
    if (p.inicio) dates.push(new Date(p.inicio).getTime());
    if (p.termino) dates.push(new Date(p.termino).getTime());
  });
  
  return {
    min: Math.min(...dates),
    max: Math.max(...dates)
  };
}

/**
 * Formats a timestamp to a readable date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

/**
 * Formats currency value for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
