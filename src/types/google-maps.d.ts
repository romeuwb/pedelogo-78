
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        Geocoder: new () => any;
        Polygon: new (options: any) => any;
        ControlPosition: {
          TOP_CENTER: any;
          TOP_LEFT: any;
          TOP_RIGHT: any;
          BOTTOM_CENTER: any;
          BOTTOM_LEFT: any;
          BOTTOM_RIGHT: any;
          LEFT_CENTER: any;
          RIGHT_CENTER: any;
        };
        drawing: {
          DrawingManager: new (options: any) => any;
          OverlayType: {
            POLYGON: any;
            CIRCLE: any;
            RECTANGLE: any;
            POLYLINE: any;
            MARKER: any;
          };
        };
        event: {
          addListener: (instance: any, eventName: string, handler: Function) => any;
          removeListener: (listener: any) => void;
        };
        geometry: {
          spherical: {
            computeDistanceBetween: (from: any, to: any) => number;
          };
        };
      };
    };
  }
}

export {};
