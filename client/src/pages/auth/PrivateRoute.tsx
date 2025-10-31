// components/PrivateRoute.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isAuthenticated } from "../../utils/jwt";
import { userToastMessages } from "../../utils/userToastMessages";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const auth = isAuthenticated();

  useEffect(() => {
    if (!auth) {
      userToastMessages("error", "Please authenticate yourself....!");
      // slight delay to let toast appear before navigating
      const timer = setTimeout(() => navigate("/signin", { replace: true }), 500);
      return () => clearTimeout(timer);
    }
  }, [auth, navigate]);

  return auth ? <Outlet /> : null;
};

export default PrivateRoute;
