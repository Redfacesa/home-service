// Supabase Edge Function: Auto-Matching Algorithm
// Deploy to: https://your-project.supabase.co/functions/v1/auto-match-worker
// Finds the best worker for a booking based on proximity, rating, availability, and verification

// @ts-ignore - Deno imports
// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
// @deno-types="https://esm.sh/@supabase/supabase-js@2.49.4"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface MatchRequest {
  booking_id: string;
  service_type: string;
  customer_lat: number;
  customer_lng: number;
  customer_city: string;
  max_distance_km?: number;
}

interface WorkerScore {
  worker_id: string;
  distance_km: number;
  match_score: number;
  distance_score: number;
  availability_score: number;
  verification_score: number;
  rating_score: number;
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: MatchRequest = await req.json() as MatchRequest;
    const { booking_id, service_type, customer_lat, customer_lng, customer_city, max_distance_km = 50 } = payload;

    if (!booking_id || !service_type || customer_lat === undefined || customer_lng === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all worker locations
    const { data: workerLocations, error: locError } = await supabase
      .from("worker_locations")
      .select("*")
      .eq("city", customer_city);

    if (locError) throw locError;

    if (!workerLocations || workerLocations.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No workers available in your area",
          matched_worker: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all active workers with their profiles
    const { data: workers, error: workerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "worker")
      .eq("available", true);

    if (workerError) throw workerError;

    if (!workers || workers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No available workers",
          matched_worker: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate match scores
    const scoredWorkers: WorkerScore[] = workers
      .map((worker: any) => {
        const location = workerLocations.find((l: any) => l.worker_id === worker.id);

        // If no location, skip worker
        if (!location) return null;

        // Calculate distance
        const distance = calculateDistance(
          customer_lat,
          customer_lng,
          location.latitude,
          location.longitude
        );

        // Check if within max distance
        if (distance > max_distance_km) return null;

        // Check if worker provides this service
        const services = worker.services || [];
        if (!services.includes(service_type)) return null;

        // Scoring system (0-100)
        // 1. Distance Score (0-40): Closer = higher
        const distanceScore = Math.max(0, ((max_distance_km - distance) / max_distance_km) * 40);

        // 2. Availability Score (0-30): Available workers get full points
        const availabilityScore = worker.available ? 30 : 0;

        // 3. Verification Score (0-20): Verified workers get more points
        const verificationScore =
          worker.verification_status === "verified"
            ? 20
            : worker.verification_status === "in_progress"
            ? 10
            : 5;

        // 4. Rating Score (0-10): Based on customer ratings (0-5 stars)
        const rating = worker.rating || 3.5;
        const ratingScore = Math.min((rating / 5) * 10, 10);

        // Total score
        const totalScore = distanceScore + availabilityScore + verificationScore + ratingScore;

        return {
          worker_id: worker.id,
          distance_km: Math.round(distance * 10) / 10,
          match_score: Math.round(totalScore),
          distance_score: Math.round(distanceScore),
          availability_score: availabilityScore,
          verification_score: verificationScore,
          rating_score: Math.round(ratingScore),
        };
      })
      .filter((w: WorkerScore | null): w is WorkerScore => w !== null)
      .sort((a: WorkerScore, b: WorkerScore) => b.match_score - a.match_score);

    if (scoredWorkers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No suitable workers found for this booking",
          matched_worker: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bestMatch = scoredWorkers[0];
    const topFiveMatches = scoredWorkers.slice(0, 5);

    // Get worker details for the best match
    const bestWorker = workers.find((w: any) => w.id === bestMatch.worker_id);

    // Update booking with assigned worker
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        worker_id: bestMatch.worker_id,
        status: "assigned",
        estimated_arrival: calculateEstimatedArrival(bestMatch.distance_km),
      })
      .eq("id", booking_id);

    if (updateError) throw updateError;

    // Create notification for customer
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("id", booking_id)
      .single();

    if (booking) {
      await supabase.from("notifications").insert({
        user_id: booking.customer_id,
        booking_id: booking_id,
        type: "worker_assigned",
        title: "Worker Assigned",
        message: `${bestWorker.full_name} has been assigned to your booking. ⭐ ${bestWorker.rating}`,
        data: {
          worker_name: bestWorker.full_name,
          worker_photo: bestWorker.avatar_url,
          worker_rating: bestWorker.rating,
          verification_status: bestWorker.verification_status,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Worker matched successfully",
        matched_worker: {
          worker_id: bestMatch.worker_id,
          name: bestWorker.full_name,
          phone: bestWorker.phone,
          rating: bestWorker.rating,
          verification_status: bestWorker.verification_status,
          avatar_url: bestWorker.avatar_url,
          distance_km: bestMatch.distance_km,
          match_score: bestMatch.match_score,
          estimated_arrival: calculateEstimatedArrival(bestMatch.distance_km),
        },
        alternative_matches: topFiveMatches.slice(1).map((m: any) => ({
          worker_id: m.worker_id,
          distance_km: m.distance_km,
          match_score: m.match_score,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-matching error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to calculate estimated arrival time
function calculateEstimatedArrival(distanceKm: number): string {
  // Assuming average speed of 40 km/h in urban areas
  const avgSpeed = 40;
  const timeInMinutes = Math.ceil((distanceKm / avgSpeed) * 60);

  if (timeInMinutes < 60) {
    return `${timeInMinutes} mins`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const mins = timeInMinutes % 60;
    return `${hours}h ${mins}m`;
  }
}
