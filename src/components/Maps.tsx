'use client'
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, LayersControl, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import vehicleData from '@/lib/vehicleDetails';
import { centroids, regionColors, kMeansClustering, categorizeRegion, mapCenter, initialZoom, DataPoint } from '@/lib/kmeans';

const Map: React.FC = () => {
    // const [data_, setData] = useState<DataPoint[]>([]);
    const [clusteredData, setClusteredData] = useState<DataPoint[]>([]);

    useEffect(() => {
        // Directly set the imported data to the state
        // setData(vehicleData);
        setClusteredData(kMeansClustering(vehicleData, centroids));
    }, []);

    const renderClusters = () => {
        const groupedData: { [key: string]: DataPoint[] } = {};
        clusteredData.forEach(point => {
            if (point.cluster && point.cluster.name) {
                if (!groupedData[point.cluster.name]) {
                    groupedData[point.cluster.name] = [];
                }
                groupedData[point.cluster.name].push(point);
            }
        });

        return Object.entries(groupedData).map(([clusterName, points]) => {
            if (points.length === 0) return null;

            const region = categorizeRegion(points[0].longitude, points[0].latitude);
            const color = regionColors[region];

            return (
                <FeatureGroup key={clusterName}>
                    {points.map((point, index) => (
                        <CircleMarker
                            key={index}
                            center={[point.latitude, point.longitude]}
                            radius={8}
                            fillColor={color}
                            color="#000"
                            weight={1}
                            opacity={1}
                            fillOpacity={1}
                        >
                            <Popup>
                                Vehicle: {point.vehicleNumber}<br />
                                Violation: {point.violations}
                            </Popup>
                        </CircleMarker>
                    ))}
                    {renderCentroid(clusterName, points, color)}
                </FeatureGroup>
            );
        });
    };

    const renderCentroid = (clusterName: string, points: DataPoint[], color: string) => {
        const centroid = centroids.find(c => c.name === clusterName);
        if (!centroid) return null;

        const icon = L.divIcon({
            className: 'cluster-icon',
            html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 16px; border: 2px solid #000;">${points.length}</div>`
        });

        return (
            <Marker position={[centroid.latitude, centroid.longitude]} icon={icon}>
                <Popup>
                    <strong>{clusterName}</strong><br />
                    Region: {categorizeRegion(centroid.longitude, centroid.latitude)}<br />
                    Violations: {points.length}
                </Popup>
            </Marker>
        );
    };

    return (
        <MapContainer center={mapCenter} zoom={initialZoom} className='w-full h-[39rem]'  >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LayersControl position="topright">
                <LayersControl.Overlay checked name="Clusters">
                    <FeatureGroup>
                        {renderClusters()}
                    </FeatureGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
};

export default Map;
