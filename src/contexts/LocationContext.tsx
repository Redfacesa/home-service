import React, { createContext, useContext, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface WorkerLocation {
  id: string;
  worker_id: string;
  latitude: number;
  longitude: number;
  city: string;
  address: string;
  last_updated: string;
}

export interface ServiceArea {
  id: string;
  worker_id: string;
  city: string;
  postal_codes: string[];
  radius_km: number;
  is_active: boolean;
}

export interface MatchedWorker {
  worker_id: string;
  name: string;
  rating: number;
  distance_km: number;
  verification_status: string;
  availability: boolean;
  hourly_rate: number;
  services: string[];
  photo: string;
  match_score: number;
}

interface LocationContextType {
  workerLocations: WorkerLocation[];
  serviceAreas: ServiceArea[];
  updateWorkerLocation: (latitude: number, longitude: number, city: string, address: string) => Promise<void>;
  updateServiceArea: (city: string, postalCodes: string[], radiusKm: number) => Promise<void>;
  findNearestWorkers: (customerLat: number, customerLng: number, serviceType: string, maxDistance?: number) => Promise<MatchedWorker[]>;
  getAllWorkerLocations: () => Promise<WorkerLocation[]>;
  getWorkerServiceAreas: (workerId: string) => Promise<ServiceArea[]>;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [workerLocations, setWorkerLocations] = useState<WorkerLocation[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);

  // Haversine formula to calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Update worker's current location
  const updateWorkerLocation = useCallback(
    async (latitude: number, longitude: number, city: string, address: string) => {
      if (!user) return;

      try {
        const { error } = await supabase.from('worker_locations').upsert(
          {
            worker_id: user.id,
            latitude,
            longitude,
            city,
            address,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'worker_id' }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating worker location:', err);
      }
    },
    [user]
  );

  // Update worker's service areas
  const updateServiceArea = useCallback(
    async (city: string, postalCodes: string[], radiusKm: number) => {
      if (!user) return;

      try {
        const { error } = await supabase.from('service_areas').upsert(
          {
            worker_id: user.id,
            city,
            postal_codes: postalCodes,
            radius_km: radiusKm,
            is_active: true,
          },
          { onConflict: 'worker_id,city' }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating service area:', err);
      }
    },
    [user]
  );

  // Get all worker locations
  const getAllWorkerLocations = useCallback(async (): Promise<WorkerLocation[]> => {
    try {
      const { data, error } = await supabase
        .from('worker_locations')
        .select('*')
        .eq('1=1', true);

      if (error) throw error;
      return (data as WorkerLocation[]) || [];
    } catch (err) {
      console.error('Error fetching worker locations:', err);
      return [];
    }
  }, []);

  // Get service areas for a specific worker
  const getWorkerServiceAreas = useCallback(async (workerId: string): Promise<ServiceArea[]> => {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .eq('worker_id', workerId)
        .eq('is_active', true);

      if (error) throw error;
      return (data as ServiceArea[]) || [];
    } catch (err) {
      console.error('Error fetching service areas:', err);
      return [];
    }
  }, []);

  // Find nearest workers based on location and service type
  const findNearestWorkers = useCallback(
    async (customerLat: number, customerLng: number, serviceType: string, maxDistance: number = 50): Promise<MatchedWorker[]> => {
      try {
        // Get all worker locations
        const { data: locations, error: locError } = await supabase
          .from('worker_locations')
          .select(
            `
            id,
            worker_id,
            latitude,
            longitude,
            city,
            profiles:profiles(id, full_name, avatar_url, verification_status),
            workers:profiles!profiles_id_fkey(hourly_rate, services, available)
          `
          )
          .limit(100);

        if (locError) throw locError;

        // Get profiles with ratings and availability
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
            id,
            full_name,
            avatar_url,
            verification_status,
            hourly_rate,
            services,
            available
          `
          )
          .eq('role', 'worker');

        if (profileError) throw profileError;

        if (!profiles) return [];

        // Calculate distances and create match scores
        const matchedWorkers: MatchedWorker[] = profiles
          .map((profile: any) => {
            const location = locations?.find((l: any) => l.worker_id === profile.id);
            
            if (!location) return null;

            const distance = calculateDistance(
              customerLat,
              customerLng,
              location.latitude,
              location.longitude
            );

            // Check if within max distance
            if (distance > maxDistance) return null;

            // Check if worker provides this service
            const services = profile.services || [];
            if (!services.includes(serviceType)) return null;

            // Calculate match score (0-100)
            // Distance score: closer = higher (100 at 0km, 0 at maxDistance)
            const distanceScore = Math.max(0, ((maxDistance - distance) / maxDistance) * 40);
            
            // Availability score
            const availabilityScore = profile.available ? 30 : 0;
            
            // Verification score
            const verificationScore = profile.verification_status === 'verified' ? 20 : 10;
            
            // Rating score (normalized to 0-10 assuming 0-5 star rating)
            const ratingScore = Math.min((profile.rating || 3.5) * 2, 10);

            const matchScore = distanceScore + availabilityScore + verificationScore + ratingScore;

            return {
              worker_id: profile.id,
              name: profile.full_name,
              rating: profile.rating || 3.5,
              distance_km: Math.round(distance * 10) / 10,
              verification_status: profile.verification_status,
              availability: profile.available,
              hourly_rate: profile.hourly_rate || 150,
              services: services,
              photo: profile.avatar_url || '/default-worker.jpg',
              match_score: Math.round(matchScore),
            };
          })
          .filter((worker): worker is MatchedWorker => worker !== null)
          .sort((a, b) => b.match_score - a.match_score);

        return matchedWorkers;
      } catch (err) {
        console.error('Error finding nearest workers:', err);
        return [];
      }
    },
    [calculateDistance]
  );

  return (
    <LocationContext.Provider
      value={{
        workerLocations,
        serviceAreas,
        updateWorkerLocation,
        updateServiceArea,
        findNearestWorkers,
        getAllWorkerLocations,
        getWorkerServiceAreas,
        calculateDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
