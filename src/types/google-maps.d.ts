
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        Geocoder: new () => any;
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
