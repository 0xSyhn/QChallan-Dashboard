import { LatLngExpression } from 'leaflet';

export interface Centroid {
    name: string;
    longitude: number;
    latitude: number;
}

export interface DataPoint {
    vehicleNumber: string;
    violations: string;
    longitude: number;
    latitude: number;
    cluster?: Centroid;
}

export const centroids: Centroid[] = [
    { name: 'Vasco da Gama', longitude: 73.8113, latitude: 15.3927 },
    { name: 'Ponda', longitude: 73.9668, latitude: 15.4027 },
    { name: 'Bicholim', longitude: 73.9087, latitude: 15.5857 },
    { name: 'Curchorem', longitude: 74.1109, latitude: 15.2644 },
    { name: 'Valpoi', longitude: 74.1367, latitude: 15.5321 },
    { name: 'Canacona', longitude: 74.0593, latitude: 14.9959 },
    { name: 'Pernem', longitude: 73.7951, latitude: 15.7217 },
    { name: 'Sanguem', longitude: 74.1510, latitude: 15.2292 },
    { name: 'Quepem', longitude: 74.0777, latitude: 15.2126 },
    { name: 'Dharbandora', longitude: 74.2070, latitude: 15.4226 }
];

export const regionColors: { [key: string]: string } = {
    'North West': '#ff6b6b',
    'North East': '#4ecdc4',
    'South West': '#45aaf2',
    'South East': '#fed330'
};

export function distance(point1: DataPoint | Centroid, point2: Centroid): number {
    const dx = point1.longitude - point2.longitude;
    const dy = point1.latitude - point2.latitude;
    return Math.sqrt(dx * dx + dy * dy);
}

export function kMeansClustering(data: DataPoint[], centroids: Centroid[]): DataPoint[] {
    return data.map(point => {
        let minDistance = Infinity;
        let cluster: Centroid | undefined;
        centroids.forEach(centroid => {
            const d = distance(point, centroid);
            if (d < minDistance) {
                minDistance = d;
                cluster = centroid;
            }
        });
        return { ...point, cluster };
    });
}

export function categorizeRegion(longitude: number, latitude: number): string {
    const centerLong = 73.99;
    const centerLat = 15.35;
    if (longitude < centerLong && latitude > centerLat) return 'North West';
    if (longitude >= centerLong && latitude > centerLat) return 'North East';
    if (longitude < centerLong && latitude <= centerLat) return 'South West';
    return 'South East';
}

export const mapCenter: LatLngExpression = [15.4, 73.8];
export const initialZoom = 10;