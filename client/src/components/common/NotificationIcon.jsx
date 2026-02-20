import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4); // Mock unread count
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Mock notifications for dropdown preview
  const recentNotifications = [
    { id: 1, type: "reminder", message: "Daily Test in 30 minutes", time: "5 min ago", read: false },
    { id: 2, type: "alert", message: "New test available: Mixed Test", time: "1 hour ago", read: false },
    { id: 3, type: "achievement", message: "7-day streak achieved! 🎉", time: "2 hours ago", read: true },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "reminder": return "⏰";
      case "alert": return "📢";
      case "achievement": return "🏆";
      default: return "📌";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button 
                  onClick={() => setNotificationCount(0)}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${
                    !notif.read ? "bg-purple-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationIcon;