import { Home, History, BarChart3, Settings } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "History" },
    { path: "/charts", icon: BarChart3, label: "Charts" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center py-2 px-4 touch-target transition-colors ${
                  isActive ? "text-medical-blue" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
