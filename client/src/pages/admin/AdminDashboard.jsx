import React from "react";
import { 
  Users, 
  FileText, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  // Mock data
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, change: "+12%", color: "bg-blue-500" },
    { label: "Total Tests", value: "456", icon: FileText, change: "+8%", color: "bg-green-500" },
    { label: "Tests Taken", value: "12,345", icon: Award, change: "+23%", color: "bg-purple-500" },
    { label: "Avg. Score", value: "78%", icon: TrendingUp, change: "+5%", color: "bg-orange-500" },
  ];

  const recentActivity = [
    { user: "Arjun Reddy", action: "Completed Test", test: "JEE Mock #1", score: "85%", time: "5 min ago" },
    { user: "Priya Sharma", action: "Started Test", test: "Physics Practice", score: "-", time: "12 min ago" },
    { user: "Rahul Verma", action: "Completed Test", test: "Chemistry Quiz", score: "92%", time: "25 min ago" },
    { user: "Neha Gupta", action: "Registered", test: "New User", score: "-", time: "1 hour ago" },
    { user: "Amit Kumar", action: "Completed Test", test: "Math Test", score: "78%", time: "2 hours ago" },
  ];

  const performanceData = [
    { month: "Jan", score: 65, students: 120 },
    { month: "Feb", score: 68, students: 145 },
    { month: "Mar", score: 72, students: 180 },
    { month: "Apr", score: 70, students: 220 },
    { month: "May", score: 75, students: 250 },
    { month: "Jun", score: 80, students: 280 },
  ];

  const subjectPerformance = [
    { name: "Math", value: 82, color: "#8B5CF6" },
    { name: "Physics", value: 71, color: "#EC4899" },
    { name: "Chemistry", value: 68, color: "#F59E0B" },
    { name: "Biology", value: 88, color: "#10B981" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Last updated: Just now</span>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} bg-opacity-10 rounded-xl`}>
                  <Icon className={stat.color.replace("bg-", "text-")} size={24} />
                </div>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Student Performance Trend</h2>
              <p className="text-sm text-gray-500">Average scores over time</p>
            </div>
            <select className="text-sm border rounded-lg px-3 py-2">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Subject Performance</h2>
              <p className="text-sm text-gray-500">Average accuracy by subject</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{subject.name}</span>
                    <span className="text-sm font-bold" style={{ color: subject.color }}>
                      {subject.value}%
                    </span>
                  </div>
                  <div className="w-48 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${subject.value}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="40%" height={150}>
              <PieChart>
                <Pie
                  data={subjectPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                >
                  {subjectPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">
                      {activity.user.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.user}</p>
                    <p className="text-xs text-gray-500">
                      {activity.action} • {activity.test}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score !== "-" && (
                    <span className="text-sm font-bold text-green-600">{activity.score}</span>
                  )}
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition text-left">
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <div>
                  <p className="font-medium">Create New Test</p>
                  <p className="text-xs text-purple-500">Add questions, set time limit</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-left">
              <div className="flex items-center gap-3">
                <Users size={20} />
                <div>
                  <p className="font-medium">Add New User</p>
                  <p className="text-xs text-blue-500">Create student account</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition text-left">
              <div className="flex items-center gap-3">
                <Award size={20} />
                <div>
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-green-500">Download analytics</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition text-left">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">System Settings</p>
                  <p className="text-xs text-orange-500">Configure platform</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">System Status: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm">24 active users</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm">3 tests in progress</span>
            </div>
          </div>
          <button className="text-sm text-gray-400 hover:text-gray-600">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;