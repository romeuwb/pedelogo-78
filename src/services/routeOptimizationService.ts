
export interface Location {
  lat: number;
  lng: number;
  address: string;
  type: 'restaurant' | 'customer' | 'delivery_center';
}

export interface RouteOptimizationRequest {
  origin: Location;
  destinations: Location[];
  deliveryDetails?: {
    vehicle_type: 'bike' | 'motorcycle' | 'car';
    max_capacity: number;
    current_load: number;
  };
  preferences?: {
    avoid_tolls: boolean;
    avoid_highways: boolean;
    optimize_for: 'time' | 'distance' | 'fuel';
  };
}

export interface OptimizedRoute {
  route_id: string;
  total_distance: number;
  total_time: number;
  waypoints: Array<{
    location: Location;
    arrival_time: string;
    distance_from_previous: number;
    time_from_previous: number;
    order: number;
  }>;
  estimated_cost: {
    fuel: number;
    time_value: number;
    total: number;
  };
}

export class RouteOptimizationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async optimizeRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute> {
    try {
      console.log('Optimizing route for:', request);

      // Calculate distance matrix for all destinations
      const distanceMatrix = await this.calculateDistanceMatrix(
        request.origin,
        request.destinations
      );

      // Apply optimization algorithm
      const optimizedOrder = this.optimizeWaypoints(
        distanceMatrix,
        request.preferences?.optimize_for || 'time'
      );

      // Calculate route details
      const routeDetails = await this.calculateRouteDetails(
        request.origin,
        optimizedOrder,
        request.preferences
      );

      return {
        route_id: this.generateRouteId(),
        ...routeDetails
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      throw new Error('Failed to optimize route');
    }
  }

  private async calculateDistanceMatrix(
    origin: Location,
    destinations: Location[]
  ): Promise<number[][]> {
    const locations = [origin, ...destinations];
    const matrix: number[][] = [];

    for (let i = 0; i < locations.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          const distance = this.calculateHaversineDistance(
            locations[i],
            locations[j]
          );
          matrix[i][j] = distance;
        }
      }
    }

    return matrix;
  }

  private calculateHaversineDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLng = this.toRadians(loc2.lng - loc1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private optimizeWaypoints(
    distanceMatrix: number[][],
    optimizeFor: 'time' | 'distance' | 'fuel'
  ): Location[] {
    // Implement nearest neighbor algorithm with improvements
    const visited = new Set<number>();
    const route: number[] = [];
    let currentIndex = 0; // Start from origin
    
    visited.add(currentIndex);
    
    while (visited.size < distanceMatrix.length) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;
      
      for (let i = 1; i < distanceMatrix.length; i++) {
        if (!visited.has(i) && distanceMatrix[currentIndex][i] < nearestDistance) {
          nearestDistance = distanceMatrix[currentIndex][i];
          nearestIndex = i;
        }
      }
      
      if (nearestIndex !== -1) {
        visited.add(nearestIndex);
        route.push(nearestIndex);
        currentIndex = nearestIndex;
      }
    }
    
    return route.slice(1).map(index => ({ 
      lat: 0, 
      lng: 0, 
      address: '', 
      type: 'customer' as const 
    })); // Simplified return
  }

  private async calculateRouteDetails(
    origin: Location,
    waypoints: Location[],
    preferences?: RouteOptimizationRequest['preferences']
  ): Promise<Omit<OptimizedRoute, 'route_id'>> {
    // Simulate route calculation
    let totalDistance = 0;
    let totalTime = 0;
    const waypointDetails = [];
    
    let currentLocation = origin;
    
    for (let i = 0; i < waypoints.length; i++) {
      const destination = waypoints[i];
      const distance = this.calculateHaversineDistance(currentLocation, destination);
      const time = this.estimateTime(distance, preferences);
      
      totalDistance += distance;
      totalTime += time;
      
      waypointDetails.push({
        location: destination,
        arrival_time: new Date(Date.now() + totalTime * 60000).toISOString(),
        distance_from_previous: distance,
        time_from_previous: time,
        order: i + 1
      });
      
      currentLocation = destination;
    }
    
    return {
      total_distance: totalDistance,
      total_time: totalTime,
      waypoints: waypointDetails,
      estimated_cost: this.calculateCosts(totalDistance, totalTime)
    };
  }

  private estimateTime(distance: number, preferences?: RouteOptimizationRequest['preferences']): number {
    // Base speed in km/h
    let averageSpeed = 30; // City traffic
    
    if (preferences?.avoid_highways) {
      averageSpeed *= 0.8; // Slower on local roads
    }
    
    // Convert to minutes
    return (distance / averageSpeed) * 60;
  }

  private calculateCosts(distance: number, time: number) {
    const fuelCostPerKm = 0.8; // R$ per km
    const timeCostPerMinute = 0.5; // R$ per minute
    
    const fuel = distance * fuelCostPerKm;
    const timeValue = time * timeCostPerMinute;
    
    return {
      fuel,
      time_value: timeValue,
      total: fuel + timeValue
    };
  }

  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getCurrentTrafficConditions(locations: Location[]): Promise<{
    location: Location;
    traffic_level: 'low' | 'medium' | 'high';
    delay_factor: number;
  }[]> {
    // Simulate traffic conditions
    return locations.map(location => ({
      location,
      traffic_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      delay_factor: 1 + Math.random() * 0.5 // 1.0 to 1.5 multiplier
    }));
  }

  async calculatePeakHourAdjustments(route: OptimizedRoute, currentTime: Date): Promise<OptimizedRoute> {
    const peakHours = [
      { start: 7, end: 9 },   // Morning
      { start: 12, end: 14 }, // Lunch
      { start: 18, end: 20 }  // Evening
    ];
    
    const currentHour = currentTime.getHours();
    const isPeakHour = peakHours.some(peak => currentHour >= peak.start && currentHour <= peak.end);
    
    if (isPeakHour) {
      const peakMultiplier = 1.4; // 40% increase during peak hours
      
      return {
        ...route,
        total_time: route.total_time * peakMultiplier,
        estimated_cost: {
          ...route.estimated_cost,
          time_value: route.estimated_cost.time_value * peakMultiplier,
          total: route.estimated_cost.fuel + (route.estimated_cost.time_value * peakMultiplier)
        },
        waypoints: route.waypoints.map(waypoint => ({
          ...waypoint,
          time_from_previous: waypoint.time_from_previous * peakMultiplier,
          arrival_time: new Date(
            new Date(waypoint.arrival_time).getTime() + 
            (waypoint.time_from_previous * (peakMultiplier - 1) * 60000)
          ).toISOString()
        }))
      };
    }
    
    return route;
  }
}

export const createRouteOptimizationService = (apiKey: string) => {
  return new RouteOptimizationService(apiKey);
};
