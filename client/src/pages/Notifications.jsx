import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Award, AlertTriangle, CheckCircle, Filter, Settings } from "lucide-react";

const Notifications = () => {
  const [filter, setFilter] = useState("all"); // all, unread, reminders, alerts, achievements
  const [notifications, setNotifications] = useState([
    // Study Reminders
    {
      id: 1,
      type: "reminder",
      title: "Study Reminder",
      message: "Daily Mixed Test is waiting for you!",
      time: "5 minutes ago",
      date: "2024-02-20",
      read: false,
      icon: "⏰",
      category: "Study Reminders"
    },
    {
      id: 2,
      type: "reminder",
      title: "Practice Session",
      message: "Complete your Physics practice for today",
      time: "1 hour ago",
      date: "2024-02-20",
      read: true,
      icon: "📚",
      category: "Study Reminders"
    },
    {
      id: 3,
      type: "reminder",
      title: "Revision Reminder",
      message: "Don't forget to revise Integration formulas",
      time: "3 hours ago",
      date: "2024-02-20",
      read: false,
      icon: "🔄",
      category: "Study Reminders"
    },

    // Test Alerts
    {
      id: 4,
      type: "alert",
      title: "New Test Available",
      message: "Daily Mixed Test - Feb 20 is now available",
      time: "30 minutes ago",
      date: "2024-02-20",
      read: false,
      icon: "📢",
      category: "Test Alerts"
    },
    {
      id: 5,
      type: "alert",
      title: "Test Reminder",
      message: "Your test starts in 15 minutes. Get ready!",
      time: "15 minutes ago",
      date: "2024-02-20",
      read: true,
      icon: "⏳",
      category: "Test Alerts"
    },
    {
      id: 6,
      type: "alert",
      title: "Test Expiring",
      message: "Today's test will expire in 2 hours",
      time: "2 hours ago",
      date: "2024-02-20",
      read: false,
      icon: "⚠️",
      category: "Test Alerts"
    },

    // Achievement Alerts
    {
      id: 7,
      type: "achievement",
      title: "New Achievement!",
      message: "7-day practice streak achieved! 🔥",
      time: "2 hours ago",
      date: "2024-02-20",
      read: false,
      icon: "🏆",
      category: "Achievement Alerts"
    },
    {
      id: 8,
      type: "achievement",
      title: "Milestone Reached",
      message: "Completed 50 tests overall! 🎉",
      time: "1 day ago",
      date: "2024-02-19",
      read: true,
      icon: "⭐",
      category: "Achievement Alerts"
    },
    {
      id: 9,
      type: "achievement",
      title: "Perfect Score",
      message: "Scored 100% in Mathematics test! 🌟",
      time: "2 days ago",
      date: "2024-02-18",
      read: true,
      icon: "💯",
      category: "Achievement Alerts"
    },

    // Weekly Report
    {
      id: 10,
      type: "report",
      title: "Weekly Performance Report",
      message: "Your accuracy improved by 12% this week. Check detailed analysis.",
      time: "1 day ago",
      date: "2024-02-19",
      read: false,
      icon: "📊",
      category: "Weekly Report"
    },
    {
      id: 11,
      type: "report",
      title: "Weak Areas Identified",
      message: "Integration and Thermodynamics need more practice",
      time: "2 days ago",
      date: "2024-02-18",
      read: true,
      icon: "📉",
      category: "Weekly Report"
    },
    {
      id: 12,
      type: "report",
      title: "Monthly Progress",
      message: "You're in top 15% of learners this month",
      time: "3 days ago",
      date: "2024-02-17",
      read: true,
      icon: "📈",
      category: "Weekly Report"
    },
  ]);

  const categories = [
    { id: "all", label: "All", icon: Bell },
    { id: "unread", label: "Unread", icon: CheckCircle },
    { id: "reminders", label: "Reminders", icon: Clock },
    { id: "alerts", label: "Test Alerts", icon: AlertTriangle },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "reports", label: "Reports", icon: Filter },
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    if (filter === "reminders") return notif.type === "reminder";
    if (filter === "alerts") return notif.type === "alert";
    if (filter === "achievements") return notif.type === "achievement";
    if (filter === "reports") return notif.type === "report";
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
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedNotifications).sort().reverse();

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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === cat.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon size={16} />
              {cat.label}
              {cat.id === "unread" && unreadCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === cat.id ? "bg-white text-purple-600" : "bg-purple-100 text-purple-600"
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

      {/* Notifications List */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              {date === "2024-02-20" ? "Today" : 
               date === "2024-02-19" ? "Yesterday" : 
               new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
              {groupedNotifications[date].map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer ${
                    !notification.read ? "border-l-4 border-l-purple-600" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      notification.type === "reminder" ? "bg-blue-100" :
                      notification.type === "alert" ? "bg-yellow-100" :
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === "reminder" ? "bg-blue-100 text-blue-600" :
                          notification.type === "alert" ? "bg-yellow-100 text-yellow-600" :
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
    </div>
  );
};

export default Notifications;