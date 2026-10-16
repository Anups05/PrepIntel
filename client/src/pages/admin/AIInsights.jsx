import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Zap,
  Target,
  ChevronRight,
  RefreshCw,
  Award,
  Loader2
} from "lucide-react";
import { getAIInsights } from "../../services/testService";

const AIInsights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAIInsights();
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setError(err.response?.data?.message || "Failed to generate AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Brain className="text-white" size={36} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="text-purple-600 animate-spin" size={18} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI is Analyzing Your Data</h3>
        <p className="text-gray-500 text-sm max-w-md text-center">
          Crunching student performance, test scores, topic-level accuracy, and batch trends to generate personalized insights...
        </p>
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Generate Insights</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-md text-center">{error}</p>
        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) return null;

  const { summary, atRiskStudents, weakClusters, recommendations, riskDistribution, topPerformers, aiNarrative } = insights;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Insights</h1>
          <p className="text-gray-500 mt-1">AI-powered analytics and recommendations</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
          Generate New Insights
        </button>
      </div>

      {/* AI Narrative Banner */}
      {aiNarrative && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-start gap-3">
            <Brain className="text-purple-200 mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-2">AI Analysis Summary</p>
              <p className="text-lg leading-relaxed">{aiNarrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{summary.atRiskCount}</h3>
          </div>
          <p className="text-sm text-gray-500">At-Risk Students</p>
          {summary.atRiskTrend && (
            <p className={`text-xs mt-1 ${summary.atRiskTrend.startsWith('+') || summary.atRiskTrend.startsWith('↑') ? 'text-red-600' : 'text-green-600'}`}>
              {summary.atRiskTrend.startsWith('+') || summary.atRiskTrend.startsWith('↑') ? '↑' : '↓'} {summary.atRiskTrend} from last period
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingDown className="text-yellow-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{summary.decliningBatches}</h3>
          </div>
          <p className="text-sm text-gray-500">Declining Areas</p>
          <p className="text-xs text-yellow-600 mt-1">Need attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="text-purple-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{summary.weakTopicCount}</h3>
          </div>
          <p className="text-sm text-gray-500">Weak Topics</p>
          <p className="text-xs text-purple-600 mt-1">Across platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{summary.recommendationCount}</h3>
          </div>
          <p className="text-sm text-gray-500">AI Recommendations</p>
          <p className="text-xs text-green-600 mt-1">{summary.highPriorityCount} high priority</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* At-Risk Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">At-Risk Students</h3>
            <span className="text-xs text-gray-400">Needs attention</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {atRiskStudents.length > 0 ? atRiskStudents.map((student, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.batch}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-red-600 font-medium">{student.decline}</span>
                    <span className="text-xs text-gray-400">{student.reason}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{student.accuracy}%</span>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-8">No at-risk students detected</p>
            )}
          </div>
          <button
            onClick={() => navigate('/admin/students', {
              state: { atRiskNames: atRiskStudents.map(s => s.name) }
            })}
            className="w-full mt-4 text-center text-sm text-purple-600 hover:underline"
          >
            View All At-Risk Students
          </button>
        </div>

        {/* Weak Topic Clusters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Weak Topic Clusters</h3>
            <span className="text-xs text-gray-400">Platform-wide</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {weakClusters.length > 0 ? weakClusters.map((cluster, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-medium text-gray-800">{cluster.topic}</p>
                    <p className="text-xs text-gray-400">{Array.isArray(cluster.subjects) ? cluster.subjects.join(", ") : cluster.subjects}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{cluster.avgError}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{cluster.students} students</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${cluster.avgError}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-8">No weak topics detected</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics & Actions Bottom Section */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Risk Distribution by Batch</h3>
              <p className="text-sm text-gray-500">Visual mapping of student risk levels</p>
            </div>
          </div>
          {riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="lowRisk" name="Low Risk" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="mediumRisk" name="Medium Risk" stackId="a" fill="#F59E0B" />
                <Bar dataKey="highRisk" name="High Risk" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-16">No risk distribution data available</p>
          )}
        </div>

        {/* AI Recommendations Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">AI Recommendations</h3>
              <p className="text-sm text-gray-500">Suggested interventions based on data analytics</p>
            </div>
            <Zap className="text-purple-600" size={20} />
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-xl border ${rec.priority === "High" ? "border-red-200 bg-red-50" :
                rec.priority === "Medium" ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${rec.priority === "High" ? "bg-red-200 text-red-700" :
                    rec.priority === "Medium" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-700"
                    }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-8">No recommendations available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Top Performers</h3>
              <p className="text-sm text-gray-500">Students excelling across the platform</p>
            </div>
            <Award className="text-yellow-500" size={20} />
          </div>
          <div className="grid grid-cols-5 gap-4">
            {topPerformers.map((student, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                  {index + 1}
                </div>
                <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                <p className="text-xs text-gray-500">{student.batch}</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{student.accuracy}%</p>
                {student.streak > 0 && (
                  <p className="text-xs text-orange-600">🔥 {student.streak}-day streak</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div >
  );
};

export default AIInsights;