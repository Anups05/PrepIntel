import React from "react";
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";

const Streak = () => {
  // Streak data
  const currentStreak = 14;
  const largestStreak = 21;
  const averageStreak = 17;
  const activeDays = 51;

  // Generate heatmap data (7 days x 20 weeks)
  const generateHeatmapData = () => {
    const weeks = 20;
    const days = 7;
    const data = [];
    
    for (let day = 0; day < days; day++) {
      const weekData = [];
      for (let week = 0; week < weeks; week++) {
        // Random activity level (0-3)
        const rand = Math.random();
        if (rand < 0.3) weekData.push(0); // No activity
        else if (rand < 0.6) weekData.push(1); // Low activity
        else if (rand < 0.8) weekData.push(2); // Medium activity
        else weekData.push(3); // High activity
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  // Get color based on activity level
  const getHeatColor = (value) => {
    switch(value) {
      case 0: return "bg-gray-200";
      case 1: return "bg-purple-200";
      case 2: return "bg-purple-400";
      case 3: return "bg-purple-600";
      default: return "bg-gray-200";
    }
  };

  // Month labels for heatmap (every 4 weeks)
  const monthLabels = [
    { week: 2, label: "Aug" },
    { week: 6, label: "Sep" },
    { week: 10, label: "Oct" },
    { week: 14, label: "Nov" },
    { week: 18, label: "Dec" },
  ];

  // Day labels
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Practice Streak</h1>
        <p className="text-gray-500 mt-1">Your consistency drives success.</p>
      </div>

      {/* Main Streak Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-xl">
              <Flame size={32} className="text-white" />
            </div>
            <div>
              <div className="text-6xl font-bold">{currentStreak}</div>
              <p className="text-purple-100 mt-1 text-lg">Day Streak</p>
            </div>
          </div>
          
          <p className="text-purple-100 text-lg">Bring your best on and off</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Largest Streak */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Trophy className="text-yellow-600" size={20} />
            </div>
            <h3 className="text-sm text-gray-500">Largest Streak</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{largestStreak}</p>
          <p className="text-xs text-gray-400 mt-1">days</p>
        </div>

        {/* Average Streak */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="text-sm text-gray-500">Average Streak</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{averageStreak}</p>
          <p className="text-xs text-gray-400 mt-1">days</p>
        </div>

        {/* Active Days */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <h3 className="text-sm text-gray-500">Active Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeDays}</p>
          <p className="text-xs text-gray-400 mt-1">total days</p>
        </div>
      </div>

      {/* Activity Heatmap Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Activity Heatmap</h2>
            <p className="text-sm text-gray-500">Last 20 weeks</p>
          </div>
        </div>

        {/* Month labels */}
        <div className="flex ml-24 mb-2">
          {Array.from({ length: 20 }).map((_, index) => {
            const monthLabel = monthLabels.find(m => m.week === index);
            return (
              <div key={index} className="text-xs text-gray-400 w-4 text-center">
                {monthLabel ? monthLabel.label : ""}
              </div>
            );
          })}
        </div>

        {/* Heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-4 text-xs text-gray-400">
            {dayLabels.map((day, index) => (
              <span key={index} className="h-4 mb-1">{day}</span>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {/* Weeks */}
              {Array.from({ length: 20 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {/* Days */}
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-4 h-4 rounded-sm ${getHeatColor(heatmapData[dayIndex]?.[weekIndex] || 0)}`}
                      title={`Week ${weekIndex + 1}, ${dayLabels[dayIndex]}: Activity level ${heatmapData[dayIndex]?.[weekIndex] || 0}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-6 text-xs text-gray-400 gap-3">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-200 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-400 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Streak;