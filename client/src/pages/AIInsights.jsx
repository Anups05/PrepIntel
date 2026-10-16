import React, { useState, useEffect } from "react";
import {
  Brain,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  RefreshCw,
  Loader2,
  Award,
  BookOpen
} from "lucide-react";
import { getStudentAIInsights } from "../services/testService";

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getStudentAIInsights();
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setError(err.response?.data?.message || "Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center py-32">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Brain className="text-white" size={36} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="text-purple-600 animate-spin" size={18} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI is Analyzing Your Performance</h3>
        <p className="text-gray-500 text-sm max-w-md text-center">
          Reviewing your test scores, subject accuracy, weak topics, and time management to generate personalized insights...
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
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center py-32">
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

  const { performanceSummary, weakTopics, subjectBreakdown, timeManagement, studyStrategy, scoreAnalysis, aiNarrative } = insights;

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Average': return 'text-yellow-600 bg-yellow-100';
      case 'Needs Improvement': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving' || (typeof trend === 'string' && trend.startsWith('+'))) {
      return <TrendingUp size={14} className="text-green-500" />;
    }
    if (trend === 'declining' || (typeof trend === 'string' && trend.startsWith('-'))) {
      return <TrendingDown size={14} className="text-red-500" />;
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Insights</h1>
          <p className="text-gray-500 mt-1">Personalized analysis powered by AI</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          Generate New Insight
        </button>
      </div>

      {/* AI Narrative Banner */}
      {aiNarrative && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-start gap-3">
            <Brain className="text-purple-200 mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-2">Your AI Analysis</p>
              <p className="text-lg leading-relaxed">{aiNarrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{performanceSummary.overallAccuracy || 0}%</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">Overall Accuracy</p>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(performanceSummary.accuracyTrend)}
            <span className={`text-xs ${performanceSummary.accuracyTrend?.startsWith('+') ? 'text-green-600' : performanceSummary.accuracyTrend?.startsWith('-') ? 'text-red-600' : 'text-gray-400'}`}>
              {performanceSummary.accuracyTrend || 'stable'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{performanceSummary.testsTaken || 0}</h3>
          </div>
          <p className="text-sm text-gray-500">Tests Taken</p>
          {performanceSummary.overallVerdict && (
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getVerdictColor(performanceSummary.overallVerdict)}`}>
              {performanceSummary.overallVerdict}
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{performanceSummary.strongestSubjectAccuracy || 0}%</h3>
          </div>
          <p className="text-sm text-gray-500">Strongest Subject</p>
          <p className="text-xs text-green-600 mt-1">{performanceSummary.strongestSubject || '—'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{performanceSummary.weakestSubjectAccuracy || 0}%</h3>
          </div>
          <p className="text-sm text-gray-500">Weakest Subject</p>
          <p className="text-xs text-red-600 mt-1">{performanceSummary.weakestSubject || '—'}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Subject Breakdown */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-800">Subject Performance</h3>
          </div>
          <div className="space-y-4">
            {subjectBreakdown.length > 0 ? subjectBreakdown.map((subject, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{subject.subject}</p>
                    {getTrendIcon(subject.trend)}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{subject.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mb-1">
                  <div
                    className={`h-2 rounded-full ${subject.accuracy >= 70 ? 'bg-green-500' : subject.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{subject.tip}</p>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-6">No subject data yet</p>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-semibold text-gray-800">Weak Topics</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {weakTopics.length > 0 ? weakTopics.map((topic, index) => (
              <div key={index} className={`p-3 rounded-lg ${topic.priority === 'High' ? 'bg-red-50 border border-red-100' : topic.priority === 'Medium' ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800 text-sm">{topic.topic}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${topic.priority === 'High' ? 'bg-red-200 text-red-700' : topic.priority === 'Medium' ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                    {topic.errorRate}% errors
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{topic.subject}</p>
                <p className="text-xs text-gray-600">{topic.suggestion}</p>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-6">No weak topics detected</p>
            )}
          </div>
        </div>

        {/* Time Management */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-800">Time Management</h3>
          </div>
          {timeManagement.avgTimePerQ ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{timeManagement.avgTimePerQ}s</p>
                <p className="text-sm text-gray-500 mt-1">Avg. time per question</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{timeManagement.fastestTime}s</p>
                  <p className="text-xs text-gray-500">{timeManagement.fastestSubject}</p>
                  <p className="text-xs text-green-600">Fastest</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-orange-600">{timeManagement.slowestTime}s</p>
                  <p className="text-xs text-gray-500">{timeManagement.slowestSubject}</p>
                  <p className="text-xs text-orange-600">Slowest</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{timeManagement.advice}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No time data yet</p>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Study Strategy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-green-600" size={20} />
            <h3 className="font-semibold text-gray-800">Study Strategy</h3>
          </div>
          <div className="space-y-3">
            {studyStrategy.length > 0 ? studyStrategy.map((strategy, index) => (
              <div key={index} className={`p-4 rounded-xl border ${strategy.priority === 'High' ? 'border-red-200 bg-red-50' : strategy.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${strategy.priority === 'High' ? 'bg-red-200 text-red-700' : strategy.priority === 'Medium' ? 'bg-yellow-200 text-yellow-700' : 'bg-green-200 text-green-700'}`}>
                    {strategy.priority}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 mt-2 mb-1">{strategy.title}</h4>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-6">No strategies available yet</p>
            )}
          </div>
        </div>

        {/* Score Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-800">Score Analysis</h3>
          </div>
          {scoreAnalysis.avgScore !== undefined ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{scoreAnalysis.avgScore}</p>
                  <p className="text-sm text-gray-500 mt-1">Average Score</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{scoreAnalysis.bestTestScore ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-1">Best Score</p>
                </div>
              </div>
              {scoreAnalysis.bestTestName && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Best Performance In</p>
                  <p className="text-sm font-medium text-gray-800">{scoreAnalysis.bestTestName}</p>
                </div>
              )}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-xs text-gray-500">Recent Trend</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {getTrendIcon(scoreAnalysis.recentTrend)}
                    <p className="text-sm font-medium text-gray-800 capitalize">{scoreAnalysis.recentTrend}</p>
                  </div>
                </div>
                {scoreAnalysis.projectedScore && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Projected</p>
                    <p className="text-sm font-bold text-purple-600">{scoreAnalysis.projectedScore}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No score data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;