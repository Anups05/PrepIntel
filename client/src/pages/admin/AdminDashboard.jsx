import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, Target, Clock, AlertTriangle, FileText,
  TrendingUp, TrendingDown, Award, Zap
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from "recharts";
import { getAdminAnalytics } from "../../services/testService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfPeriod, setPerfPeriod] = useState("6months");

  const fetchData = async (period) => {
    try {
      setLoading(true);
      const { data } = await getAdminAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch admin analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(perfPeriod); }, [perfPeriod]);

  const formatTrend = (val) => {
    if (val === null || val === undefined) return null;
    return val >= 0 ? `+${val}%` : `${val}%`;
  };

  const getTrendDirection = (val, inverted) => {
    if (val === null || val === undefined) return "up";
    if (inverted) return val <= 0 ? "up" : "down";
    return val >= 0 ? "up" : "down";
  };

  const stats = [
    {
      label: "Total Students",
      value: analytics ? analytics.totalStudents.toLocaleString() : "...",
      change: formatTrend(analytics?.studentsTrend) || "0%",
      icon: Users, color: "bg-blue-500",
      trend: getTrendDirection(analytics?.studentsTrend, false)
    },
    {
      label: "Active Students",
      value: analytics ? analytics.activeStudents.toLocaleString() : "...",
      change: formatTrend(analytics?.activeStudentsTrend) || "0%",
      icon: UserCheck, color: "bg-green-500",
      trend: getTrendDirection(analytics?.activeStudentsTrend, false)
    },
    {
      label: "Avg Accuracy",
      value: analytics ? `${analytics.avgAccuracy}%` : "...",
      change: formatTrend(analytics?.accuracyTrend) || "—",
      icon: Target, color: "bg-purple-500",
      trend: getTrendDirection(analytics?.accuracyTrend, false)
    },
    {
      label: "Avg Time/Q",
      value: analytics ? `${analytics.avgTimePerQ}s` : "...",
      change: formatTrend(analytics?.timeTrend) || "—",
      icon: Clock, color: "bg-orange-500",
      trend: getTrendDirection(analytics?.timeTrend, true)
    },
    {
      label: "At-Risk Students",
      value: analytics ? analytics.atRiskStudents.toLocaleString() : "...",
      change: formatTrend(analytics?.atRiskTrend) || "0%",
      icon: AlertTriangle, color: "bg-red-500",
      trend: getTrendDirection(analytics?.atRiskTrend, true)
    },
    {
      label: "Tests Conducted",
      value: analytics ? analytics.totalTestsConducted.toLocaleString() : "...",
      change: formatTrend(analytics?.testsTrend) || "0%",
      icon: FileText, color: "bg-indigo-500",
      trend: getTrendDirection(analytics?.testsTrend, false)
    },
  ];

  const performanceData = analytics?.platformPerformance || [];
  const subjectData = analytics?.subjectData || [];
  const batchData = analytics?.batchData || [];

  const weakTopics = analytics?.weakTopics || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes("Accuracy") ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const periodLabels = { weekly: "This Week", monthly: "This Month", "6months": "Last 6 Months", yearly: "This Year" };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 ${stat.color} bg-opacity-10 rounded-lg`}>
                      <Icon className={stat.color.replace('bg-', 'text-')} size={18} />
                    </div>
                    {stat.change && stat.change !== "—" ? (
                      <span className={`text-xs font-medium flex items-center gap-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {stat.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {stat.change}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Platform Performance</h2>
                  <p className="text-sm text-gray-500">Accuracy and student activity</p>
                </div>
                <select value={perfPeriod} onChange={(e) => setPerfPeriod(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="yearly">This Year</option>
                </select>
              </div>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#6B7280" }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} name="Accuracy %" />
                    <Line yAxisId="right" type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} name="Students" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-16">No performance data for {periodLabels[perfPeriod]}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Subject-wise Accuracy</h2>
                  <p className="text-sm text-gray-500">Average performance by subject (all students)</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={subjectData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Weak Topics Heatmap</h2>
                  <p className="text-sm text-gray-500">Topics with highest error rates</p>
                </div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {weakTopics.map((topic, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div>
                        <span className="font-medium text-gray-700">{topic.topic}</span>
                        <span className="text-xs text-gray-400 ml-2">({topic.subject})</span>
                      </div>
                      <span className="text-xs text-gray-500">{topic.students} students</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${topic.errorRate}%`,
                        backgroundColor: topic.errorRate > 70 ? '#EF4444' : topic.errorRate > 60 ? '#F59E0B' : '#8B5CF6'
                      }} />
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-0.5">{topic.errorRate}% error rate</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Batch-wise Accuracy</h2>
                  <p className="text-sm text-gray-500">Average performance by target exam</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {batchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <Zap className="mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-1">Create New Test</h3>
              <p className="text-purple-100 text-sm mb-4">Schedule a mock test for students</p>
              <button onClick={() => navigate("/admin/tests")} className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition">
                Create Test
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <AlertTriangle className="text-yellow-500 mb-3" size={24} />
              <h3 className="font-semibold text-gray-800 mb-1">At-Risk Students</h3>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {analytics ? analytics.atRiskStudents.toLocaleString() : "..."}
              </p>
              <p className="text-sm text-gray-500">Need immediate attention</p>
              <button onClick={() => navigate("/admin/students")} className="text-purple-600 text-sm font-medium mt-3 hover:underline">
                View Details →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Award className="text-yellow-500 mb-3" size={24} />
              <h3 className="font-semibold text-gray-800 mb-1">Top Performer</h3>
              {analytics?.topPerformer ? (
                <>
                  <p className="text-lg font-bold text-gray-800">{analytics.topPerformer.name}</p>
                  <p className="text-sm text-gray-500">
                    {analytics.topPerformer.accuracy}% accuracy{analytics.topPerformer.streak > 0 ? ` • ${analytics.topPerformer.streak}-day streak` : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-400">No data yet</p>
                  <p className="text-sm text-gray-400">Waiting for test attempts</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;