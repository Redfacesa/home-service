# Quick Integration Guide
## Red Face Home Services - Feature Integration

This guide shows how to integrate the new features into your existing pages.

---

## 1. UPDATE WORKERS PAGE

**File:** `src/pages/WorkersPage.tsx`

Add map view to display workers:

```typescript
import React, { useState } from 'react';
import WorkerMap from '@/components/WorkerMap';
import { SOUTH_AFRICAN_CITIES } from '@/lib/constants';

const WorkersPage = ({ onNavigate }: any) => {
  const [selectedCity, setSelectedCity] = useState('Johannesburg');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Find a Worker</h1>
          <p className="text-gray-600">View available workers in your area</p>
        </div>

        {/* City Selection */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {SOUTH_AFRICAN_CITIES.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCity === city
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Worker Map */}
        <WorkerMap
          selectedCity={selectedCity}
          onWorkerSelect={(workerId) => {
            // Handle worker selection - navigate to booking or view profile
            onNavigate('booking', { preSelectedWorkerId: workerId });
          }}
          zoom={11}
          height="600px"
        />
      </div>
    </div>
  );
};

export default WorkersPage;
```

---

## 2. UPDATE BOOKING FLOW

**File:** `src/pages/BookingFlow.tsx`

Add address autocomplete:

```typescript
import React, { useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const BookingFlow = ({ preSelectedService, onNavigate, onOpenAuth }: any) => {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

  return (
    <div>
      {/* ... existing step components ... */}

      {step === 2 && ( // Address step
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Service Address</h2>
          <p className="text-gray-600 mb-6">Where should the worker go?</p>

          {/* Address Autocomplete */}
          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            onCityChange={setCity}
            onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })}
            placeholder="Enter your address (e.g., 123 Main Street, Sandton)"
            className="mb-4"
          />

          {/* Continue Button */}
          <button
            onClick={() => canProceed && setStep(step + 1)}
            disabled={!address || !city}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
```

---

## 3. ADD WORKER TRACKING TO CUSTOMER DASHBOARD

**File:** `src/pages/CustomerDashboard.tsx`

Add real-time worker tracking:

```typescript
import React, { useState, useEffect } from 'react';
import WorkerTracking from '@/components/WorkerTracking';
import { subscribeToWorkerLocation } from '@/lib/worker-tracking';

const CustomerDashboard = ({ onNavigate }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [workerLocation, setWorkerLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (selectedBooking?.worker_id && selectedBooking?.status === 'assigned') {
      // Subscribe to worker location updates
      const subscription = subscribeToWorkerLocation(
        selectedBooking.worker_id,
        (location) => {
          setWorkerLocation({
            lat: location.latitude,
            lng: location.longitude,
          });
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [selectedBooking]);

  return (
    <div>
      {/* ... existing dashboard tabs ... */}

      {selectedBooking && selectedBooking.status === 'assigned' && (
        <div className="mb-6">
          <WorkerTracking
            bookingId={selectedBooking.id}
            workerLat={workerLocation.lat}
            workerLng={workerLocation.lng}
            customerLat={-26.2023} // From booking address
            customerLng={28.0436}
            workerName={selectedBooking.worker?.full_name}
            workerPhone={selectedBooking.worker?.phone}
            estimatedArrival={selectedBooking.estimated_arrival}
            status={selectedBooking.status}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
```

---

## 4. ADD SERVICE AREA MANAGEMENT TO WORKER DASHBOARD

**File:** `src/pages/WorkerDashboard.tsx`

Add service area configuration:

```typescript
import React, { useState } from 'react';
import ServiceAreaManagement from '@/components/ServiceAreaManagement';

const WorkerDashboard = ({ onNavigate }: any) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('service-areas')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'service-areas'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600'
            }`}
          >
            Service Areas
          </button>
          {/* ... other tabs ... */}
        </div>

        {/* Content */}
        {activeTab === 'service-areas' && <ServiceAreaManagement />}
        {/* ... other tab content ... */}
      </div>
    </div>
  );
};

export default WorkerDashboard;
```

---

## 5. TRIGGER NOTIFICATIONS AFTER BOOKING

**File:** `src/pages/BookingFlow.tsx` or wherever booking is created

```typescript
import { triggerBookingNotification } from '@/lib/booking-notifications';

const handleConfirmBooking = async () => {
  try {
    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;

    // Get customer details
    const { data: customer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Trigger notifications
    await triggerBookingNotification({
      event: 'worker_assigned', // or other events
      booking_id: booking.id,
      details: {
        estimated_arrival: '30 mins',
        // ... other details
      },
      customer_phone: customer.phone,
      customer_email: customer.email,
    });

    // Show success
    setBooked(true);
  } catch (err) {
    console.error('Booking error:', err);
  }
};
```

---

## 6. UPDATE BOOKING STATUS IN REAL-TIME

**File:** When updating bookings (worker app or admin dashboard)

```typescript
import { updateBookingTracking } from '@/lib/worker-tracking';

// When worker starts job
const handleStartJob = async (bookingId: string) => {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'in_progress',
      job_started_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (!error) {
    // Trigger notification
    await triggerBookingNotification({
      event: 'job_started',
      booking_id: bookingId,
      details: {},
      // ...
    });
  }
};

// When worker completes job
const handleCompleteJob = async (bookingId: string) => {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      job_completed_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (!error) {
    await triggerBookingNotification({
      event: 'job_completed',
      booking_id: bookingId,
      details: {},
      // ...
    });
  }
};
```

---

## 7. UPDATE CONSTANTS (if not already present)

**File:** `src/lib/constants.ts`

Add South African cities:

```typescript
export const SOUTH_AFRICAN_CITIES = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Bloemfontein',
  'Port Elizabeth',
];

// Add to service categories if needed:
export const SERVICE_CATEGORIES = [
  // ... existing services
  {
    name: 'Cleaning',
    description: 'House and office cleaning',
    icon: '🧹',
    price: 'R300 - R800',
    duration: '2-4 hours',
    rating: 4.8,
    workers: 150,
  },
  // ... more services
];
```

---

## 8. ENABLE REAL-TIME IN DATABASE

Run in Supabase SQL Editor:

```sql
-- Enable real-time for notification updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable real-time for location updates
ALTER PUBLICATION supabase_realtime ADD TABLE worker_locations;

-- Enable real-time for booking updates
ALTER PUBLICATION supabase_realtime ADD TABLE booking_updates;

-- Verify it's enabled
SELECT * FROM pg_publication;
```

---

## 9. TEST LOCALLY

From terminal:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
open http://localhost:5173

# Test notifications:
# - Login as customer
# - Create booking
# - Should see notification bell update
# - Click to view notifications

# Test map:
# - Navigate to Workers page
# - Should see Leaflet map with markers
# - Try selecting city

# Test address autocomplete:
# - Book service
# - In address step, type "sandton"
# - Should see suggestions
```

---

## 10. DEPLOY EDGE FUNCTIONS

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref <your-project-id>

# Deploy functions
supabase functions deploy auto-match-worker --no-verify-jwt
supabase functions deploy whatsapp-send --no-verify-jwt
supabase functions deploy send-email-notification --no-verify-jwt

# Check logs
supabase functions list
```

---

## 11. ENVIRONMENT VARIABLES

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WhatsApp (optional for testing)
VITE_WHATSAPP_API_KEY=your-meta-key
VITE_WHATSAPP_PHONE_ID=your-phone-id

# Email (optional for testing)
VITE_RESEND_API_KEY=your-resend-key
```

---

## 12. COMMON IMPLEMENTATION CHECKLIST

- [ ] Run DATABASE_SCHEMA.sql in Supabase
- [ ] Update App.tsx providers
- [ ] Update Header.tsx with NotificationBell
- [ ] Install dependencies: `npm install`
- [ ] Update WorkersPage with WorkerMap
- [ ] Update BookingFlow with AddressAutocomplete
- [ ] Update CustomerDashboard with WorkerTracking
- [ ] Update WorkerDashboard with ServiceAreaManagement
- [ ] Add booking event handlers
- [ ] Deploy edge functions
- [ ] Set environment variables
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy to production

---

## 💡 TIPS & TRICKS

**Disable features temporarily:**
```typescript
// In any component
const NOTIFICATIONS_ENABLED = true;
const MAPS_ENABLED = true;
const WHATSAPP_ENABLED = true;

{NOTIFICATIONS_ENABLED && <NotificationBell />}
```

**Test with mock data:**
```typescript
import { MOCK_WORKERS } from '@/lib/constants';

// Pre-populate test bookings for development
const testBooking = {
  worker: MOCK_WORKERS[0],
  customer_id: 'test-user',
  // ...
};
```

**Debug real-time:**
```typescript
// Add to any component to see real-time events
const channel = supabase.channel('debug');
channel.on('*', { event: '*', schema: '*', table: '*' }, 
  (payload) => console.log('RT Update:', payload)
).subscribe();
```

---

## 🆘 TROUBLESHOOTING

**Notifications not showing?**
- Check NotificationProvider in App.tsx
- Verify user is logged in in
- Check browser DevTools → Network → WebSocket
- Ensure supabase_realtime publication is enabled

**Map not loading?**
- Verify Leaflet CSS is imported in component
- Check browser console for errors
- Ensure coordinates are valid numbers
- Check map container has height CSS

**WhatsApp not sending?**
- Verify WHATSAPP_API_KEY is set
- Check phone number format (should be +27...)
- Verify template exists in database
- Check edge function logs in Supabase

**Address autocomplete not working?**
- Ensure AddressAutocomplete is imported correctly
- Check component accepts value/onChange props
- Verify South African city coordinates are correct

---

## 📞 NEED HELP?

Refer to these detailed guides:
- `IMPLEMENTATION_GUIDE.md` - Complete implementation details
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- Code comments in components - Inline documentation
- TypeScript interfaces - Parameter definitions

---

**Last Updated:** March 11, 2026
**Status:** ✅ READY FOR INTEGRATION
