// components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/jwt";

const PrivateRoute = () => {
  const auth = isAuthenticated();
  return auth ? <Outlet /> : <Navigate to={"/signin"} />;
};

export default PrivateRoute;
