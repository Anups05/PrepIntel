import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth Page (NO Sidebar)
import Auth from "./pages/Auth";

// Dashboard Layout (WITH Sidebar + Outlet)
import DashboardLayout from "./pages/DashboardLayout";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import DailyTestsHome from "./pages/DailyTestsHome";
import Streak from "./pages/Streak";
import Settings from "./pages/Settings";

// Notifications Page
import Notifications from "./pages/Notifications";

// Admin Layout and Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTests from "./pages/admin/ManageTests";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1️⃣ FIRST PAGE - AUTH (NO SIDEBAR) */}
        <Route path="/" element={<Auth />} />

        {/* 2️⃣ DASHBOARD + ALL PAGES WITH PERSISTENT SIDEBAR */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* Default /dashboard */}
          <Route index element={<Dashboard />} />

          {/* Nested Pages */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="daily-tests" element={<DailyTestsHome />} />
          <Route path="streak" element={<Streak />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Notifications Page - Inside dashboard layout */}
          <Route path="notifications" element={<Notifications />} />
          
        </Route>

        {/* 4️⃣ ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default admin route - redirects to dashboard */}
          <Route index element={<AdminDashboard />} />
          
          {/* Admin nested pages */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tests" element={<ManageTests />} />
          <Route path="users" element={<ManageUsers />} />
          
          {/* Add more admin routes here as needed */}
          {/* <Route path="analytics" element={<AllAnalytics />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;