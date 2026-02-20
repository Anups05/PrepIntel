import React, { useState } from "react";
import { TrendingUp, AlertTriangle, Clock, Target, ChevronRight, Brain, Zap, BarChart3 } from "lucide-react";

const AIInsights = () => {
  const [activeCategory, setActiveCategory] = useState("performance");
  const [showAllInsights, setShowAllInsights] = useState(false);

  const recommendations = [
    {
      id: 1,
      topic: "Integration by Parts",
      subject: "Math",
      weakness: 78,
      description: "78% weakness score. Prioritize before next test.",
      color: "bg-red-500",
    },
    {
      id: 2,
      topic: "Thermodynamics Laws",
      subject: "Physics",
      weakness: 72,
      description: "72% weakness score. Prioritize before next test.",
      color: "bg-orange-500",
    },
    {
      id: 3,
      topic: "Organic Reactions",
      subject: "Chemistry",
      weakness: 68,
      description: "68% weakness score. Prioritize before next test.",
      color: "bg-yellow-500",
    },
    {
      id: 4,
      topic: "Electrostatics",
      subject: "Physics",
      weakness: 65,
      description: "65% weakness score. Prioritize before next test.",
      color: "bg-blue-500",
    },
  ];

  // Category-specific insights data
  const categoryInsights = {
    performance: {
      title: "Performance Analysis",
      icon: BarChart3,
      color: "bg-purple-500",
      data: {
        overall: "82%",
        trend: "+12%",
        bestSubject: "Mathematics (88%)",
        needsWork: "Chemistry (65%)",
        details: [
          "Mathematics performance improved by 12% in last 4 tests",
          "Physics consistency increased by 8% this week",
          "Average score: 78% across all subjects",
          "Peak performance time: Morning (8-11 AM)",
        ]
      }
    },
    weakness: {
      title: "Weakness Analysis",
      icon: AlertTriangle,
      color: "bg-red-500",
      data: {
        overall: "3 topics critical",
        topWeakness: "Integration by Parts (78%)",
        secondWeakness: "Thermodynamics (72%)",
        thirdWeakness: "Organic Reactions (68%)",
        details: [
          "Integration by Parts - 78% error rate",
          "Thermodynamics Laws - 72% error rate",
          "Organic Reactions - 68% error rate",
          "Electrostatics - 65% error rate",
        ]
      }
    },
    timeMgmt: {
      title: "Time Management",
      icon: Clock,
      color: "bg-blue-500",
      data: {
        overall: "52s avg/question",
        trend: "-3s vs last week",
        timePerSubject: "Math: 45s, Physics: 55s, Chemistry: 58s",
        efficiency: "65% time utilization",
        details: [
          "Average time per question: 52 seconds",
          "Time saved this week: 3 seconds/question",
          "Most time-consuming: Organic Chemistry (75s)",
          "Quickest subject: Mathematics (45s)",
        ]
      }
    },
    strategy: {
      title: "Strategy Recommendations",
      icon: Target,
      color: "bg-green-500",
      data: {
        overall: "3 key focus areas",
        priority1: "Integration by Parts",
        priority2: "Thermodynamics Laws",
        priority3: "Organic Reactions",
        details: [
          "Focus on Integration by Parts - 20 practice questions daily",
          "Revise Thermodynamics Laws with mind maps",
          "Take mixed topic tests to improve time management",
          "Attempt 3 tests per day for next week",
        ]
      }
    }
  };

  const insightCards = [
    { key: "performance", icon: BarChart3, label: "Performance", color: "bg-purple-500" },
    { key: "weakness", icon: AlertTriangle, label: "Weakness", color: "bg-red-500" },
    { key: "timeMgmt", icon: Clock, label: "Time Management", color: "bg-blue-500" },
    { key: "strategy", icon: Target, label: "Strategy", color: "bg-green-500" },
  ];

  const currentInsight = categoryInsights[activeCategory];

  const handleGenerateNewInsight = () => {
    alert("Generating new AI insights based on your latest test data...");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Insights</h1>
        <p className="text-gray-500 mt-1">Personalized analysis powered by AI.</p>
      </div>

      {/* Main Insight Card - Dynamic based on active category */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-purple-200" size={20} />
              <span className="text-purple-200 text-sm font-medium">
                AI {currentInsight.title}
              </span>
            </div>
            <p className="text-purple-100 text-sm mb-4">Based on your last 10 tests</p>
            
            {/* Dynamic content based on category */}
            {activeCategory === "performance" && (
              <>
                <p className="text-2xl font-semibold leading-relaxed max-w-3xl">
                  Your performance in Mathematics has improved by 12% over the last 4 tests. 
                  Focus on Integration and Differential Equations to push above 90% accuracy.
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Overall Score</span>
                    <span className="ml-2 font-bold text-green-300">82%</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Improvement</span>
                    <span className="ml-2 font-bold text-green-300">+12%</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Best Subject</span>
                    <span className="ml-2 font-bold">Math (88%)</span>
                  </div>
                </div>
              </>
            )}

            {activeCategory === "weakness" && (
              <>
                <p className="text-2xl font-semibold leading-relaxed max-w-3xl">
                  You have 3 critical weak areas that need immediate attention. 
                  Integration by Parts shows 78% error rate, followed by Thermodynamics at 72%.
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Critical Topics</span>
                    <span className="ml-2 font-bold text-red-300">3</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Highest Weakness</span>
                    <span className="ml-2 font-bold text-red-300">78%</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Subject</span>
                    <span className="ml-2 font-bold">Mathematics</span>
                  </div>
                </div>
              </>
            )}

            {activeCategory === "timeMgmt" && (
              <>
                <p className="text-2xl font-semibold leading-relaxed max-w-3xl">
                  Your average time per question is 52 seconds, which is 3 seconds faster than last week. 
                  Organic Chemistry takes the most time at 75 seconds per question.
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Avg Time/Q</span>
                    <span className="ml-2 font-bold text-green-300">52s</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Improvement</span>
                    <span className="ml-2 font-bold text-green-300">-3s</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Slowest Subject</span>
                    <span className="ml-2 font-bold">Chemistry (75s)</span>
                  </div>
                </div>
              </>
            )}

            {activeCategory === "strategy" && (
              <>
                <p className="text-2xl font-semibold leading-relaxed max-w-3xl">
                  Based on your performance, focus on Integration by Parts with 20 practice questions daily. 
                  Revise Thermodynamics Laws using mind maps for better retention.
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Priority Topics</span>
                    <span className="ml-2 font-bold">3</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Daily Practice</span>
                    <span className="ml-2 font-bold">20 Qs</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-sm">Target</span>
                    <span className="ml-2 font-bold">3 Tests/Day</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Generate Button */}
          <button 
            onClick={handleGenerateNewInsight}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:shadow-xl transition flex items-center gap-2 whitespace-nowrap"
          >
            <Zap size={18} />
            Generate New Insight
          </button>
        </div>
      </div>

      {/* Insight Categories - Now Working */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {insightCards.map((card) => (
          <div
            key={card.key}
            onClick={() => setActiveCategory(card.key)}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
              activeCategory === card.key
                ? "border-purple-500"
                : "border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="text-white" size={20} />
              </div>
              <ChevronRight className="text-gray-400" size={18} />
            </div>
            <h3 className="font-semibold text-gray-800">{card.label}</h3>
            <p className="text-xs text-gray-500 mt-1">Click to analyze</p>
          </div>
        ))}
      </div>

      {/* Category Details Section - Shows when category is clicked */}
      {activeCategory && (
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`${categoryInsights[activeCategory].color} p-2 rounded-lg`}>
              {(() => {
                const IconComponent = categoryInsights[activeCategory].icon;
                return <IconComponent className="text-white" size={18} />;
              })()}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {categoryInsights[activeCategory].title} Details
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {categoryInsights[activeCategory].data.details.map((detail, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Recommendations</h2>
        
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Subject Badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${rec.color}`}>
                  {rec.subject.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{rec.topic}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{rec.weakness}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rec.color}`}
                      style={{ width: `${rec.weakness}%` }}
                    />
                  </div>
                  
                  {/* Subject Tag */}
                  <div className="mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {rec.subject} - {rec.weakness}% weakness score. Prioritize before next test.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Insights Link */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-purple-600" />
          <p className="text-gray-700">
            <span className="font-medium">All Insights: </span>
            Your performance in Mathematics has improved by 12% over the last 4 tests. Focus on Integration and Differential Equations to push above 90% accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;