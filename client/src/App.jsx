import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth Page
import Auth from "./pages/Auth";

// Dashboard Layout and Pages
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import DailyTestsHome from "./pages/DailyTestsHome";
import Streak from "./pages/Streak";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// Admin Layout and Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Batches from "./pages/admin/Batches";
import Tests from "./pages/admin/Tests";
import QuestionBank from "./pages/admin/QuestionBank";
import AIInsightsAdmin from "./pages/admin/AIInsights";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<Auth />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="daily-tests" element={<DailyTestsHome />} />
          <Route path="streak" element={<Streak />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="batches" element={<Batches />} />
          <Route path="tests" element={<Tests />} />
          <Route path="question-bank" element={<QuestionBank />} />
          <Route path="ai-insights" element={<AIInsightsAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;