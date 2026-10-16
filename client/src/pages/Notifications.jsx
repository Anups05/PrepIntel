import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Award, AlertTriangle, CheckCircle, Filter, Settings } from "lucide-react";
import { getStudentNotifications } from "../services/testService";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getStudentNotifications();
        // Add read:false by default to all real notifications
        const notifs = (res.data.notifications || []).map((n, i) => ({
          ...n,
          read: false,
          id: n.id || `notif-${i}`
        }));
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const categories = [
    { id: "all", label: "All", icon: Bell },
    { id: "unread", label: "Unread", icon: CheckCircle },
    { id: "alerts", label: "Test Alerts", icon: AlertTriangle },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    if (filter === "alerts") return notif.type === "alert";
    if (filter === "achievements") return notif.type === "achievement";
    return true;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications by date
  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })();

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date || today;
    if (!groups[date]) groups[date] = [];
    groups[date].push(notification);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedNotifications).sort().reverse();

  const formatDateLabel = (date) => {
    if (date === today) return "Today";
    if (date === yesterday) return "Yesterday";
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition">
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${filter === cat.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              <Icon size={16} />
              {cat.label}
              {cat.id === "unread" && unreadCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${filter === cat.id ? "bg-white text-purple-600" : "bg-purple-100 text-purple-600"
                  }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Notifications List */}
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  {formatDateLabel(date)}
                </h3>
                <div className="space-y-3">
                  {groupedNotifications[date].map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => markAsRead(notification.id)}
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer ${!notification.read ? "border-l-4 border-l-purple-600" : ""
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${notification.type === "alert" ? "bg-yellow-100" :
                            notification.type === "achievement" ? "bg-green-100" :
                              "bg-purple-100"
                          }`}>
                          {notification.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-gray-400">{notification.time}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${notification.type === "alert" ? "bg-yellow-100 text-yellow-600" :
                                notification.type === "achievement" ? "bg-green-100 text-green-600" :
                                  "bg-purple-100 text-purple-600"
                              }`}>
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;