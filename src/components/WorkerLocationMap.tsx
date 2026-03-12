import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface WorkerLocationMapProps {
  city: string;
  radius_km: number;
  latitude?: number;
  longitude?: number;
}

/**
 * WorkerLocationMap Component
 * Displays worker service area coverage zone on an interactive map
 * Shows radius circle indicating coverage area
 */
const WorkerLocationMap: React.FC<WorkerLocationMapProps> = ({
  city,
  radius_km,
  latitude = -26.2023,
  longitude = 28.0436,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    setMapCenter([latitude, longitude]);
  }, [latitude, longitude]);

  // Radius in km converted to meters
  const radiusMeters = radius_km * 1000;

  return (
    <div className="worker-location-map w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Service area radius circle */}
        <Circle
          center={mapCenter}
          radius={radiusMeters}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{city}</p>
              <p>Coverage Radius: {radius_km} km</p>
            </div>
          </Popup>
        </Circle>
      </MapContainer>
    </div>
  );
};

export default WorkerLocationMap;