import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, MapPin, Clock, Phone, MessageCircle, AlertCircle } from 'lucide-react';

interface WorkerTrackingProps {
  bookingId: string;
  workerLat?: number;
  workerLng?: number;
  customerLat: number;
  customerLng: number;
  workerName: string;
  workerPhone: string;
  estimatedArrival?: string;
  status: string;
  onComplete?: () => void;
}

// Fix markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const WorkerTracking: React.FC<WorkerTrackingProps> = ({
  bookingId,
  workerLat,
  workerLng,
  customerLat,
  customerLng,
  workerName,
  workerPhone,
  estimatedArrival,
  status,
  onComplete,
}) => {
  const { calculateDistance } = useLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    setLoading(false);
    if (workerLat && workerLng) {
      const dist = calculateDistance(customerLat, customerLng, workerLat, workerLng);
      setDistance(dist);
    }
  }, [workerLat, workerLng, customerLat, customerLng, calculateDistance]);

  // Green marker for customer
  const customerMarker = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMTBiOTgxIi8+PC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Red marker for worker
  const workerMarker = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZWY0NDQ0Ii8+PC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  const centerLat = (customerLat + (workerLat || customerLat)) / 2;
  const centerLng = (customerLng + (workerLng || customerLng)) / 2;

  return (
    <div className="space-y-4">
      {/* Tracking Info Card */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Worker Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Worker Details</h4>
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{workerName}</div>
              <button className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
                <Phone size={16} />
                {workerPhone}
              </button>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <MessageCircle size={16} />
                Send Message
              </button>
            </div>
          </div>

          {/* Distance & ETA */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Distance & ETA</h4>
            <div className="space-y-2">
              {distance !== null && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-red-600" />
                  <div>
                    <div className="text-xs text-gray-600">Distance</div>
                    <div className="text-lg font-bold text-gray-900">{distance.toFixed(1)} km</div>
                  </div>
                </div>
              )}
              {estimatedArrival && (
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600">ETA</div>
                    <div className="text-lg font-bold text-gray-900">{estimatedArrival}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Job Status</h4>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                {status === 'assigned' && 'Worker Assigned'}
                {status === 'on_way' && 'On the Way'}
                {status === 'arrived' && 'Worker Arrived'}
                {status === 'in_progress' && 'Job In Progress'}
                {status === 'completed' && 'Job Completed'}
              </div>
              {status === 'on_way' && distance && distance < 2 && (
                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="text-xs">Worker arriving soon</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      {workerLat && workerLng && (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg h-96">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Customer Location */}
            <Marker position={[customerLat, customerLng]} icon={customerMarker}>
              <Popup>
                <div className="text-sm font-semibold">Your Location</div>
              </Popup>
            </Marker>

            {/* Worker Location */}
            <Marker position={[workerLat, workerLng]} icon={workerMarker}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{workerName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Distance: {distance?.toFixed(1)} km
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Route Line */}
            {workerLat && workerLng && (
              <Polyline
                positions={[
                  [customerLat, customerLng],
                  [workerLat, workerLng],
                ]}
                color="rgb(239, 68, 68)"
                weight={2}
                opacity={0.5}
                dashArray="5, 5"
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default WorkerTracking;
