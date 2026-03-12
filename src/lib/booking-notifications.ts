// Booking notification utilities
import { supabase } from './supabase';
import { useNotifications } from '@/contexts/NotificationContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

export interface NotificationPayload {
  user_id: string;
  booking_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface BookingNotificationEvent {
  event: 'worker_assigned' | 'job_started' | 'job_completed' | 'payment_received' | 'cancelled' | 'payment_failed';
  booking_id: string;
  details: Record<string, any>;
  customer_phone?: string;
  worker_phone?: string;
  customer_email?: string;
  worker_email?: string;
}

/**
 * Trigger all notifications for a booking event
 * Sends: in-app notification, WhatsApp message, and email
 */
export const triggerBookingNotification = async (event: BookingNotificationEvent) => {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', event.booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return;
    }

    // Get customer and worker details
    const { data: customer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', booking.customer_id)
      .single();

    const { data: worker } = booking.worker_id
      ? await supabase.from('profiles').select('*').eq('id', booking.worker_id).single()
      : { data: null };

    // Handle different notification types
    switch (event.event) {
      case 'worker_assigned':
        await handleWorkerAssigned(booking, customer, worker, event.details);
        break;

      case 'job_started':
        await handleJobStarted(booking, customer, worker, event.details);
        break;

      case 'job_completed':
        await handleJobCompleted(booking, customer, worker, event.details);
        break;

      case 'payment_received':
        await handlePaymentReceived(booking, customer, event.details);
        break;

      case 'cancelled':
        await handleCancellation(booking, customer, event.details);
        break;

      default:
        console.warn(`Unknown notification event: ${event.event}`);
    }
  } catch (err) {
    console.error('Error triggering notification:', err);
  }
};

/**
 * Handle worker assigned event
 */
const handleWorkerAssigned = async (booking: any, customer: any, worker: any, details: any) => {
  const title = 'Worker Assigned';
  const message = `${worker.full_name} has been assigned to your booking. ⭐ ${worker.rating}`;

  // 1. In-app notification
  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    booking_id: booking.id,
    type: 'worker_assigned',
    title,
    message,
    data: {
      worker_name: worker.full_name,
      worker_photo: worker.avatar_url,
      worker_rating: worker.rating,
      verification_status: worker.verification_status,
      worker_phone: worker.phone,
      estimated_arrival: details.estimated_arrival,
      address: booking.address,
    },
  });

  // 2. WhatsApp message
  if (customer.phone) {
    await callEdgeFunction('send-whatsapp', {
      phone: customer.phone,
      template_key: 'worker_assigned',
      booking_id: booking.id,
      data: {
        customer_name: customer.full_name,
        worker_name: worker.full_name,
        worker_rating: worker.rating.toFixed(1),
        verification_status: worker.verification_status,
        worker_phone: worker.phone,
        estimated_arrival: details.estimated_arrival,
        address: booking.address,
      },
    });
  }

  // 3. Email notification
  if (customer.email) {
    await callEdgeFunction('send-email-notification', {
      to: customer.email,
      type: 'worker_assigned',
      recipient_name: customer.full_name,
      booking_details: {
        booking_id: booking.id,
        worker_name: worker.full_name,
        worker_photo: worker.avatar_url,
        worker_rating: worker.rating,
        verification_status: worker.verification_status,
        worker_phone: worker.phone,
        estimated_arrival: details.estimated_arrival,
      },
    });
  }
};

/**
 * Handle job started event
 */
const handleJobStarted = async (booking: any, customer: any, worker: any, details: any) => {
  // In-app notification
  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    booking_id: booking.id,
    type: 'job_started',
    title: 'Job Started',
    message: `${worker.full_name} has started your ${booking.service} service.`,
    data: {
      worker_name: worker.full_name,
      service: booking.service,
      started_at: new Date().toISOString(),
    },
  });

  // Update booking status
  await supabase.from('bookings').update({ status: 'in_progress', job_started_at: new Date().toISOString() }).eq('id', booking.id);
};

/**
 * Handle job completed event
 */
const handleJobCompleted = async (booking: any, customer: any, worker: any, details: any) => {
  const title = 'Job Completed';
  const message = `${worker.full_name} has completed your service. Please review and pay if needed.`;

  // 1. In-app notification
  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    booking_id: booking.id,
    type: 'job_completed',
    title,
    message,
    data: {
      worker_name: worker.full_name,
      service: booking.service,
      completed_at: new Date().toISOString(),
      payment_due: booking.total_price,
    },
  });

  // 2. WhatsApp message with payment link
  if (customer.phone) {
    const paymentLink = `https://redface.co.za/bookings/${booking.id}/pay`;
    await callEdgeFunction('send-whatsapp', {
      phone: customer.phone,
      template_key: 'job_completed',
      booking_id: booking.id,
      data: {
        worker_name: worker.full_name,
        service_name: booking.service,
        total_price: booking.total_price.toString(),
        payment_link: paymentLink,
      },
    });
  }

  // 3. Email notification
  if (customer.email) {
    await callEdgeFunction('send-email-notification', {
      to: customer.email,
      type: 'job_completed',
      recipient_name: customer.full_name,
      booking_details: {
        booking_id: booking.id,
        worker_name: worker.full_name,
        service_name: booking.service,
        completion_time: new Date().toLocaleString(),
      },
    });
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({ status: 'completed', job_completed_at: new Date().toISOString() })
    .eq('id', booking.id);

  // Schedule review request 1 hour after completion
  scheduleReviewRequest(booking.id, customer.phone || customer.email, 3600000);
};

/**
 * Handle payment received event
 */
const handlePaymentReceived = async (booking: any, customer: any, details: any) => {
  // In-app notification
  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    booking_id: booking.id,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Your payment of R${booking.total_price.toFixed(2)} has been received. Invoice: ${details.invoice_number}`,
    data: {
      amount: booking.total_price,
      invoice_number: details.invoice_number,
      payment_id: details.payment_id,
    },
  });

  // Email receipt
  if (customer.email) {
    await callEdgeFunction('send-email-notification', {
      to: customer.email,
      type: 'payment_receipt',
      recipient_name: customer.full_name,
      booking_details: {
        invoice_number: details.invoice_number,
        service_name: booking.service,
        service_amount: booking.worker_share,
        platform_fee: booking.platform_commission,
        total_amount: booking.total_price,
        payment_date: new Date().toLocaleDateString(),
      },
    });
  }

  // Update booking status
  await supabase.from('bookings').update({ status: 'paid', payment_status: 'paid' }).eq('id', booking.id);
};

/**
 * Handle cancellation event
 */
const handleCancellation = async (booking: any, customer: any, details: any) => {
  // In-app notification
  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    booking_id: booking.id,
    type: 'cancelled',
    title: 'Booking Cancelled',
    message: `Your booking has been cancelled. ${details.reason || ''}`,
    data: {
      reason: details.reason,
      cancellation_fee: details.cancellation_fee,
    },
  });

  // Update booking status
  await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancellation_fee: details.cancellation_fee })
    .eq('id', booking.id);
};

/**
 * Schedule a review request notification
 */
const scheduleReviewRequest = async (bookingId: string, contactInfo: string, delayMs: number) => {
  // In production, use a proper job scheduling service (e.g., Bull or Temporal)
  // For now, just log it
  setTimeout(async () => {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (booking) {
      const { data: customer } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', booking.customer_id)
        .single();

      const { data: worker } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', booking.worker_id)
        .single();

      if (customer && worker) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id,
          booking_id: booking.id,
          type: 'review_request',
          title: 'Leave A Review',
          message: `How was your experience with ${worker.full_name}? Your feedback helps us improve.`,
          data: {
            worker_name: worker.full_name,
            service: booking.service,
          },
        });

        // Send WhatsApp review request if phone available
        if (customer.phone) {
          await callEdgeFunction('send-whatsapp', {
            phone: customer.phone,
            template_key: 'review_request',
            booking_id: booking.id,
            data: {
              service_name: booking.service,
              worker_name: worker.full_name,
              review_link: `https://redface.co.za/bookings/${booking.id}/review`,
            },
          });
        }
      }
    }
  }, delayMs);
};

/**
 * Helper function to call edge functions
 */
const callEdgeFunction = async (functionName: string, payload: any) => {
  try {
    const session = await supabase.auth.getSession();
    const response = await fetch(`/.netlify/functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Error calling ${functionName}:`, err);
  }
};
