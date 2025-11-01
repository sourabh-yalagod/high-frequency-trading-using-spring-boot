import { Link } from "react-router-dom";
import LiveStatusBadge from "./LiveStatusBadge";
import Logo from "./Logo";

interface HeaderProps {
  connected: boolean;
}

const Header = ({ connected }: HeaderProps) => {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 gap-3">
        <Logo />
        <nav className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
            <Link to="/chart/BTCUSDT" className="hover:text-blue-500">Charts</Link>
            <Link to="/profile" className="hover:text-blue-500">Profile</Link>
            <Link to="/settings" className="hover:text-blue-500">Settings</Link>
          </div>
          <LiveStatusBadge connected={connected} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
