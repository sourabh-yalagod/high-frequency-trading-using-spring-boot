import { Link } from "react-router-dom";
import LiveStatusBadge from "./LiveStatusBadge";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import { getUserId } from "../../../utils/jwt";

interface HeaderProps {
  connected: boolean;
}

const Header = ({ connected }: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  useEffect(() => {
    setIsAuthenticated(!!getUserId())
  }, [])
  const handleLogout = () => {
    localStorage.removeItem("token")
  }
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 gap-3">
        <Logo />
        <nav className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
            <Link to="/chart/BTCUSDT" className="hover:text-blue-500">Charts</Link>
            <Link to={"/profile/" + getUserId()} className="hover:text-blue-500">Profile</Link>
            <Link to="/settings" className="hover:text-blue-500">Settings</Link>
            {
              !isAuthenticated &&
              <Link to="/signup" className="hover:text-blue-500">SignUp</Link>
            }
            {
              !isAuthenticated && <Link to="/signin" className="hover:text-blue-500">SignIn</Link>
            }
            {
              isAuthenticated && <Link to="/signin" onClick={handleLogout} className="hover:text-blue-500">Logout</Link>
            }
          </div>
          <LiveStatusBadge connected={connected} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
