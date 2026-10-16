import React, { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from "recharts";
import { TrendingUp } from "lucide-react";
import { getStudentAnalytics, getStudentWeakTopics } from "../services/testService";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getStudentAnalytics();
        setAnalytics(data);
      } catch (err) { console.error("Failed to fetch analytics:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Weakness DNA - real data
  const [weaknessData, setWeaknessData] = useState([]);
  const weakColors = ['#EF4444', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#6B7280', '#F97316', '#14B8A6', '#DC2626'];

  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        const res = await getStudentWeakTopics();
        const topics = (res.data.weakTopics || []).map((t, i) => ({
          topic: t.topic,
          subject: t.subject,
          percentage: t.errorRate,
          color: weakColors[i % weakColors.length]
        }));
        setWeaknessData(topics);
      } catch (err) { console.error("Failed to fetch weak topics:", err); }
    };
    fetchWeakTopics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === "Score" || entry.name === "Tests" ? "" : "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for attempt pattern pie chart - shows percentage
  const AttemptPatternTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
            {payload[0].name}: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>;
  }

  const monthlyData = analytics?.monthlyData?.length > 0 ? analytics.monthlyData : [];
  const weeklyData = analytics?.weeklyData?.length > 0 ? analytics.weeklyData : [];
  const testsPerDayData = analytics?.testsPerDay?.length > 0 ? analytics.testsPerDay : [];
  const subjectData = analytics?.subjectData?.length > 0 ? analytics.subjectData : [];
  const difficultyData = analytics?.difficultyData?.length > 0 ? analytics.difficultyData : [];
  const attemptPatternData = analytics?.attemptPattern?.length > 0 ? analytics.attemptPattern : [];
  const noData = analytics?.totalTests === 0;

  // Prepare radar data: ensure values are capped at 100
  const radarData = subjectData.map(s => ({ subject: s.subject, accuracy: Math.min(s.accuracy, 100), color: s.color }));

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep-dive into your performance trends.</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{analytics?.overallAccuracy ?? 0}%</span>
              <span className="text-sm bg-white/30 px-2 py-1 rounded-full">Overall Accuracy</span>
            </div>
            <p className="text-purple-100 mt-1">Across {analytics?.totalTests ?? 0} tests taken</p>
          </div>
        </div>
      </div>

      {noData ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">No analytics data yet. Take some tests to see your performance!</p>
        </div>
      ) : (
        <>
          {/* Monthly Progress */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Monthly Progress</h2>
              <p className="text-sm text-gray-500 mb-4">Score and accuracy comparison over months</p>
              {monthlyData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Score" barSize={20} />
                      <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Accuracy" />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded-full"></div><span className="text-sm text-gray-600">Score</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-sm text-gray-600">Accuracy</span></div>
                  </div>
                </>
              ) : <p className="text-gray-400 text-center py-8">No monthly data yet</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Subject Performance</h2>
              <p className="text-sm text-gray-500 mb-4">Accuracy by subject</p>
              {subjectData.length > 0 ? (
                <div className="space-y-5">
                  {subjectData.map((subject) => (
                    <div key={subject.subject}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">{subject.subject}</span>
                        <span className="text-sm font-semibold text-gray-800">{subject.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${subject.accuracy}%`, backgroundColor: subject.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-8">No data yet</p>}
            </div>
          </div>

          {/* Weekly Score & Tests Per Day */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Weekly Score</h2>
              <p className="text-sm text-gray-500 mb-4">This week's daily performance</p>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} fill="url(#scoreGradient)" name="Score" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-center py-8">No data this week</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Tests Per Day</h2>
              <p className="text-sm text-gray-500 mb-4">Number of tests taken daily</p>
              {testsPerDayData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={testsPerDayData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tests" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Tests" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-center py-8">No data this week</p>}
            </div>
          </div>

          {/* Advanced Analytics */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Advanced Analytics</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Difficulty Performance</h2>
              <p className="text-sm text-gray-500 mb-4">Accuracy by difficulty level</p>
              {difficultyData.length > 0 ? (
                <div className="space-y-4">
                  {difficultyData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-800">{item.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${item.accuracy}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-8">No data yet</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Attempt Pattern</h2>
              <p className="text-sm text-gray-500 mb-4">How you answer questions</p>
              {attemptPatternData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={attemptPatternData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {attemptPatternData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<AttemptPatternTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {attemptPatternData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-gray-400 text-center py-8">No data yet</p>}
            </div>
          </div>

          {/* Weakness DNA - mock */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Weakness DNA</h2>
              <p className="text-sm text-gray-500 mb-4">Topics needing immediate attention</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  {weaknessData.slice(0, 4).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div><span className="text-sm font-medium text-gray-800">{item.topic}</span><span className="text-xs text-gray-500 ml-2">({item.subject})</span></div>
                        <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {weaknessData.slice(4, 8).map((item, index) => (
                    <div key={index + 4}>
                      <div className="flex justify-between items-center mb-1">
                        <div><span className="text-sm font-medium text-gray-800">{item.topic}</span><span className="text-xs text-gray-500 ml-2">({item.subject})</span></div>
                        <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                <span className="text-xs font-medium text-red-600">Priority Focus:</span>
                <span className="text-xs text-red-600">
                  {weaknessData.length > 0
                    ? weaknessData.slice(0, 3).map(w => `${w.topic} (${w.percentage}%)`).join(', ')
                    : 'No data yet'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Performance Radar</h2>
            <p className="text-sm text-gray-500 mb-4">Subject-wise competency</p>
            {radarData.length > 0 ? (
              <>
                <div className="flex justify-center">
                  <div style={{ width: "400px", height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 10 }} tickCount={6} />
                        <Radar name="Accuracy" dataKey="accuracy" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                        <Tooltip formatter={(value) => `${value}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-3">
                  {radarData.map((subject) => (
                    <div key={subject.subject} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>
                      <span className="text-xs text-gray-600">{subject.subject}: {subject.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-gray-400 text-center py-8">No data yet</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;