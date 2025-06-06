
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getCenter(): LatLng;
      getZoom(): number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum ControlPosition {
      TOP_CENTER = 'TOP_CENTER',
      TOP_LEFT = 'TOP_LEFT',
      TOP_RIGHT = 'TOP_RIGHT'
    }

    namespace drawing {
      class DrawingManager {
        constructor(options?: DrawingManagerOptions);
        setMap(map: Map | null): void;
        addListener(eventName: string, handler: Function): void;
      }

      interface DrawingManagerOptions {
        drawingMode?: OverlayType;
        drawingControl?: boolean;
        drawingControlOptions?: DrawingControlOptions;
        polygonOptions?: PolygonOptions;
      }

      interface DrawingControlOptions {
        position?: ControlPosition;
        drawingModes?: OverlayType[];
      }

      enum OverlayType {
        POLYGON = 'polygon'
      }
    }

    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
      getPath(): MVCArray<LatLng>;
    }

    interface PolygonOptions {
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
      editable?: boolean;
      draggable?: boolean;
      paths?: LatLng[] | LatLngLiteral[];
    }

    class MVCArray<T> {
      forEach(callback: (elem: T, index: number) => void): void;
      addListener(eventName: string, handler: Function): void;
    }
  }
}

export {};
