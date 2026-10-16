import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  ClipboardList,
  Flame,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "AI Insights",
      path: "/dashboard/ai-insights",
      icon: Brain,
    },
    {
      name: "Daily Tests",
      path: "/dashboard/daily-tests",
      icon: ClipboardList,
    },
    {
      name: "Practice Streak",
      path: "/dashboard/streak",
      icon: Flame,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-[#0B0F1A] text-white transition-all duration-300 z-50 flex flex-col border-r border-gray-800/50 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Toggle Button - Positioned higher as requested */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-purple-600 text-white p-1.5 rounded-full hover:bg-purple-700 shadow-md transition-colors z-[60]"
      >
        <ChevronLeft size={16} className={`${isCollapsed ? "rotate-180" : ""} transition-transform duration-300`} />
      </button>

      {/* TOP SECTION */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo */}
        <div className="p-6 h-20 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white tracking-tight overflow-hidden whitespace-nowrap">
                Prep<span className="text-purple-400">Intel</span>
              </h1>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-gray-400 hover:bg-purple-500/10 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION — LOGOUT */}
      <div className="p-4 border-t border-gray-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 
          hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 border border-red-500/10 group relative"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-red-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;