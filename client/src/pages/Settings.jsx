import React, { useState, useEffect } from "react";
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
  Lock,
  CheckCircle,
  Phone,
} from "lucide-react";
import { getMyProfile, updateMyProfile, changePassword } from "../services/studentService";

// SettingCard extracted OUTSIDE to prevent React from re-creating inputs on every render
const SettingCard = ({
  icon: Icon,
  title,
  description,
  sectionKey,
  children,
  onSave,
  showSaveButton = true,
  openSection,
  toggleSection,
  isSaving,
  saveStatus,
}) => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
          className={`text-gray-400 transition-transform duration-300 ${openSection === sectionKey ? "rotate-90" : ""}`}
        />
      </div>
    </div>
    {openSection === sectionKey && (
      <div className="px-5 pb-5 border-t">
        <div className="pt-4">{children}</div>
        {showSaveButton && (
          <div className="flex justify-end mt-4 pt-4 border-t">
            <button
              onClick={() => onSave(sectionKey)}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

const Settings = () => {
  const [openSection, setOpenSection] = useState("profile");
  const [saveStatus, setSaveStatus] = useState({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  // Profile Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    targetExam: "",
    dailyGoal: "3 Tests / Day",
    bio: "",
    location: "",
    displayName: "",
  });

  // Phone validation state
  const [phoneError, setPhoneError] = useState("");

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
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Indian phone validation
  const isValidIndianPhone = (phone) => {
    if (!phone || phone.trim() === "") return true; // optional
    const cleaned = phone.replace(/[\s\-()]/g, "");
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const { data } = await getMyProfile();
        const user = data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          targetExam: user.targetExam || user.desiredBatch || "",
          dailyGoal: "3 Tests / Day",
          bio: "",
          location: user.location || "",
          displayName: user.displayName || user.name || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

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
    setSaveMessage({ type: "", text: "" });

    // Phone validation on change
    if (name === "phone") {
      if (value && !isValidIndianPhone(value)) {
        setPhoneError("Enter a valid Indian number (10 digits starting with 6-9)");
      } else {
        setPhoneError("");
      }
    }
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Client-side validation
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

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Save — real API for profile, local for others
  const handleSave = async (section) => {
    if (section === "profile") {
      // Validate phone before saving
      if (formData.phone && !isValidIndianPhone(formData.phone)) {
        setSaveMessage({ type: "error", text: "Please enter a valid Indian phone number" });
        return;
      }

      setIsSaving(true);
      setSaveMessage({ type: "", text: "" });
      try {
        const { data } = await updateMyProfile({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          displayName: formData.displayName,
          targetExam: formData.targetExam,
        });
        setSaveStatus({ ...saveStatus, profile: true });
        setSaveMessage({ type: "success", text: "Profile saved successfully!" });
        // Update localStorage user data with returned data
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored && data.user) {
          stored.name = data.user.name;
          stored.displayName = data.user.displayName;
          stored.avatar = data.user.avatar;
          stored.phone = data.user.phone;
          stored.location = data.user.location;
          stored.targetExam = data.user.targetExam;
          stored.desiredBatch = data.user.desiredBatch;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to save profile";
        setSaveMessage({ type: "error", text: msg });
      } finally {
        setIsSaving(false);
      }
    } else {
      // Other sections — keep existing local behavior
      setTimeout(() => {
        setSaveStatus({ ...saveStatus, [section]: true });
        alert(`${section} settings saved successfully!`);
      }, 500);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure? This action cannot be undone!")) {
      alert("Account deletion requested.");
    }
  };



  if (isLoadingProfile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-gray-500 mb-6">Loading your profile...</p>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 mb-6">
        Manage your account and preferences.
      </p>

      {/* Save Message */}
      {saveMessage.text && (
        <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2 ${saveMessage.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
          {saveMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <p className="text-sm">{saveMessage.text}</p>
        </div>
      )}

      {/* Profile Top Card */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{formData.displayName || formData.name}</h2>
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
            <label className="text-sm text-gray-600 flex items-center gap-1">
              Email <Lock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">(cannot be changed)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full mt-1 p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1">
              Phone <Phone size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">(Indian format)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleProfileChange}
              placeholder="+91 9876543210"
              className={`w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${phoneError ? "border-red-400" : ""
                }`}
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleProfileChange}
              placeholder="Mumbai, India"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleProfileChange}
              placeholder="How you want to be called"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">This name will be shown on your dashboard as "Welcome, [Display Name]"</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave("profile")}
            disabled={isSaving || !!phoneError}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
          openSection={openSection}
          toggleSection={toggleSection}
          isSaving={isSaving}
          saveStatus={saveStatus}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleProfileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1">
                  Email <Lock size={12} className="text-gray-400" />
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  <option>JEE Advanced</option>
                  <option>JEE Main</option>
                  <option>NEET</option>
                  <option>CET</option>
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
          openSection={openSection}
          toggleSection={toggleSection}
          isSaving={isSaving}
          saveStatus={saveStatus}
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
          showSaveButton={false}
          openSection={openSection}
          toggleSection={toggleSection}
          isSaving={isSaving}
          saveStatus={saveStatus}
        >
          <div className="space-y-6">
            {/* Change Password */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Change Password</h4>
              {passwordError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-3 p-2 bg-green-50 text-green-600 text-sm rounded flex items-center gap-2 border border-green-200">
                  <CheckCircle size={16} />
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
                  <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char</p>
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
                  disabled={isChangingPassword}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
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
          openSection={openSection}
          toggleSection={toggleSection}
          isSaving={isSaving}
          saveStatus={saveStatus}
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
                <option>JEE Advanced</option>
                <option>JEE Main</option>
                <option>NEET</option>
                <option>CET</option>
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
                {["Physics", "Chemistry", "Mathematics", "Biology"].map((subject) => (
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