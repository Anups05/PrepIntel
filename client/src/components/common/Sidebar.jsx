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
} from "lucide-react";

const Sidebar = () => {
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
    // Clear auth data (for future MERN JWT)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to Auth/Login page
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-[#0B0F1A] text-white p-6 fixed left-0 top-0 flex flex-col justify-between">
      
      {/* TOP SECTION */}
      <div>
        {/* Logo */}
        <h1 className="text-2xl font-bold text-purple-400 mb-10">
          PrepIntel
        </h1>

        {/* Menu */}
        <div className="space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION — LOGOUT */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 
          hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 border border-red-500/20"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;