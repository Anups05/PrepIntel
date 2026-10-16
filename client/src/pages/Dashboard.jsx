import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Clock, Flame, Target, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getStudentAnalytics, getTestHistory, getStudentStreak } from "../services/testService";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const displayName = user.displayName || user.name || "Student";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [analytics, setAnalytics] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, streakRes] = await Promise.all([
          getStudentAnalytics(),
          getStudentStreak()
        ]);
        setAnalytics(analyticsRes.data);
        setStreakData(streakRes.data);
      } catch (err) { console.error("Failed to fetch analytics:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const formatAvgTime = (s) => {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const formatDuration = (s) => {
    if (!s || s === 0) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    if (m < 60) return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
    const h = Math.floor(m / 60), rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  };

  const handleAllInsightsClick = async () => {
    setShowTestHistory(true);
    if (testHistory.length === 0) {
      setHistoryLoading(true);
      try {
        const { data } = await getTestHistory();
        setTestHistory(data.attempts || []);
      } catch (err) { console.error("Failed to fetch test history:", err); }
      finally { setHistoryLoading(false); }
    }
  };

  const TrendBadge = ({ value, unit, inverted }) => {
    if (value === null || value === undefined) return null;
    const isPositive = inverted ? value < 0 : value > 0;
    const isNeutral = value === 0;
    const absVal = Math.abs(value);
    const displayVal = unit === "s" ? formatAvgTime(absVal) : `${absVal}%`;
    if (isNeutral) return <span className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded-full">→ No change</span>;
    return (
      <span className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {value > 0 ? "↑" : "↓"} {displayVal}
      </span>
    );
  };

  const scoreTrendData = analytics?.scoreTrend?.length > 0 ? analytics.scoreTrend : [{ name: "No data", score: 0 }];
  const subjectAccuracyData = analytics?.subjectData?.length > 0 ? analytics.subjectData : [];

  // ============ TEST HISTORY VIEW ============
  if (showTestHistory) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowTestHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><ArrowLeft size={20} className="text-gray-600" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Test History</h1>
            <p className="text-gray-500 mt-1">All your attempted tests with detailed stats</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : testHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-16">No tests attempted yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Test Name</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Accuracy</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Avg Time/Q</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Attempted Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Total Time</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((test, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{test.title}</p>
                      <p className="text-xs text-gray-500">{test.totalQuestions} Questions · {test.totalMarks} Marks</p>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${test.score >= 0 ? "text-gray-800" : "text-red-600"}`}>{test.score}/{test.totalMarks}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${test.accuracy >= 70 ? "bg-green-100 text-green-700" : test.accuracy >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {test.accuracy}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">{formatDuration(test.avgTimePerQuestion)}</td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {new Date(test.attemptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">{formatDuration(test.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ============ MAIN DASHBOARD VIEW ============
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{greeting}, {displayName}</h1>
        <p className="text-gray-500 mt-1">Here's your performance overview for today.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-100 rounded-xl"><Clock className="text-purple-600" size={20} /></div>
                <TrendBadge value={analytics?.timeTrend} unit="s" inverted={true} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{formatAvgTime(analytics?.avgTimePerQuestion)}</h3>
              <p className="text-gray-500 text-sm">Avg Time / Question</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-orange-100 rounded-xl"><Flame className="text-orange-500" size={20} /></div>
                {streakData?.currentStreak > 0 && <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">🔥 Active</span>}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{streakData?.currentStreak ?? 0} days</h3>
              <p className="text-gray-500 text-sm">Practice Streak</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 rounded-xl"><Target className="text-blue-600" size={20} /></div>
                <TrendBadge value={analytics?.accuracyTrend} unit="%" inverted={false} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{analytics?.overallAccuracy ?? 0}%</h3>
              <p className="text-gray-500 text-sm">Overall Accuracy</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Score Trend</h2>
                  <p className="text-sm text-gray-500">Overall score across last 10 tests</p>
                </div>
                <button onClick={handleAllInsightsClick} className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 cursor-pointer" type="button">
                  All Insights <ChevronRight size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={scoreTrendData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: "#8B5CF6", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Subject-wise Accuracy</h2>
                  <p className="text-sm text-gray-500">Accuracy breakdown by subject</p>
                </div>
                <button onClick={() => navigate("/analytics")} className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer" type="button">Details</button>
              </div>
              {subjectAccuracyData.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No data yet. Take some tests!</p>
              ) : (
                <div className="space-y-4">
                  {subjectAccuracyData.map((subject) => (
                    <div key={subject.subject}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">{subject.subject}</span>
                        <span className="text-sm font-semibold text-gray-800">{subject.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${subject.accuracy}%`, backgroundColor: subject.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;