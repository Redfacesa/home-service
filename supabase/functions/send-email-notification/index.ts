// Supabase Edge Function: Email Notification Sender
// Deploy to: https://your-project.supabase.co/functions/v1/send-email-notification
// Environment variables needed: RESEND_API_KEY or SendGrid API key

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

interface SendEmailRequest {
  to: string;
  type: "booking_confirmation" | "worker_assigned" | "payment_receipt" | "job_completed";
  booking_details: Record<string, any>;
  recipient_name: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: SendEmailRequest = await req.json() as SendEmailRequest;
    const { to, type, booking_details, recipient_name } = payload;

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not configured");
    }

    // Generate email content based on type
    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "booking_confirmation":
        subject = "Booking Confirmation - Red Face Home Services";
        htmlContent = generateBookingConfirmationEmail(booking_details, recipient_name);
        break;

      case "worker_assigned":
        subject = "Worker Assigned to Your Booking - Red Face";
        htmlContent = generateWorkerAssignmentEmail(booking_details, recipient_name);
        break;

      case "payment_receipt":
        subject = "Payment Receipt - Red Face Home Services";
        htmlContent = generatePaymentReceiptEmail(booking_details, recipient_name);
        break;

      case "job_completed":
        subject = "Job Completed - Red Face Home Services";
        htmlContent = generateJobCompletedEmail(booking_details, recipient_name);
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Red Face Home Services <noreply@redface.co.za>",
        to: to,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const result = await emailResponse.json() as Record<string, any>;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        email_id: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Email template generators
function generateBookingConfirmationEmail(details: any, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { font-weight: 600; color: #333; }
          .button { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your booking has been confirmed! We'll match you with the best available worker and notify you shortly.</p>
            
            <h3 style="color: #ef4444; margin-top: 30px;">Booking Details</h3>
            <div class="detail">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${details.service_name}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${details.scheduled_date}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${details.scheduled_time}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${details.address}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">R${details.total_price.toFixed(2)}</span>
            </div>

            <p style="margin-top: 30px; color: #666;">
              A worker will be assigned shortly. You'll receive a notification with their details, photo, and rating. 
              Our Red Face team is committed to providing quality service.
            </p>

            <a href="https://redface.co.za/bookings/${details.booking_id}" class="button">View Booking</a>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Questions? Contact our support team at support@redface.co.za or call 0800-REDFACE
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Red Face Home Services. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateWorkerAssignmentEmail(details: any, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .worker-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .worker-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
          .worker-photo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
          .worker-name { font-size: 20px; font-weight: bold; color: #333; }
          .worker-rating { color: #f59e0b; }
          .button { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👷 Worker Assigned</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! We've matched you with a qualified worker for your service.</p>

            <div class="worker-card">
              <div class="worker-header">
                ${details.worker_photo ? `<img src="${details.worker_photo}" class="worker-photo" />` : ''}
                <div>
                  <div class="worker-name">${details.worker_name}</div>
                  <div class="worker-rating">⭐ ${details.worker_rating} • ${details.verification_status}</div>
                </div>
              </div>
              <p><strong>Estimated Arrival:</strong> ${details.estimated_arrival}</p>
              <p><strong>Phone:</strong> ${details.worker_phone}</p>
            </div>

            <p style="margin-top: 20px; color: #666;">
              The worker will arrive at your location by the estimated time. You can track their location in real-time through the Red Face app.
            </p>

            <a href="https://redface.co.za/bookings/${details.booking_id}/track" class="button">Track Live</a>

            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              © 2026 Red Face Home Services. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generatePaymentReceiptEmail(details: any, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { display: flex; justify-content: space-between; padding: 15px 0; border-top: 2px solid #ef4444; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for your payment. Your receipt is below.</p>

            <h3 style="color: #ef4444; margin-top: 30px;">Invoice Details</h3>
            <div class="detail">
              <span>Invoice Number:</span>
              <span>${details.invoice_number}</span>
            </div>
            <div class="detail">
              <span>Service:</span>
              <span>${details.service_name}</span>
            </div>
            <div class="detail">
              <span>Date:</span>
              <span>${details.payment_date}</span>
            </div>
            <div class="detail">
              <span>Service Amount:</span>
              <span>R${details.service_amount.toFixed(2)}</span>
            </div>
            <div class="detail">
              <span>Platform Fee:</span>
              <span>R${details.platform_fee.toFixed(2)}</span>
            </div>
            <div class="total">
              <span>Total Paid:</span>
              <span>R${details.total_amount.toFixed(2)}</span>
            </div>

            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              © 2026 Red Face Home Services. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateJobCompletedEmail(details: any, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .button { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Job Completed</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>${details.worker_name} has completed your ${details.service_name} service! We hope you're satisfied with the work.</p>

            <h3 style="color: #ef4444; margin-top: 30px;">Service Summary</h3>
            <p><strong>${details.service_name}</strong><br>
            Completed: ${details.completion_time}</p>

            <p style="margin-top: 30px; color: #666;">
              We'd love to hear about your experience! Please leave a review to help other customers and support our workers.
            </p>

            <a href="https://redface.co.za/bookings/${details.booking_id}/review" class="button">Leave A Review</a>

            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              © 2026 Red Face Home Services. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
