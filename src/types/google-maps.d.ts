
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
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
      addListener(eventName: string, handler: Function): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      styles?: MapTypeStyle[];
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Array<{ [key: string]: any }>;
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

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, marker?: Marker): void;
      close(): void;
    }

    interface InfoWindowOptions {
      content?: string | Element;
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
    }

    enum GeocoderStatus {
      OK = 'OK',
      ERROR = 'ERROR'
    }

    namespace drawing {
      class DrawingManager {
        constructor(options?: DrawingManagerOptions);
        setMap(map: Map | null): void;
        setDrawingMode(mode: OverlayType | null): void;
      }

      interface DrawingManagerOptions {
        drawingMode?: OverlayType | null;
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
      setOptions(options: PolygonOptions): void;
    }

    interface PolygonOptions {
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
      editable?: boolean;
      draggable?: boolean;
      clickable?: boolean;
      paths?: LatLng[] | LatLngLiteral[] | LatLng[][] | LatLngLiteral[][];
    }

    class MVCArray<T> {
      forEach(callback: (elem: T, index: number) => void): void;
      getArray(): T[];
      addListener(eventName: string, handler: Function): void;
    }

    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): void;
    }
  }
}

export {};
