# Red Face Home Services - Implementation Guide
## Real-time Notifications, Location-Based Matching & WhatsApp Integration

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Setup](#database-setup)
3. [Notification System Implementation](#notification-system-implementation)
4. [Location-Based Worker Matching](#location-based-worker-matching)
5. [WhatsApp Integration](#whatsapp-integration)
6. [Email Notifications](#email-notifications)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [Deployment Instructions](#deployment-instructions)
9. [Testing Guide](#testing-guide)
10. [Environment Variables](#environment-variables)

---

## System Architecture Overview

### Components
1. **React Frontend** - Dashboard UI with notifications, maps, and tracking
2. **Supabase Database** - Real-time data persistence
3. **Edge Functions** - Serverless backend for notifications & matching
4. **WhatsApp Business API** - SMS/WhatsApp messaging
5. **Resend/SendGrid** - Email service
6. **Leaflet.js** - Map visualization

### Data Flow
```
Booking Created
    ↓
→ Auto-Match Edge Function
    ↓
→ Assign Worker + Create Notification
    ↓
→ In-app Notification + WhatsApp + Email
    ↓
→ Real-time subscription updates customer/worker
```

---

## Database Setup

### Step 1: Create Tables in Supabase

Run the SQL schema from `DATABASE_SCHEMA.sql`:

```bash
# In Supabase dashboard:
1. Go to SQL Editor
2. Paste contents of DATABASE_SCHEMA.sql
3. Run the query
```

**Tables created:**
- `notifications` - All user notifications
- `worker_locations` - Current worker GPS/coordinates
- `service_areas` - Worker coverage zones
- `whatsapp_message_templates` - Customizable message templates
- `whatsapp_message_log` - Message delivery tracking
- `booking_updates` - Real-time booking status changes

### Step 2: Extension Updates to bookings table

Run these migrations in Supabase:

```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS worker_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP,
ADD COLUMN IF NOT EXISTS job_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS job_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS worker_location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS worker_location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC;
```

---

## Notification System Implementation

### Step 1: Install Dependencies

```bash
npm install leaflet @types/leaflet react-leaflet date-fns
```

### Step 2: Update App.tsx

The App.tsx has been updated to include:
- `NotificationProvider` - Manages notifications context
- `LocationProvider` - Handles worker locations & matching
- `WhatsAppProvider` - Manages WhatsApp messages

### Step 3: Components Added

**NotificationBell.tsx**
- Located in header
- Shows unread count badge
- Dropdown with recent notifications
- Mark as read / delete functionality
- Real-time updates

**NotificationContext.tsx**
- Manages notification state
- Real-time subscriptions to notification changes
- Methods: markAsRead, markAllAsRead, deleteNotification

### Step 4: Use in Components

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

const MyComponent = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
};
```

---

## Location-Based Worker Matching

### Step 1: Components for Worker Tracking

**WorkerMap.tsx**
- Displays all workers on map
- Shows worker ratings
- Allows selecting workers
- Centered on South African cities
- Real-time marker updates

**AddressAutocomplete.tsx**
- Autocomplete for South African addresses
- Returns lat/lng coordinates
- Pre-populated with major cities & suburbs
- Used in booking flow

**ServiceAreaManagement.tsx**
- Worker dashboard component
- Set coverage radius (5-50 km)
- Select postal codes to serve
- Visual radius display on map
- Save to database

**WorkerTracking.tsx**
- Customer dashboard real-time tracking
- Shows worker location on map
- Displays distance & ETA
- Route visualization
- Contact worker features

### Step 2: Use in Pages

**Workers Page (Update existing):**
```typescript
import WorkerMap from '@/components/WorkerMap';

const WorkersPage = () => {
  const [selectedCity, setSelectedCity] = useState('Johannesburg');
  
  return (
    <div>
      <WorkerMap 
        selectedCity={selectedCity}
        onWorkerSelect={(workerId) => {
          // Handle worker selection
        }}
      />
    </div>
  );
};
```

**Worker Dashboard (New feature):**
```typescript
import ServiceAreaManagement from '@/components/ServiceAreaManagement';

const WorkerDashboard = () => {
  return <ServiceAreaManagement />;
};
```

**Customer Booking (Update AddressAutocomplete):**
```typescript
import AddressAutocomplete from '@/components/AddressAutocomplete';

const BookingFlow = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  
  return (
    <AddressAutocomplete
      value={address}
      onChange={setAddress}
      onCityChange={setCity}
      onCoordinatesChange={(lat, lng) => setCoords({ lat, lng })}
    />
  );
};
```

### Step 3: LocationContext Usage

```typescript
import { useLocation } from '@/contexts/LocationContext';

const MyComponent = () => {
  const { 
    updateWorkerLocation, 
    findNearestWorkers,
    calculateDistance 
  } = useLocation();
  
  // Update worker GPS location
  await updateWorkerLocation(
    -26.2023,  // latitude
    28.0436,   // longitude
    'Johannesburg',
    '123 Main Street'
  );
  
  // Find workers for a booking
  const workers = await findNearestWorkers(
    -26.19,     // customer lat
    28.03,      // customer lng
    'cleaning', // service type
    50          // max distance km
  );
};
```

---

## WhatsApp Integration

### Step 1: WhatsApp Business API Setup

1. Go to [Meta Business Dashboard](https://business.facebook.com)
2. Create/select WhatsApp Business Account
3. Get Phone Number ID
4. Generate API Access Token
5. Save credentials to environment variables

### Step 2: Edge Functions

**Deploy whatsapp-send function:**

```bash
cd supabase/functions/whatsapp-send
supabase functions deploy whatsapp-send --no-verify-jwt
```

### Step 3: WhatsAppContext Usage

```typescript
import { useWhatsApp } from '@/contexts/WhatsAppContext';

const MyComponent = () => {
  const { sendBookingConfirmation, sendWorkerAssignment } = useWhatsApp();
  
  // Send booking confirmation
  await sendBookingConfirmation(
    bookingId,
    '+27123456789',
    {
      customer_name: 'John',
      service_name: 'Cleaning',
      scheduled_date: '2026-03-15',
      scheduled_time: '10:00',
      address: '123 Main Street',
      total_price: '360'
    }
  );
  
  // Send worker assignment
  await sendWorkerAssignment(
    bookingId,
    '+27123456789',
    {
      customer_name: 'John',
      worker_name: 'Jane',
      worker_rating: '4.8',
      verification_status: 'Verified ✓',
      worker_phone: '+27987654321',
      estimated_arrival: '30 mins',
      address: '123 Main Street'
    }
  );
};
```

### Step 4: Message Templates

Templates are customizable via database. Access via:

```typescript
const { getMessageTemplates } = useWhatsApp();
const templates = await getMessageTemplates();
```

**Available Templates:**
1. `booking_confirmation` - Booking details sent to customer
2. `worker_assigned` - Worker details with photo & rating
3. `pre_arrival` - Worker arriving in 30 minutes
4. `job_completed` - Job done, payment link included
5. `payment_link` - Payment reminder with secure link
6. `cancellation_warning` - Fee warning before cancellation
7. `review_request` - Review request 1 hour after completion

---

## Email Notifications

### Step 1: Setup Resend.com

1. Sign up at [Resend.com](https://resend.com)
2. Get API key
3. Verify sender domain
4. Add to environment variables

### Step 2: Deploy Email Function

```bash
cd supabase/functions/send-email-notification
supabase functions deploy send-email-notification --no-verify-jwt
```

### Step 3: Email Templates

The email function includes HTML templates for:
- Booking confirmations
- Worker assignments
- Payment receipts
- Job completion notifications

---

## Real-time Subscriptions

### How It Works

1. **Frontend subscribes** to notification changes:
```typescript
// In NotificationContext
supabase
  .channel(`notifications:user_id=eq.${user.id}`)
  .on('postgres_changes', { ... }, (payload) => {
    // Handle insert/update/delete
  })
  .subscribe();
```

2. **Backend triggers** changes via edge functions
3. **Frontend receives** updates instantly
4. **UI updates** without page refresh

### Enable Realtime

Add these lines to Supabase SQL to enable realtime for tables:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE worker_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_updates;
```

---

## Edge Functions

### 1. Auto-Match Worker

**File:** `supabase/functions/auto-match-worker/index.ts`

**Deploy:**
```bash
supabase functions deploy auto-match-worker --no-verify-jwt
```

**Trigger after booking creation:**
```typescript
import { triggerBookingNotification } from '@/lib/booking-notifications';

// When booking created
await triggerBookingNotification({
  event: 'worker_assigned',
  booking_id: newBookingId,
  details: { estimated_arrival: '30 mins' },
  customer_phone: customerPhone,
  customer_email: customerEmail
});
```

**Scoring Algorithm:**
- Distance (40 pts) - Closer = higher
- Availability (30 pts) - Currently available
- Verification (20 pts) - Verified status
- Rating (10 pts) - Customer satisfaction

### 2. WhatsApp Send

**File:** `supabase/functions/whatsapp-send/index.ts`

Uses Meta WhatsApp Business API to send messages.

### 3. Email Notification

**File:** `supabase/functions/send-email-notification/index.ts`

Sends HTML emails via Resend API.

---

## Deployment Instructions

### Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <project-id>
```

### Step 1: Deploy Database Schema

```bash
# Create migration
supabase migration new create_notification_tables

# (Paste schema from DATABASE_SCHEMA.sql)

# Push to production
supabase db push
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy auto-match-worker --no-verify-jwt
supabase functions deploy whatsapp-send --no-verify-jwt
supabase functions deploy send-email-notification --no-verify-jwt
```

### Step 3: Update Environment Variables

Set in Supabase project settings:
- `WHATSAPP_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`
- `RESEND_API_KEY`

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Build & Deploy Frontend

```bash
npm run build
# Deploy to your hosting (Netlify, Vercel, etc.)
```

---

## Testing Guide

### 1. Test Notifications

```typescript
// In browser console
import { supabase } from '@/lib/supabase';

// Create test notification
const { data } = await supabase
  .from('notifications')
  .insert({
    user_id: 'your-user-id',
    type: 'worker_assigned',
    title: 'Test Notification',
    message: 'This is a test',
    read: false,
    data: { test: true }
  })
  .select();
```

### 2. Test Location Matching

```typescript
import { useLocation } from '@/contexts/LocationContext';

const { findNearestWorkers } = useLocation();

// Find workers in Johannesburg
const workers = await findNearestWorkers(
  -26.2023,
  28.0436,
  'cleaning',
  50
);

console.log('Matched workers:', workers);
```

### 3. Test WhatsApp (Sandbox)

```typescript
import { useWhatsApp } from '@/contexts/WhatsAppContext';

const { sendBookingConfirmation } = useWhatsApp();

await sendBookingConfirmation(
  'test-booking-id',
  '+27123456789', // Your test number
  {
    customer_name: 'Test User',
    service_name: 'Cleaning',
    scheduled_date: '2026-03-15',
    scheduled_time: '10:00',
    address: '123 Test Street',
    total_price: '300'
  }
);
```

### 4. Monitor Real-time Updates

Open DevTools and check Network tab for WebSocket connections to Supabase realtime.

---

## Environment Variables

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions
VITE_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1

# WhatsApp
WHATSAPP_API_KEY=your-meta-api-key
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Email
RESEND_API_KEY=your-resend-api-key

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## Troubleshooting

### Notifications not appearing?
1. Check user is logged in
2. Verify notification table has rows
3. Check browser console for errors
4. Ensure real-time is enabled on table

### WhatsApp messages not sending?
1. Verify API key is correct
2. Check phone number format (+27...)
3. Verify template exists in database
4. Check edge function logs in Supabase dashboard

### Location tracking not working?
1. Ensure worker_id is set on booking
2. Check browser geolocation permissions
3. Verify coordinates are being sent to database
4. Check real-time subscriptions active

### Map not displaying?
1. Verify Leaflet CSS is imported
2. Check map container has valid height
3. Ensure coordinates are valid
4. Check browser console for Leaflet errors

---

## Performance Optimization

### 1. Lazy Load Components
```typescript
const WorkerMap = lazy(() => import('./WorkerMap'));
```

### 2. Pagination for Notifications
```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .limit(20)
  .range((page - 1) * 20, page * 20 - 1);
```

### 3. Database Indexes
Already created in schema:
- notifications(user_id)
- notifications(created_at DESC)
- notifications(read)
- worker_locations(worker_id)
- worker_locations(city)

---

## Next Steps

1. **Test locally** with sample data
2. **Configure WhatsApp** business account
3. **Set up Resend** for emails
4. **Deploy to production**
5. **Monitor logs** for issues
6. **Gather user feedback** on UX

---

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Leaflet JS Docs](https://leafletjs.com)
- [Meta WhatsApp API](https://developers.facebook.com/docs/whatsapp)
- [Resend Email API](https://resend.com/docs)

---

## License

This implementation is for Red Face Home Services. All rights reserved.
