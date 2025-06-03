// Type declarations for leaflet.heat plugin
import * as L from 'leaflet';

declare module 'leaflet' {
  namespace L {
    interface HeatLayer extends Layer {
      setLatLngs(latlngs: Array<[number, number, number?]>): this;
      addLatLng(latlng: [number, number, number?]): this;
      setOptions(options: HeatMapOptions): this;
      redraw(): this;
    }

    interface HeatMapOptions {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      minOpacity?: number;
      gradient?: Record<string, string>;
    }

    function heatLayer(
      latlngs: Array<[number, number, number?]>,
      options?: HeatMapOptions
    ): HeatLayer;
  }
}

declare module 'leaflet.heat' {
  // Empty module declaration to allow import
}
