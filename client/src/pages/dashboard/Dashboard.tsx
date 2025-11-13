import { useDispatch } from "react-redux";
import { usePriceContext } from "../../context/PriceContext";
import Footer from "../../utils/Footer";
import AssetCard from "./components/AssetCard";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Qna from "./components/Qna";
import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../../store/apis";
import { getUserId } from "../../utils/jwt";
import { useEffect } from "react";
import { setUser } from "../../store/redux/userSlice";

const Dashboard = () => {
  const { assets, connected } = usePriceContext();
  const dispatch = useDispatch()
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['user'],
    queryFn: () => getUserDetails(getUserId() as string),
    enabled: !!getUserId(),
    staleTime: Infinity,
  })
  useEffect(() => {
    if (!isLoading && isSuccess)
      dispatch(setUser(data?.data));
  }, [data, isLoading])
  return (
    <div className="min-h-screen xl:px-20 flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header connected={connected} />
      <main className="sm:flex justify-around w-full p-4 mt-10 md:p-6">
        <Hero />
        <ul className="h-full max-h-[450px] overflow-scroll p-4 space-y-2">
          {assets.map((a) => (
            <AssetCard key={a.symbol} {...a} />
          ))}
        </ul>
      </main>
      <Qna />
      <Footer />
    </div>
  );
};

export default Dashboard;
