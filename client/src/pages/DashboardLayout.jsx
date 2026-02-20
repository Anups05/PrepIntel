import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import NotificationIcon from "../components/common/NotificationIcon";

const DashboardLayout = () => {
  return (
    <div className="flex bg-[#F5F6FA] min-h-screen">
      <Sidebar />
      <div className="ml-64 w-full p-8">
        {/* Top Bar with Notification Icon */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-3">
            <NotificationIcon />
            {/* You can add more top bar icons here if needed */}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;