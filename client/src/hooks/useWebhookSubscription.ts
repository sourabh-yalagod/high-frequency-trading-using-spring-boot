import { useEffect, useRef, useCallback } from 'react';

interface WebhookMessage {
  id?: string;
  status?: string;
  quantity?: number;
  price?: number;
  [key: string]: any;
}

export const useWebhookSubscription = (userId: string) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  const subscribeToWebhook = useCallback(
    (orderId: string, onMessage: (data: WebhookMessage) => void, onError?: (error: Error) => void) => {
      if (!userId || !orderId) {
        console.error('userId and orderId are required to subscribe');
        return;
      }

      // Close any existing connection
      if (eventSourceRef.current) {
        console.log('Closing previous connection');
        eventSourceRef.current.close();
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const eventUrl = `${backendUrl}/order/webhook/subscribe/${userId}/${orderId}`;

      console.log('🔗 Connecting to webhook:', eventUrl);

      eventSourceRef.current = new EventSource(eventUrl);

      // Handle incoming messages
      eventSourceRef.current.onmessage = (event) => {
        try {
          console.log('📨 Raw event data:', event.data);
          const data = JSON.parse(event.data);
          console.log('✅ Webhook received:', data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing webhook data:', error);
          if (onError) onError(error as Error);
        }
      };

      // Handle named events
      eventSourceRef.current.addEventListener('order-update', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          console.log('📨 Named event received:', messageEvent.data);
          const data = JSON.parse(messageEvent.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing named event:', error);
          if (onError) onError(error as Error);
        }
      });

      // Handle errors
      eventSourceRef.current.onerror = (error) => {
        console.error('❌ Webhook connection error:', error);
        if (onError) onError(new Error('Webhook connection failed'));
        eventSourceRef.current?.close();
      };

      return () => {
        if (eventSourceRef.current) {
          console.log('Closing webhook connection');
          eventSourceRef.current.close();
        }
      };
    },
    [userId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Cleaning up webhook connection on unmount');
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { subscribeToWebhook };
};