import React, { createContext, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface WhatsAppTemplate {
  id: string;
  template_key: string;
  template_name: string;
  message_body: string;
  variables: Record<string, string>;
  is_active: boolean;
}

export interface WhatsAppMessageLog {
  id: string;
  booking_id: string;
  recipient_phone: string;
  recipient_type: 'customer' | 'worker';
  template_key: string;
  message_body: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

interface WhatsAppContextType {
  getMessageTemplates: () => Promise<WhatsAppTemplate[]>;
  getMessageTemplate: (templateKey: string) => Promise<WhatsAppTemplate | null>;
  formatMessage: (template: string, variables: Record<string, string>) => string;
  sendBookingConfirmation: (bookingId: string, customerPhone: string, bookingDetails: any) => Promise<boolean>;
  sendWorkerAssignment: (bookingId: string, customerPhone: string, workerDetails: any) => Promise<boolean>;
  sendPreArrivalNotification: (bookingId: string, customerPhone: string, workerDetails: any) => Promise<boolean>;
  sendJobCompletionNotification: (bookingId: string, customerPhone: string, jobDetails: any) => Promise<boolean>;
  sendPaymentLink: (bookingId: string, customerPhone: string, paymentDetails: any) => Promise<boolean>;
  sendCancellationWarning: (bookingId: string, customerPhone: string, cancellationDetails: any) => Promise<boolean>;
  sendReviewRequest: (bookingId: string, customerPhone: string, reviewDetails: any) => Promise<boolean>;
  getMessageLog: (bookingId: string) => Promise<WhatsAppMessageLog[]>;
  updateMessageStatus: (messageLogId: string, status: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fetch all message templates
  const getMessageTemplates = useCallback(async (): Promise<WhatsAppTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data as WhatsAppTemplate[]) || [];
    } catch (err) {
      console.error('Error fetching message templates:', err);
      return [];
    }
  }, []);

  // Fetch specific message template
  const getMessageTemplate = useCallback(async (templateKey: string): Promise<WhatsAppTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_templates')
        .select('*')
        .eq('template_key', templateKey)
        .single();

      if (error) throw error;
      return (data as WhatsAppTemplate) || null;
    } catch (err) {
      console.error('Error fetching message template:', err);
      return null;
    }
  }, []);

  // Format message by replacing placeholders with actual values
  const formatMessage = useCallback((template: string, variables: Record<string, string>): string => {
    let formattedMessage = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), value || '');
    });
    return formattedMessage;
  }, []);

  // Send booking confirmation
  const sendBookingConfirmation = useCallback(
    async (bookingId: string, customerPhone: string, bookingDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('booking_confirmation');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          customer_name: bookingDetails.customer_name,
          service_name: bookingDetails.service_name,
          scheduled_date: bookingDetails.scheduled_date,
          scheduled_time: bookingDetails.scheduled_time,
          address: bookingDetails.address,
          total_price: bookingDetails.total_price.toString(),
        });

        // Log the message
        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'booking_confirmation',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        // Call edge function to send via WhatsApp API
        // In production, this would call your WhatsApp edge function
        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'booking_confirmation',
        });

        return true;
      } catch (err) {
        console.error('Error sending booking confirmation:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send worker assignment notification
  const sendWorkerAssignment = useCallback(
    async (bookingId: string, customerPhone: string, workerDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('worker_assigned');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          customer_name: workerDetails.customer_name,
          worker_name: workerDetails.worker_name,
          worker_rating: workerDetails.worker_rating.toString(),
          verification_status: workerDetails.verification_status,
          worker_phone: workerDetails.worker_phone,
          estimated_arrival: workerDetails.estimated_arrival,
          address: workerDetails.address,
        });

        // Log the message
        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'worker_assigned',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        // Call edge function
        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'worker_assigned',
        });

        return true;
      } catch (err) {
        console.error('Error sending worker assignment notification:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send pre-arrival notification
  const sendPreArrivalNotification = useCallback(
    async (bookingId: string, customerPhone: string, workerDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('pre_arrival');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          customer_name: workerDetails.customer_name,
          worker_name: workerDetails.worker_name,
          current_address: workerDetails.current_address,
          worker_rating: workerDetails.worker_rating.toString(),
        });

        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'pre_arrival',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'pre_arrival',
        });

        return true;
      } catch (err) {
        console.error('Error sending pre-arrival notification:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send job completion notification
  const sendJobCompletionNotification = useCallback(
    async (bookingId: string, customerPhone: string, jobDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('job_completed');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          worker_name: jobDetails.worker_name,
          service_name: jobDetails.service_name,
          total_price: jobDetails.total_price.toString(),
          payment_link: jobDetails.payment_link,
        });

        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'job_completed',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'job_completed',
        });

        return true;
      } catch (err) {
        console.error('Error sending job completion notification:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send payment link
  const sendPaymentLink = useCallback(
    async (bookingId: string, customerPhone: string, paymentDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('payment_link');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          customer_name: paymentDetails.customer_name,
          service_name: paymentDetails.service_name,
          total_price: paymentDetails.total_price.toString(),
          payment_link: paymentDetails.payment_link,
          invoice_number: paymentDetails.invoice_number,
        });

        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'payment_link',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'payment_link',
        });

        return true;
      } catch (err) {
        console.error('Error sending payment link:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send cancellation warning
  const sendCancellationWarning = useCallback(
    async (bookingId: string, customerPhone: string, cancellationDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('cancellation_warning');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          customer_name: cancellationDetails.customer_name,
          service_name: cancellationDetails.service_name,
          cancellation_fee: cancellationDetails.cancellation_fee.toString(),
          cancellation_percentage: cancellationDetails.cancellation_percentage.toString(),
          cancellation_hours: cancellationDetails.cancellation_hours.toString(),
        });

        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'cancellation_warning',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'cancellation_warning',
        });

        return true;
      } catch (err) {
        console.error('Error sending cancellation warning:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Send review request
  const sendReviewRequest = useCallback(
    async (bookingId: string, customerPhone: string, reviewDetails: any): Promise<boolean> => {
      try {
        const template = await getMessageTemplate('review_request');
        if (!template) return false;

        const formattedMessage = formatMessage(template.message_body, {
          service_name: reviewDetails.service_name,
          worker_name: reviewDetails.worker_name,
          review_link: reviewDetails.review_link,
        });

        const { error } = await supabase.from('whatsapp_message_log').insert({
          booking_id: bookingId,
          recipient_phone: customerPhone,
          recipient_type: 'customer',
          template_key: 'review_request',
          message_body: formattedMessage,
          status: 'pending',
        });

        if (error) throw error;

        await callWhatsAppEdgeFunction('send_message', {
          phone: customerPhone,
          message: formattedMessage,
          booking_id: bookingId,
          template_key: 'review_request',
        });

        return true;
      } catch (err) {
        console.error('Error sending review request:', err);
        return false;
      }
    },
    [getMessageTemplate, formatMessage]
  );

  // Get message log for a booking
  const getMessageLog = useCallback(async (bookingId: string): Promise<WhatsAppMessageLog[]> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_log')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as WhatsAppMessageLog[]) || [];
    } catch (err) {
      console.error('Error fetching message log:', err);
      return [];
    }
  }, []);

  // Update message status
  const updateMessageStatus = useCallback(async (messageLogId: string, status: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('whatsapp_message_log')
        .update({
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : undefined,
          delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
        })
        .eq('id', messageLogId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  }, []);

  // Helper function to call WhatsApp edge function
  const callWhatsAppEdgeFunction = async (functionName: string, payload: any) => {
    try {
      // In production, replace with your actual edge function URL
      const response = await fetch('/.netlify/functions/whatsapp-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error calling edge function:', err);
      // Could log this to an error tracking service
    }
  };

  return (
    <WhatsAppContext.Provider
      value={{
        getMessageTemplates,
        getMessageTemplate,
        formatMessage,
        sendBookingConfirmation,
        sendWorkerAssignment,
        sendPreArrivalNotification,
        sendJobCompletionNotification,
        sendPaymentLink,
        sendCancellationWarning,
        sendReviewRequest,
        getMessageLog,
        updateMessageStatus,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within WhatsAppProvider');
  }
  return context;
};
