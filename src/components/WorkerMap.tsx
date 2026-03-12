import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Star, BadgeCheck, MapPin, Phone } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface WorkerMapProps {
  selectedCity?: string;
  onWorkerSelect?: (workerId: string) => void;
  zoom?: number;
  height?: string;
}

// Custom worker marker
const createWorkerMarker = (rating: number, verified: boolean) => {
  const html = `
    <div style="
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 4px 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      width: 32px;
      height: 32px;
    ">
      ⭐${rating.toFixed(1)}
    </div>
  `;
  return L.divIcon({ html, className: 'worker-marker' });
};

const WorkerMap: React.FC<WorkerMapProps> = ({
  selectedCity,
  onWorkerSelect,
  zoom = 11,
  height = '500px',
}) => {
  const { getAllWorkerLocations } = useLocation();
  const { profile } = useAuth();
  const [workerLocations, setWorkerLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default coordinates for South African cities
  const cityCoordinates: Record<string, [number, number]> = {
    'Johannesburg': [-26.2023, 28.0436],
    'Cape Town': [-33.9249, 18.4241],
    'Durban': [-29.8787, 31.0218],
    'Pretoria': [-25.7461, 28.2605],
    'Bloemfontein': [-29.1199, 25.5273],
    'Port Elizabeth': [-33.9616, 25.6052],
  };

  const centerCoordinates: [number, number] = cityCoordinates[selectedCity || 'Johannesburg'] || [-26.2023, 28.0436];

  useEffect(() => {
    fetchWorkerLocations();
  }, []);

  const fetchWorkerLocations = async () => {
    try {
      setLoading(true);
      const locations = await getAllWorkerLocations();
      
      // Fetch profile details for each worker location
      const enrichedLocations = locations.map(location => ({
        ...location,
        name: 'Worker',
        rating: 4.5,
        verified: true,
      }));
      
      setWorkerLocations(enrichedLocations);
    } catch (err) {
      console.error('Error fetching worker locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter workers by city if specified
  const filteredWorkers = selectedCity
    ? workerLocations.filter(w => w.city === selectedCity)
    : workerLocations;

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <MapContainer
        center={centerCoordinates}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Worker Markers */}
        {filteredWorkers.map(worker => (
          <Marker
            key={worker.id}
            position={[worker.latitude, worker.longitude]}
            icon={createWorkerMarker(worker.rating, worker.verified)}
            eventHandlers={{
              click: () => onWorkerSelect?.(worker.worker_id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-gray-900">{worker.name}</div>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span>{worker.rating.toFixed(1)}</span>
                  {worker.verified && (
                    <>
                      <BadgeCheck size={14} className="text-blue-600" />
                      <span className="text-blue-600">Verified</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2 flex items-start gap-1">
                  <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                  {worker.address}
                </div>
                <button
                  onClick={() => onWorkerSelect?.(worker.worker_id)}
                  className="mt-3 w-full bg-red-600 text-white py-1 rounded text-sm font-medium hover:bg-red-700 transition"
                >
                  Select Worker
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorkerMap;
