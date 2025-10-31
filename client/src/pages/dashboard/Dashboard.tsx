import { useEffect, useRef, useState } from "react";
import AssetGrid from "./components/AssetGrid";
import Footer from "./components/Footer";
import { TOP_ASSETS } from "../../utils/assetConstant";
import Header from "./components/Header";

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const [assets, setAssets] = useState(
    TOP_ASSETS.map((a) => ({ ...a, price: "0.00", prevPrice: undefined, changeDir: null }))
  );
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
        for (const item of data) if (item.s && item.c) priceMap[item.s] = item.c;

        setAssets((prev: any) =>
          prev.map((asset: any) => {
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
                cur.map((x) => (x.symbol === asset.symbol ? { ...x, changeDir: null } : x))
              );
              delete clearTimersRef.current[asset.symbol];
            }, 800);
            clearTimersRef.current[asset.symbol] = timerId;

            return { ...asset, prevPrice: asset.price, price: latest, changeDir: newDir };
          })
        );
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header connected={connected} />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <AssetGrid assets={assets} />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
