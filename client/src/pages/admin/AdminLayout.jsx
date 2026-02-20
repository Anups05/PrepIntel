import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  HelpCircle,
  ChevronLeft,
  Menu
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/tests", icon: FileText, label: "Manage Tests" },
    { path: "/admin/users", icon: Users, label: "Manage Users" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div 
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-purple-900 to-indigo-900 text-white hidden md:block transition-all duration-300 relative`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 bg-purple-700 text-white p-1 rounded-full hover:bg-purple-600"
        >
          <ChevronLeft size={16} className={`${collapsed ? "rotate-180" : ""} transition`} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">A</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-purple-300">Exam Analyzer</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition"
          >
            <HelpCircle size={20} />
            {!collapsed && <span className="text-sm">Help & Support</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition mt-1"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-gradient-to-b from-purple-900 to-indigo-900 text-white h-full p-4" onClick={e => e.stopPropagation()}>
            {/* Mobile menu content */}
            <div className="mb-6">
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-purple-300">Exam Analyzer</p>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition"
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;