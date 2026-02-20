import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  BookOpen,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Save,
  AlertCircle,
} from "lucide-react";

const Settings = () => {
  const [openSection, setOpenSection] = useState("profile");
  const [saveStatus, setSaveStatus] = useState({});

  // Profile Form Data
  const [formData, setFormData] = useState({
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    phone: "+91 98765 43210",
    targetExam: "MHT-CET 2025",
    dailyGoal: "3 Tests / Day",
    bio: "MHT-CET | Passionate about Physics",
    location: "Mumbai, India",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    studyReminders: true,
    testAlerts: true,
    achievementAlerts: true,
    weeklyReport: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    loginAlerts: true,
    sessionTimeout: "30",
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Handle Profile Changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSaveStatus({ ...saveStatus, profile: false });
  };

  // Handle Notification Changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
    setSaveStatus({ ...saveStatus, notifications: false });
  };

  // Handle Security Changes
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: value,
    });
    setSaveStatus({ ...saveStatus, security: false });
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Simulate password change API call
    setTimeout(() => {
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError("");
    }, 1000);
  };

  // Handle Save
  const handleSave = (section) => {
    setTimeout(() => {
      setSaveStatus({ ...saveStatus, [section]: true });
      alert(`${section} settings saved successfully!`);
    }, 500);
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure? This action cannot be undone!")) {
      alert("Account deletion requested.");
    }
  };

  const SettingCard = ({
    icon: Icon,
    title,
    description,
    sectionKey,
    children,
    onSave,
    showSaveButton = true,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gray-100">
            <Icon size={18} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus[sectionKey] && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Saved
            </span>
          )}
          <ChevronRight
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${
              openSection === sectionKey ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Expandable Content */}
      {openSection === sectionKey && (
        <div className="px-5 pb-5 border-t">
          <div className="pt-4">{children}</div>
          {showSaveButton && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => onSave(sectionKey)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 mb-6">
        Manage your account and preferences.
      </p>

      {/* Profile Top Card */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            AR
          </div>
          <div>
            <h2 className="text-xl font-semibold">{formData.name}</h2>
            <p className="text-sm text-gray-500">
              {formData.targetExam} Aspirant
            </p>
            <button className="text-purple-600 text-sm font-medium mt-1 hover:underline">
              Change Photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleProfileChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleProfileChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleProfileChange}
              rows="2"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave("profile")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            Save Changes
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition">
            Cancel
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {/* Profile Settings (Detailed) */}
        <SettingCard
          icon={User}
          title="Profile"
          description="Update your personal information and photo"
          sectionKey="profile"
          onSave={handleSave}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Target Exam</label>
                <select
                  name="targetExam"
                  value={formData.targetExam}
                  onChange={handleProfileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option>MHT-CET 2025</option>
                  <option>JEE Mains 2025</option>
                  <option>NEET 2025</option>
                  <option>BITSAT 2025</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Daily Goal</label>
                <select
                  name="dailyGoal"
                  value={formData.dailyGoal}
                  onChange={handleProfileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option>1 Test / Day</option>
                  <option>2 Tests / Day</option>
                  <option>3 Tests / Day</option>
                  <option>4 Tests / Day</option>
                </select>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard
          icon={Bell}
          title="Notifications"
          description="Manage alerts, reminders, and study nudges"
          sectionKey="notifications"
          onSave={handleSave}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Study Reminders</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="studyReminders"
                    checked={notificationSettings.studyReminders}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Test Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="testAlerts"
                    checked={notificationSettings.testAlerts}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Achievement Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="achievementAlerts"
                    checked={notificationSettings.achievementAlerts}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Weekly Report</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="weeklyReport"
                    checked={notificationSettings.weeklyReport}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Privacy & Security */}
        <SettingCard
          icon={Shield}
          title="Privacy & Security"
          description="Password and session settings"
          sectionKey="privacy"
          onSave={handleSave}
        >
          <div className="space-y-6">
            {/* Change Password */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Change Password</h4>
              {passwordError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                  <AlertCircle size={16} />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-3 p-2 bg-green-50 text-green-600 text-sm rounded">
                  {passwordSuccess}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Session Timeout */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Session Timeout</h4>
              <select
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </SettingCard>

        {/* Study Preferences */}
        <SettingCard
          icon={BookOpen}
          title="Study Preferences"
          description="Set your exam target, daily goals, and subjects"
          sectionKey="study"
          onSave={handleSave}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Target Exam</label>
              <select
                name="targetExam"
                value={formData.targetExam}
                onChange={handleProfileChange}
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>MHT-CET 2025</option>
                <option>JEE Mains 2025</option>
                <option>NEET 2025</option>
                <option>BITSAT 2025</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Daily Goal</label>
              <select
                name="dailyGoal"
                value={formData.dailyGoal}
                onChange={handleProfileChange}
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>1 Test / Day</option>
                <option>2 Tests / Day</option>
                <option>3 Tests / Day</option>
                <option>4 Tests / Day</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Preferred Subjects</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["Physics", "Chemistry", "Mathematics", "Biology", "English", "General"].map((subject) => (
                  <label key={subject} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SettingCard>
      </div>

      
    </div>
  );
};

export default Settings;