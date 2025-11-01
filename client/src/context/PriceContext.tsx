import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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

interface PriceContextType {
  assets: Asset[];
  connected: boolean;
  getPrice: (symbol: string) => string | undefined;
  details: Record<string, Details>;
  getDetails: (symbol: string) => Details | null;
}

const PriceContext = createContext<PriceContextType | null>(null);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(
    TOP_ASSETS.map((a) => ({ ...a, price: "0.00", prevPrice: undefined, changeDir: null }))
  );
  const [details, setDetails] = useState<Record<string, Details>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const clearTimersRef = useRef<Record<string, number>>({});

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

          // store detailed info for each symbol
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

        // update prices (existing logic, unchanged)
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

        // update details (new addition)
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

  // existing function
  const getPrice = (symbol: string) => {
    return assets.find((a) => a.symbol === symbol)?.price;
  };

  // new function to get details
  const getDetails = (symbol: string): Details | null => {
    return details[symbol] || null;
  };

  return (
    <PriceContext.Provider value={{ assets, connected, getPrice, details, getDetails }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceContext = () => {
  const ctx = useContext(PriceContext);
  if (!ctx) throw new Error("usePriceContext must be used within PriceProvider");
  return ctx;
};
