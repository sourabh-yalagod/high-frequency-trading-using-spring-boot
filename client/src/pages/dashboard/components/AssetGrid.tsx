import { useNavigate } from "react-router-dom";
import AssetCard from "./AssetCard";

type Asset = {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  prevPrice?: string;
  changeDir?: "up" | "down" | null;
};

interface AssetGridProps {
  assets: Asset[];
}

const AssetGrid = ({ assets }: AssetGridProps) => {
  const navigate = useNavigate()
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
    {assets.map((a) => (
      <AssetCard key={a.symbol} {...a} />
    ))}
  </div>
}

export default AssetGrid;
