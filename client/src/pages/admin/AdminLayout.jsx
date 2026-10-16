import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Database,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Search,
  User
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { path: "/admin/students", icon: Users, label: "Students" },
    { path: "/admin/batches", icon: BookOpen, label: "Batches" },
    { path: "/admin/tests", icon: FileText, label: "Tests" },
    { path: "/admin/question-bank", icon: Database, label: "Question Bank" },
    { path: "/admin/ai-insights", icon: Brain, label: "AI Insights" },
  ];

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item =>
      item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path)
    );
    return currentItem ? currentItem.label : "Admin Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Sidebar - Desktop */}
      <div
        className={`fixed left-0 top-0 h-screen bg-[#0B0F1A] text-white border-r border-gray-800/50 hidden md:flex flex-col transition-all duration-300 z-50 ${sidebarCollapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Toggle Button - Positioned higher as requested */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 bg-purple-600 text-white p-1.5 rounded-full hover:bg-purple-700 shadow-lg z-[60] transition-colors"
        >
          <ChevronLeft size={16} className={`${sidebarCollapsed ? "rotate-180" : ""} transition-transform duration-300`} />
        </button>

        {/* Logo Section */}
        <div className="p-6 h-20 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h2 className="font-bold text-white tracking-tight">Prep<span className="text-purple-400">Intel</span></h2>
                <p className="text-[10px] text-purple-300/70 font-medium uppercase tracking-widest">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${active
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-gray-400 hover:bg-purple-500/10 hover:text-white"
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section - Logout Only */}
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 border border-red-500/10 group relative"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-red-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Updated to match theme */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-[#0B0F1A] h-full p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h2 className="font-bold text-white uppercase tracking-wider text-sm">PrepIntel</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-800/50 mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/10"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
      >
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
            <p className="text-[11px] text-gray-400 font-medium -mt-1">Manage your platform and student activities</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                <User className="text-white" size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;