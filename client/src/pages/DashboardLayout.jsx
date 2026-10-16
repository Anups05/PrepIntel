import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import NotificationIcon from "../components/common/NotificationIcon";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-[#F5F6FA] min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Bar with Notification Icon */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-3">
            <NotificationIcon />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;