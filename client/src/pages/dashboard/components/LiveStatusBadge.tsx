import { useEffect } from "react";
import { userToastMessages } from "../../../utils/userToastMessages";

interface LiveStatusBadgeProps {
  connected: boolean;
}

const LiveStatusBadge = ({ connected }: LiveStatusBadgeProps) => {
  useEffect(()=>{
    if(!connected){
      userToastMessages("error","Lost connection with Binance websocket","as we lost connect with binance websocket we can't provide you real time price changes Please try once refreshing the page.")
    }
  },[connected])
  return <div
    className={`text-xs px-2 py-1 rounded-md font-medium ${connected
      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
      }`}
    title={connected ? "Connected to live feed" : "Disconnected"}
  >
    {connected ? "Live" : "Offline"}
  </div>

}

export default LiveStatusBadge;
