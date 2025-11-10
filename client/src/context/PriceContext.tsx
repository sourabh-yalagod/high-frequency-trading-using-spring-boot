import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { TOP_ASSETS } from "../utils/assetConstant";

type Asset = {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  prevPrice?: string;
  changeDir?: "up" | "down" | null;
};

type Details = {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
} | null;

type OrderDto = {
  price: number;
  amount: number;
  total?: number;
};

type OrderBook = {
  buyOrders: OrderDto[];
  sellOrders: OrderDto[];
};

interface PriceContextType {
  assets: Asset[];
  connected: boolean;
  orderBookConnected: boolean;
  getPrice: (symbol: string) => string | undefined;
  details: Record<string, Details>;
  getDetails: (symbol: string) => Details | null;
  subscribeToOrderBook: (asset: string, callback: (data: OrderBook) => void) => () => void;
}

const PriceContext = createContext<PriceContextType | null>(null);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [orderBookConnected, setOrderBookConnected] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(
    TOP_ASSETS.map((a) => ({ ...a, price: "0.00", prevPrice: undefined, changeDir: null }))
  );
  const [details, setDetails] = useState<Record<string, Details>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const clearTimersRef = useRef<Record<string, number>>({});
  const subscriptionsRef = useRef<Record<string, any>>({});

  // Binance WebSocket connection (existing)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer = 0;

    const connect = () => {
      ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (!Array.isArray(data)) return;

        const priceMap: Record<string, string> = {};
        const newDetails: Record<string, Details> = {};

        for (const item of data) {
          if (item.s && item.c) priceMap[item.s] = item.c;

          if (item.s) {
            newDetails[item.s] = {
              open: item.o,
              high: item.h,
              low: item.l,
              close: item.c,
              volume: item.v,
            };
          }
        }

        setAssets((prev) =>
          prev.map((asset) => {
            const latest = priceMap[asset.symbol];
            if (!latest || asset.price === latest) return asset;

            const prevPrice = asset.price;
            const newDir =
              parseFloat(latest) > parseFloat(prevPrice || "0")
                ? "up"
                : parseFloat(latest) < parseFloat(prevPrice || "0")
                  ? "down"
                  : null;

            if (clearTimersRef.current[asset.symbol]) {
              window.clearTimeout(clearTimersRef.current[asset.symbol]);
            }

            const timerId = window.setTimeout(() => {
              setAssets((cur) =>
                cur.map((x) =>
                  x.symbol === asset.symbol ? { ...x, changeDir: null } : x
                )
              );
              delete clearTimersRef.current[asset.symbol];
            }, 800);

            clearTimersRef.current[asset.symbol] = timerId;

            return { ...asset, prevPrice: asset.price, price: latest, changeDir: newDir };
          })
        );

        setDetails((prev) => ({ ...prev, ...newDetails }));
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      Object.values(clearTimersRef.current).forEach((id) => window.clearTimeout(id));
      clearTimersRef.current = {};
      wsRef.current?.close();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, []);

  // Order Book WebSocket connection (new)
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:8085";
    let stompClient: Client | null = null;

    const connectWebSocket = async () => {
      const SockJS = (await import('sockjs-client')).default;

      const socket = new SockJS(`${BACKEND_URL}/ws`);

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          console.log("Connected to Order Book WebSocket");
          setOrderBookConnected(true);
        },

        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          setOrderBookConnected(false);
        },

        onWebSocketClose: () => {
          console.log("Order Book WebSocket connection closed");
          setOrderBookConnected(false);
        },

        onDisconnect: () => {
          console.log("Disconnected from Order Book WebSocket");
          setOrderBookConnected(false);
        },

        debug: (str) => {
          // Uncomment for debugging
          // console.log('STOMP Debug:', str);
        }
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    connectWebSocket();

    return () => {
      // Unsubscribe all
      Object.values(subscriptionsRef.current).forEach((sub: any) => {
        sub?.unsubscribe();
      });
      subscriptionsRef.current = {};

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const getPrice = useCallback((symbol: string) => {
    return assets.find((a) => a.symbol === symbol)?.price;
  }, [assets]);

  const getDetails = useCallback((symbol: string): Details | null => {
    return details[symbol] || null;
  }, [details]);

  // Subscribe to order book for a specific asset - WRAPPED IN useCallback
  const subscribeToOrderBook = useCallback((asset: string, callback: (data: OrderBook) => void) => {
    const client = stompClientRef.current;

    if (!client || !orderBookConnected) {
      console.warn("Order Book WebSocket not connected yet");
      return () => { };
    }

    const topic = `/topic/orderBook/${asset}`;

    // If already subscribed, unsubscribe first
    if (subscriptionsRef.current[asset]) {
      console.log(`Unsubscribing from existing subscription: ${asset}`);
      subscriptionsRef.current[asset].unsubscribe();
    }

    // Subscribe to the topic
    const subscription = client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing order book message:", error);
      }
    });

    console.log(`Subscribed to ${topic}:`, subscription.id);
    subscriptionsRef.current[asset] = subscription;

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from ${asset}`);
      subscription?.unsubscribe();
      delete subscriptionsRef.current[asset];
    };
  }, [orderBookConnected]);

  return (
    <PriceContext.Provider
      value={{
        assets,
        connected,
        orderBookConnected,
        getPrice,
        details,
        getDetails,
        subscribeToOrderBook
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceContext = () => {
  const ctx = useContext(PriceContext);
  if (!ctx) throw new Error("usePriceContext must be used within PriceProvider");
  return ctx;
};