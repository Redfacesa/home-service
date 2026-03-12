// Supabase Edge Function: WhatsApp Message Sender
// Deploy to: https://your-project.supabase.co/functions/v1/whatsapp-send
// Environment variables needed: WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID

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

interface SendMessageRequest {
  phone: string;
  message: string;
  booking_id: string;
  template_key: string;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: SendMessageRequest = await req.json() as SendMessageRequest;
    const { phone, message, booking_id, template_key } = payload;

    // Validate input
    if (!phone || !message || !booking_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, message, booking_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!whatsappApiKey || !whatsappPhoneId || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Format phone number (add 27 country code if South African)
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("27")) {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "27" + formattedPhone.substring(1);
      } else {
        formattedPhone = "27" + formattedPhone;
      }
    }

    // Send message via WhatsApp API (using Meta/WhatsApp Business API)
    const whatsappResponse = await fetch(
      `https://graph.instagram.com/v18.0/${whatsappPhoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    if (!whatsappResponse.ok) {
      const errorData = await whatsappResponse.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    const whatsappResult = await whatsappResponse.json() as Record<string, any>;
    const externalMessageId = whatsappResult.messages?.[0]?.id;

    // Update message log in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the message log entry
    const { data: messageLogs, error: fetchError } = await supabase
      .from("whatsapp_message_log")
      .select("*")
      .eq("booking_id", booking_id)
      .eq("template_key", template_key)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (messageLogs && messageLogs.length > 0) {
      const messageLog = messageLogs[0];
      const { error: updateError } = await supabase
        .from("whatsapp_message_log")
        .update({
          status: "sent",
          external_message_id: externalMessageId,
          sent_at: new Date().toISOString(),
        })
        .eq("id", messageLog.id);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "WhatsApp message sent successfully",
        external_message_id: externalMessageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("WhatsApp send error:", error);
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
