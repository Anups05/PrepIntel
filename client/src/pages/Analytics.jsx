import React from "react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, ChevronRight, Sparkles } from "lucide-react";

const Analytics = () => {
  // Monthly Progress Data
  const monthlyData = [
    { month: "Aug", score: 45, accuracy: 60 },
    { month: "Sep", score: 60, accuracy: 68 },
    { month: "Oct", score: 75, accuracy: 72 },
    { month: "Nov", score: 70, accuracy: 75 },
    { month: "Dec", score: 85, accuracy: 78 },
    { month: "Jan", score: 88, accuracy: 82 },
    { month: "Feb", score: 92, accuracy: 86 },
  ];

  // Weekly Score Data
  const weeklyData = [
    { day: "Mon", score: 65 },
    { day: "Tue", score: 72 },
    { day: "Wed", score: 68 },
    { day: "Thu", score: 85 },
    { day: "Fri", score: 78 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 82 },
  ];

  // Tests Per Day Data
  const testsPerDayData = [
    { day: "Mon", tests: 3 },
    { day: "Tue", tests: 4 },
    { day: "Wed", tests: 2 },
    { day: "Thu", tests: 5 },
    { day: "Fri", tests: 3 },
    { day: "Sat", tests: 6 },
    { day: "Sun", tests: 4 },
  ];

  // Subject Performance Data (removed English)
  const subjectData = [
    { subject: "Math", accuracy: 82, color: "#8B5CF6" },
    { subject: "Physics", accuracy: 71, color: "#EC4899" },
    { subject: "Chemistry", accuracy: 68, color: "#F59E0B" },
    { subject: "Biology", accuracy: 88, color: "#10B981" },
  ];

  // Difficulty Performance Data
  const difficultyData = [
    { name: "Easy", accuracy: 92, color: "#10B981" },
    { name: "Medium", accuracy: 78, color: "#F59E0B" },
    { name: "Hard", accuracy: 58, color: "#EF4444" },
    { name: "Expert", accuracy: 42, color: "#8B5CF6" },
    { name: "Very Hard", accuracy: 31, color: "#6B7280" },
  ];

  // Weakness DNA Data (extended horizontally)
  const weaknessData = [
    { topic: "Integration by Parts", subject: "Math", percentage: 78, color: "#EF4444" },
    { topic: "Thermodynamics Laws", subject: "Physics", percentage: 72, color: "#F59E0B" },
    { topic: "Organic Reactions", subject: "Chemistry", percentage: 68, color: "#EC4899" },
    { topic: "Electrostatics", subject: "Physics", percentage: 65, color: "#8B5CF6" },
    { topic: "Probability & Statistics", subject: "Math", percentage: 61, color: "#3B82F6" },
    { topic: "Inorganic Chemistry", subject: "Chemistry", percentage: 55, color: "#10B981" },
    { topic: "Optics", subject: "Physics", percentage: 53, color: "#6B7280" },
    { topic: "Calculus", subject: "Math", percentage: 48, color: "#F97316" },
  ];

  // Attempt Pattern Data
  const attemptPatternData = [
    { name: "Attempted", value: 65, color: "#10B981" },
    { name: "Skipped", value: 12, color: "#6B7280" },
    { name: "Guessed", value: 15, color: "#F59E0B" },
    { name: "Revisited", value: 8, color: "#8B5CF6" },
  ];

  // Combined Score & Accuracy Data for Composed Chart
  const combinedData = monthlyData.map(item => ({
    ...item,
    scoreAccuracy: item.score,
    accuracyValue: item.accuracy
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === "Score" ? "" : "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep-dive into your performance trends.</p>
      </div>

      {/* Score Improvement Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">+28.1%</span>
              <span className="text-sm bg-white/30 px-2 py-1 rounded-full">Score Improvement</span>
            </div>
            <p className="text-purple-100 mt-1">Since you started this month — keep going!</p>
          </div>
        </div>
      </div>

      {/* First Row - Monthly Progress with Score & Accuracy */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Monthly Progress Chart - Takes 2 columns - Now shows both score and accuracy */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Progress - Score vs Accuracy</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">Score and accuracy comparison over months</p>
          
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="left"
                dataKey="score" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]} 
                name="Score"
                barSize={20}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Accuracy"
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Subject Performance Summary - Takes 1 column (English removed) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">Accuracy by subject</p>
          
          <div className="space-y-5">
            {subjectData.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">{subject.subject}</span>
                  <span className="text-sm font-semibold text-gray-800">{subject.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
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

      {/* Second Row - Weekly Score & Tests Per Day */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Weekly Score Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Score</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">This week's daily performance</p>
          
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fill="url(#scoreGradient)" 
                name="Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tests Per Day Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tests Per Day</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">Number of tests taken daily</p>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={testsPerDayData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 8]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tests" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Advanced Analytics</h2>

      {/* Third Row - Difficulty Performance & Attempt Pattern */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Difficulty Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Difficulty Performance</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">Accuracy by difficulty level</p>
          
          <div className="space-y-4">
            {difficultyData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.accuracy}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attempt Pattern */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attempt Pattern</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">How you answer questions</p>
          
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attemptPatternData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {attemptPatternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            {attemptPatternData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fourth Row - Weakness DNA (Extended Horizontally) */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Weakness DNA - Extended horizontally */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weakness DNA</h2>
          <p className="text-sm text-gray-500 -mt-3 mb-4">Topics needing immediate attention</p>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {weaknessData.slice(0, 4).map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{item.topic}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.subject})</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {weaknessData.slice(4, 8).map((item, index) => (
                <div key={index + 4}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{item.topic}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.subject})</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary Badge */}
          <div className="mt-6 p-3 bg-red-50 rounded-lg flex items-center gap-2">
            <span className="text-xs font-medium text-red-600">Priority Focus:</span>
            <span className="text-xs text-red-600">Integration by Parts (78%), Thermodynamics Laws (72%), Organic Reactions (68%)</span>
          </div>
        </div>
      </div>

      {/* Performance Radar (Updated with removed English) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Radar</h2>
        <p className="text-sm text-gray-500 -mt-3 mb-4">Subject-wise competency</p>
        
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 10 }} />
            <Radar name="Accuracy" dataKey="accuracy" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="flex justify-center gap-6 mt-3">
          {subjectData.map((subject) => (
            <div key={subject.subject} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>
              <span className="text-xs text-gray-600">{subject.subject}: {subject.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;