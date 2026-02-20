import React from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Clock, Flame, Target, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for charts
  const scoreTrendData = [
    { name: "Test 1", score: 50 },
    { name: "Test 2", score: 65 },
    { name: "Test 3", score: 80 },
    { name: "Test 4", score: 85 },
    { name: "Test 5", score: 90 },
    { name: "Test 6", score: 95 },
    { name: "Test 7", score: 100 },
    { name: "Test 8", score: 105 },
    { name: "Test 9", score: 110 },
    { name: "Test 10", score: 115 },
  ];

  const subjectAccuracyData = [
    { subject: "Math", accuracy: 75, color: "#8B5CF6" },
    { subject: "Physics", accuracy: 70, color: "#EC4899" },
    { subject: "Chemistry", accuracy: 65, color: "#F59E0B" },
    { subject: "Biology", accuracy: 60, color: "#10B981" },
  ];

  const handleAllInsightsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/ai-insights");
  };

  return (
    <div>
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Good morning, Arjun</h1>
        <p className="text-gray-500 mt-1">Here's your performance overview for today.</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Avg Time Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ↓ 3s vs last week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">52s</h3>
          <p className="text-gray-500 text-sm">Avg Time / Question</p>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Flame className="text-orange-500" size={20} />
            </div>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ↑ 2 days vs last week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">14 days</h3>
          <p className="text-gray-500 text-sm">Practice Streak</p>
        </div>

        {/* Accuracy Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ↑ 5% vs last week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">78%</h3>
          <p className="text-gray-500 text-sm">Overall Accuracy</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Score Trend Chart - Takes 2 columns */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Score Trend</h2>
              <p className="text-sm text-gray-500">Overall score across last 10 tests</p>
            </div>
            <button 
              onClick={handleAllInsightsClick}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 cursor-pointer"
              type="button"
            >
              All Insights <ChevronRight size={16} />
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={scoreTrendData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Accuracy - Takes 1 column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Subject-wise Accuracy</h2>
              <p className="text-sm text-gray-500">Accuracy breakdown by subject</p>
            </div>
            <button 
              onClick={handleAllInsightsClick}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
              type="button"
            >
              Details
            </button>
          </div>

          <div className="space-y-4">
            {subjectAccuracyData.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">{subject.subject}</span>
                  <span className="text-sm font-semibold text-gray-800">{subject.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${subject.accuracy}%`,
                      backgroundColor: subject.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;