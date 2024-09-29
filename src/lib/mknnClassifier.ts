class StandardScaler {
    private mean: number[] | null = null;
    private std: number[] | null = null;

    fit_transform(X: number[][]): number[][] {
        this.mean = X.reduce((acc, val) => acc.map((v, i) => v + val[i]), [0, 0])
            .map(v => v / X.length);
        this.std = X.reduce((acc, val) => acc.map((v, i) => v + Math.pow(val[i] - this.mean![i], 2)), [0, 0])
            .map(v => Math.sqrt(v / X.length));
        return this.transform(X);
    }

    transform(X: number[][]): number[][] {
        if (!this.mean || !this.std) {
            throw new Error('Scaler is not fitted. Call fit_transform first.');
        }
        return X.map(x => x.map((v, i) => (v - this.mean![i]) / this.std![i]));
    }
}

class NearestNeighbors {
    private n_neighbors: number;
    private radius: number;
    private X: number[][] | null = null;

    constructor(n_neighbors: number, radius: number) {
        this.n_neighbors = n_neighbors;
        this.radius = radius;
    }

    fit(X: number[][]): void {
        this.X = X;
    }

    kneighbors(X: number[][]): [number[][], number[][]] {
        if (!this.X) {
            throw new Error('Model is not fitted. Call fit first.');
        }
        const distances = X.map(x => this.X!.map(y => this.haversine(x, y)));
        const indices = distances.map(d => 
            d.map((v, i) => [v, i] as [number, number])
             .sort((a, b) => a[0] - b[0])
             .slice(0, this.n_neighbors)
             .map(v => v[1])
        );
        return [distances.map(d => d.sort((a, b) => a - b).slice(0, this.n_neighbors)), indices];
    }

    private haversine(point1: number[], point2: number[]): number {
        const toRad = (x: number) => x * Math.PI / 180;
        const R = 6371; // Earth's radius in km

        const dLat = toRad(point2[0] - point1[0]);
        const dLon = toRad(point2[1] - point1[1]);
        const lat1 = toRad(point1[0]);
        const lat2 = toRad(point2[0]);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

export class MKNNGeoClassifier {
    private n_neighbors: number;
    private radius: number;
    private scaler: StandardScaler;
    private nn: NearestNeighbors;
    private X: number[][] | null = null;
    private y: string[] | null = null;

    constructor(n_neighbors: number = 5, radius: number = 1.0) {
        this.n_neighbors = n_neighbors;
        this.radius = radius;
        this.scaler = new StandardScaler();
        this.nn = new NearestNeighbors(n_neighbors, radius);
    }

    fit(X: number[][], y: string[]): void {
        this.X = this.scaler.fit_transform(X);
        this.y = y;
        this.nn.fit(this.X);
    }

    predict(X: number[][]): string[] {
        if (!this.X || !this.y) {
            throw new Error('Model is not fitted. Call fit first.');
        }
        const X_scaled = this.scaler.transform(X);
        const [distances, indices] = this.nn.kneighbors(X_scaled);
        
        return X.map((_, i) => {
            const weights = distances[i].map(d => 1 / (d + 1e-5));
            const class_votes: {[key: string]: number} = {};
            indices[i].forEach((idx, j) => {
                const label = this.y![idx];
                class_votes[label] = (class_votes[label] || 0) + weights[j];
            });
            return Object.keys(class_votes).reduce((a, b) => class_votes[a] > class_votes[b] ? a : b);
        });
    }

    cluster_and_analysis(X: number[][], amounts: number[], violations: string[]): {[key: string]: {total_amount: number, violations: {[key: string]: number}}} {
        const predictions = this.predict(X);
        const clusters: {[key: string]: {total_amount: number, violations: {[key: string]: number}}} = {};
        predictions.forEach((pred, i) => {
            if (!clusters[pred]) {
                clusters[pred] = { total_amount: 0, violations: {} };
            }
            clusters[pred].total_amount += amounts[i];
            clusters[pred].violations[violations[i]] = (clusters[pred].violations[violations[i]] || 0) + 1;
        });
        return clusters;
    }
}


export async function fetchCardData() {
    try {
        // Example data
        const locations = [
            [28.6139, 77.2090],  // Delhi
            [19.0760, 72.8777],  // Mumbai
            [13.0827, 80.2707],  // Chennai
            [22.5726, 88.3639],  // Kolkata
            [12.9716, 77.5946],  // Bangalore
            [28.7041, 77.1025],  // Near Delhi
            [19.1176, 72.9060],  // Near Mumbai
        ];
        const zones = ['North', 'West', 'South', 'East', 'South', 'North', 'West'];
        const amounts = [1000, 1500, 800, 1200, 900, 1100, 1300];
        const violations = ['Speeding', 'Red Light', 'No Parking', 'Wrong Lane', 'No Helmet', 'Speeding', 'Red Light'];

        const classifier = new MKNNGeoClassifier(3);
        classifier.fit(locations, zones);

        const analysis = classifier.cluster_and_analysis(locations, amounts, violations);

        interface ViolationData {
            name: string;
            count: number;
        }

        interface ZoneData {
            challans: number;
            amount: number;
            avgAmount: number;
            violations: ViolationData[];
        }

        const zoneData: { [key: string]: ZoneData } = {
            North: { challans: 0, amount: 0, avgAmount: 0, violations: [] },
            South: { challans: 0, amount: 0, avgAmount: 0, violations: [] },
            East: { challans: 0, amount: 0, avgAmount: 0, violations: [] },
            West: { challans: 0, amount: 0, avgAmount: 0, violations: [] }
        };

        for (const [zone, data] of Object.entries(analysis)) {
            const challans = Object.values(data.violations).reduce((a, b) => a + b, 0);
            zoneData[zone] = {
                challans: challans,
                amount: data.total_amount,
                avgAmount: data.total_amount / challans,
                violations: Object.entries(data.violations).map(([name, count]) => ({ name, count }))
            };
        }

        return zoneData;
    } catch (error) {
        console.error('Analysis Error:', error);
        throw new Error('Failed to fetch card data.');
    }
}