import LiveStatusBadge from "./LiveStatusBadge";
import Logo from "./Logo";

interface HeaderProps {
  connected: boolean;
}

const Header = ({ connected }: HeaderProps) => {
  return (
    <header className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 gap-3">
        <Logo />
        <nav className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/dashboard" className="hover:text-blue-500">Dashboard</a>
            <a href="/chart/BTCUSDT" className="hover:text-blue-500">Charts</a>
            <a href="/profile" className="hover:text-blue-500">Profile</a>
            <a href="/settings" className="hover:text-blue-500">Settings</a>
          </div>
          <LiveStatusBadge connected={connected} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
