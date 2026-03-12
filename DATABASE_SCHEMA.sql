-- Red Face Home Services - Real-time Notification, Location, and WhatsApp Integration Schema

-- ============================================
-- PROFILES TABLE (User profiles for customers and workers)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'worker', 'admin'
  avatar_url TEXT,
  bio TEXT,
  verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
  rating DECIMAL(3, 2) DEFAULT 0, -- Average rating 0-5
  total_jobs INT DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_verification_status_idx ON profiles(verification_status);

-- ============================================
-- BOOKINGS TABLE (Base table for all booking operations)
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  customer_notes TEXT,
  total_price DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  estimated_arrival TIMESTAMP,
  job_started_at TIMESTAMP,
  job_completed_at TIMESTAMP,
  worker_location_lat DECIMAL(10, 8),
  worker_location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX bookings_worker_id_idx ON bookings(worker_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_scheduled_date_idx ON bookings(scheduled_date);
CREATE INDEX bookings_city_idx ON bookings(city);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'worker_assigned', 'job_started', 'job_completed', 'payment_received', 'cancelled', 'payment_failed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  data JSONB, -- Store additional data like worker_photo, worker_name, verification_status, etc.
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT notification_type CHECK (type IN ('worker_assigned', 'job_started', 'job_completed', 'payment_received', 'cancelled', 'payment_failed', 'pre_arrival', 'review_request'))
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_booking_id_idx ON notifications(booking_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_read_idx ON notifications(read);

-- ============================================
-- WORKER LOCATIONS TABLE
-- ============================================
CREATE TABLE worker_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  last_updated TIMESTAMP DEFAULT now(),
  UNIQUE(worker_id)
);

CREATE INDEX worker_locations_worker_id_idx ON worker_locations(worker_id);
CREATE INDEX worker_locations_city_idx ON worker_locations(city);

-- ============================================
-- SERVICE AREAS / COVERAGE ZONES
-- ============================================
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  postal_codes TEXT[], -- Array of postal codes covered
  radius_km DECIMAL(5, 2), -- Coverage radius in kilometers
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX service_areas_worker_id_idx ON service_areas(worker_id);
CREATE INDEX service_areas_city_idx ON service_areas(city);

-- ============================================
-- WHATSAPP MESSAGE TEMPLATES
-- ============================================
CREATE TABLE whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE, -- 'booking_confirmation', 'worker_assigned', 'pre_arrival', 'job_completed', 'payment_link', 'cancellation_warning', 'review_request'
  template_name TEXT NOT NULL,
  message_body TEXT NOT NULL, -- Template with placeholders like {{customer_name}}, {{worker_name}}, etc.
  variables JSONB, -- { "customer_name": "", "worker_name": "", "arrival_time": "", etc. }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT template_key_check CHECK (template_key IN ('booking_confirmation', 'worker_assigned', 'pre_arrival', 'job_completed', 'payment_link', 'cancellation_warning', 'review_request'))
);

-- ============================================
-- WHATSAPP MESSAGE LOG
-- ============================================
CREATE TABLE whatsapp_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  recipient_type TEXT NOT NULL, -- 'customer' or 'worker'
  template_key TEXT NOT NULL REFERENCES whatsapp_message_templates(template_key),
  message_body TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  error_message TEXT,
  external_message_id TEXT, -- ID from WhatsApp API
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX whatsapp_message_log_booking_id_idx ON whatsapp_message_log(booking_id);
CREATE INDEX whatsapp_message_log_status_idx ON whatsapp_message_log(status);

-- ============================================
-- BOOKING UPDATES TABLE (for real-time tracking)
-- ============================================
CREATE TABLE booking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL, -- 'status_changed', 'location_updated', 'eta_updated'
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX booking_updates_booking_id_idx ON booking_updates(booking_id);
CREATE INDEX booking_updates_created_at_idx ON booking_updates(created_at DESC);

-- ============================================
-- ENABLE REALTIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE worker_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_message_log;

-- ============================================
-- INSERTION OF DEFAULT WHATSAPP TEMPLATES
-- ============================================
INSERT INTO whatsapp_message_templates (template_key, template_name, message_body, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 
  'Hi {{customer_name}}, your booking has been confirmed!✓\n\nService: {{service_name}}\nDate: {{scheduled_date}}\nTime: {{scheduled_time}}\nAddress: {{address}}\n\nTotal: R{{total_price}}\n\nWe''ll notify you when a worker is assigned.', 
  '{"customer_name": "", "service_name": "", "scheduled_date": "", "scheduled_time": "", "address": "", "total_price": ""}'),
('worker_assigned', 'Worker Assigned',
  'Great news, {{customer_name}}! 👷\n\nWorker assigned: {{worker_name}}\n⭐ Rating: {{worker_rating}}\n✓ Verification Status: {{verification_status}}\n📱 Phone: {{worker_phone}}\n\nEstimated arrival: {{estimated_arrival}}\n📍 Address: {{address}}\n\nView details in the Red Face app.',
  '{"customer_name": "", "worker_name": "", "worker_rating": "", "verification_status": "", "worker_phone": "", "estimated_arrival": "", "address": ""}'),
('pre_arrival', 'Pre-Arrival Notification',
  'Hi {{customer_name}}, {{worker_name}} will arrive in about 30 minutes! ⏰\n\n📍 Location: {{current_address}}\n⭐ Rating: {{worker_rating}}\n✓ Verified Worker\n\nPlease ensure access to your property.',
  '{"customer_name": "", "worker_name": "", "current_address": "", "worker_rating": ""}'),
('job_completed', 'Job Completed',
  'All done! {{worker_name}} has completed your {{service_name}} service. ✓\n\nTotal: R{{total_price}}\n\n👉 Pay Now: {{payment_link}}\n\nThank you for using Red Face!',
  '{"worker_name": "", "service_name": "", "total_price": "", "payment_link": ""}'),
('payment_link', 'Payment Link',
  'Hi {{customer_name}}, your payment for {{service_name}} is ready.\n\nAmount: R{{total_price}}\n\n👉 Pay Securely: {{payment_link}}\n\nInvoice: {{invoice_number}}',
  '{"customer_name": "", "service_name": "", "total_price": "", "payment_link": "", "invoice_number": ""}'),
('cancellation_warning', 'Cancellation Fee Warning',
  'Hi {{customer_name}}, please note:\n\nCancelling {{service_name}} now will charge a fee of R{{cancellation_fee}} ({{cancellation_percentage}}% of booking).\n\nThis fee applies if cancelled within {{cancellation_hours}} hours of service start.',
  '{"customer_name": "", "service_name": "", "cancellation_fee": "", "cancellation_percentage": "", "cancellation_hours": ""}'),
('review_request', 'Review Request',
  'How was your {{service_name}} with {{worker_name}}? ⭐\n\nYour feedback helps us improve!\n\n👉 Leave a Review: {{review_link}}\n\nThank you for your service!',
  '{"service_name": "", "worker_name": "", "review_link": ""}');

-- Enable real-time subscriptions for the bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
